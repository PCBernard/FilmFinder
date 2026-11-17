import type { Movie, SearchCriteria } from "../movie/MovieModel";
import { discoverMovies, findPersonId } from "../movie/MovieService";
import { computeAvailability, getSources, UNKNOWN, type Availability } from "../../utils/watchmodeClient";
import { GENRES } from "../../utils/tmdbClient";
import { applyProfile } from "../../utils/applyProfile";
import { getOrCreateProfile } from "../tasteProfile/TasteProfileService";

// Holt Kandidaten von TMDB. In Meilenstein 2 erzeugt die KI die SearchCriteria
// aus dem Nutzertext, danach folgt der Watchmode-Check für die Streamingdienste.
export async function getCandidates(c: SearchCriteria): Promise<Movie[]> {
  const params: Record<string, string> = {
    sort_by: "vote_average.desc",
    "vote_count.gte": "300",   // verhindert Exoten mit 10/10 bei 3 Stimmen
    include_adult: "false",
  };
  if (c.genreIds?.length) params.with_genres = c.genreIds.join(",");
  if (c.minRating) params["vote_average.gte"] = String(c.minRating);
  if (c.personName) {
    const id = await findPersonId(c.personName);
    if (id) params.with_cast = String(id);
  }
  return discoverMovies(params);
}

export async function recommend(userId: string, criteria: SearchCriteria, limit = 10): Promise<Movie[]> {
  const profile = await getOrCreateProfile(userId);
  const candidates = await getCandidates(criteria);
  return applyProfile(candidates, profile).slice(0, limit);
}

// Platzhalter für das Sprachmodell (Meilenstein 2): einfache Stichwort-Erkennung im Nutzertext.
const SYNONYMS: Record<string, string> = {
  witzig: "komödie", lustig: "komödie", spannend: "thriller",
  gruselig: "horror", romantisch: "liebesfilm", "sci-fi": "scifi",
};

export async function chat(userId: string, message: string) {
  const text = message.toLowerCase();
  const words: Record<string, number> = { ...GENRES };
  for (const [k, v] of Object.entries(SYNONYMS)) words[k] = GENRES[v];
  const include = new Set<number>();
  const exclude = new Set<number>();
  for (const [word, id] of Object.entries(words)) {
    if (!text.includes(word)) continue;
    const neg = new RegExp(`(kein\\w*|ohne|nicht)\\s+(\\w+\\s+)?[\\w-]*${word}`).test(text);
    (neg ? exclude : include).add(id);
  }
  const person = message.match(/mit ([A-ZÄÖÜ][\wäöüß.'-]+(?: [A-ZÄÖÜ][\wäöüß.'-]+)+)/)?.[1];
  const profile = await getOrCreateProfile(userId);
  const candidates = await getCandidates({
    genreIds: [...include].filter((g) => !exclude.has(g)),
    personName: person,
    minRating: profile.minCriticScore / 10,
  });
  const movies = applyProfile(
    candidates.filter((m) => !m.genreIds.some((g) => exclude.has(g))),
    profile,
  ).slice(0, 4);
  const reply = movies.length
    ? `Ich habe ${movies.length} Filme gefunden, die zu deinem Profil passen.`
    : "Dazu habe ich nichts Passendes gefunden. Versuch es mit einem anderen Genre oder Schauspieler.";
  return { reply, movies };
}

// Ablauf: TMDB liefert Kandidaten, danach prüft Watchmode nur für diese wenigen Filme,
// ob sie bei den Diensten des Nutzers laufen.
export type MovieWithAvailability = Movie & { availability: Availability };
const RANK = { stream: 0, rentbuy: 1, unknown: 2, none: 3 };

export async function searchWithAvailability(
  userId: string, criteria: SearchCriteria, onlyAvailable = false, limit = 8,
): Promise<MovieWithAvailability[]> {
  const profile = await getOrCreateProfile(userId);
  const candidates = applyProfile(
    await getCandidates({ ...criteria, minRating: criteria.minRating ?? profile.minCriticScore / 10 }),
    profile,
  ).slice(0, 12);
  const checked = await Promise.all(candidates.map(async (m) => {
    try {
      return { ...m, availability: computeAvailability(await getSources(m.id), profile) };
    } catch (e) {
      console.warn("Watchmode:", (e as Error).message);
      return { ...m, availability: UNKNOWN };
    }
  }));
  checked.sort((a, b) => RANK[a.availability.status] - RANK[b.availability.status]);
  return (onlyAvailable ? checked.filter((m) => m.availability.status !== "none") : checked).slice(0, limit);
}
