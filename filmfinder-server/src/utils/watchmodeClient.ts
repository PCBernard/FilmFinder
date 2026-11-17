const BASE = "https://api.watchmode.com/v1";
const TTL = 24 * 60 * 60 * 1000;   // Free-Tier schonen: Ergebnisse 24 h zwischenspeichern

export interface Source {
  source_id: number;
  name: string;
  type: "sub" | "rent" | "buy" | "free" | string;
  price: number | null;
}

export interface Availability {
  status: "stream" | "rentbuy" | "none" | "unknown";
  onMyServices: string[];                                   // Abos des Nutzers, bei denen der Film läuft
  otherServices: string[];                                  // Abos, die der Nutzer nicht hat
  rentBuy: { name: string; type: string; price: number | null }[];
}

export const UNKNOWN: Availability = { status: "unknown", onMyServices: [], otherServices: [], rentBuy: [] };

// Zuordnung der Profil-Dienste zu den Anbieternamen von Watchmode
const PATTERNS: Record<string, RegExp> = {
  netflix: /netflix/i, prime: /^(prime video|amazon prime)/i, apple: /apple tv/i, mubi: /mubi/i,
  disney: /disney/i, wow: /wow|sky/i, paramount: /paramount/i, joyn: /joyn/i,
};

const cache = new Map<number, { at: number; sources: Source[] }>();

async function wm<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = process.env.WATCHMODE_API_KEY;
  if (!key) throw new Error("WATCHMODE_API_KEY fehlt (.env)");
  const url = new URL(BASE + path);
  url.searchParams.set("apiKey", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  console.log("[Watchmode]", url.toString().replace(key, "***"));   
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Watchmode ${res.status} bei ${path}`);
  return (await res.json()) as T;
}

export async function getSources(tmdbId: number): Promise<Source[]> {
  const hit = cache.get(tmdbId);
  if (hit && Date.now() - hit.at < TTL) {
    console.log("[Watchmode] Cache-Treffer für TMDB-ID", tmdbId);
    return hit.sources;
  }
  let sources: Source[];
  try {
    sources = await wm<Source[]>(`/title/movie-${tmdbId}/sources/`, { regions: "DE" });
  } catch {
    // Fallback: erst Watchmode-ID über die TMDB-ID suchen
    const s = await wm<{ title_results: { id: number }[] }>("/search/", {
      search_field: "tmdb_movie_id", search_value: String(tmdbId),
    });
    const id = s.title_results[0]?.id;
    sources = id ? await wm<Source[]>(`/title/${id}/sources/`, { regions: "DE" }) : [];
  }
  cache.set(tmdbId, { at: Date.now(), sources });
  return sources;
}

export function computeAvailability(
  sources: Source[],
  profile: { services: string[]; allowBuyOrRent: boolean; maxRentPrice: number },
): Availability {
  
  const mine = profile.services.map((s) => PATTERNS[s]).filter(Boolean);
  const subs = [...new Set(sources.filter((s) => s.type === "sub").map((s) => s.name))];
  const isChannel = (n: string) => /channel|\bvia\b/i.test(n);   // z. B. "MAX (Via Amazon Prime)"
  const onMyServices = subs.filter((n) => !isChannel(n) && mine.some((re) => re.test(n)));
  const otherServices = subs.filter((n) => !onMyServices.includes(n));
  const rentBuy = profile.allowBuyOrRent
    ? sources.filter((s) => (s.type === "rent" || s.type === "buy") && (s.price == null || s.price <= profile.maxRentPrice))
        .map((s) => ({ name: s.name, type: s.type, price: s.price }))
    : [];
  const status = onMyServices.length ? "stream" : rentBuy.length ? "rentbuy" : "none";
  return { status, onMyServices, otherServices, rentBuy };
}
