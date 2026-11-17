import {
  MOVIE_LISTS, SERVICES, TasteProfile,
  type MovieList, type StreamingService, type TasteProfileData,
} from "./TasteProfileModel";
import { getMoviesByIds } from "../movie/MovieService";

// Gegenseitig ausschließende Bewertungen
const RATING_LISTS: MovieList[] = ["favoriteMovies", "likedMovies", "dislikedMovies"];

export function isMovieList(x: unknown): x is MovieList {
  return typeof x === "string" && (MOVIE_LISTS as readonly string[]).includes(x);
}

export async function getOrCreateProfile(userId: string): Promise<TasteProfileData> {
  const doc = await TasteProfile.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true },
  ).lean();
  return doc as TasteProfileData;
}

// Profil inkl. Filmdetails (Titel, Poster) für die Profilseite
export async function getExpandedProfile(userId: string) {
  const p = await getOrCreateProfile(userId);
  const lists = await Promise.all(MOVIE_LISTS.map((l) => getMoviesByIds(p[l])));
  const expanded = Object.fromEntries(MOVIE_LISTS.map((l, i) => [l, lists[i]]));
  const { userId: _u, ...rest } = p as unknown as Record<string, unknown>;
  return { ...rest, ...expanded };
}

export async function addMovie(userId: string, list: MovieList, movieId: number) {
  await getOrCreateProfile(userId);
  const update: Record<string, unknown> = { $addToSet: { [list]: movieId } };
  if (RATING_LISTS.includes(list)) {
    const others = RATING_LISTS.filter((l) => l !== list);
    update.$pull = Object.fromEntries(others.map((l) => [l, movieId]));
  }
  await TasteProfile.updateOne({ userId }, update);
}

export async function removeMovie(userId: string, list: MovieList, movieId: number) {
  await TasteProfile.updateOne({ userId }, { $pull: { [list]: movieId } });
}

export interface SettingsInput {
  favoritePeople?: string[];
  dislikedGenres?: number[];
  services?: StreamingService[];
  allowBuyOrRent?: boolean;
  dealbreakers?: string[];
  maxRentPrice?: number;
  minCriticScore?: number;
  festivalPreferred?: boolean;
  originalVersion?: boolean;
}

export async function updateSettings(userId: string, input: SettingsInput) {
  const set: Partial<TasteProfileData> = {};
  if (Array.isArray(input.favoritePeople)) {
    set.favoritePeople = input.favoritePeople.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim());
  }
  if (Array.isArray(input.dislikedGenres)) {
    set.dislikedGenres = input.dislikedGenres.filter(Number.isInteger);
  }
  if (Array.isArray(input.services)) {
    set.services = input.services.filter((s) => (SERVICES as readonly string[]).includes(s));
  }
  if (typeof input.allowBuyOrRent === "boolean") set.allowBuyOrRent = input.allowBuyOrRent;
  if (Array.isArray(input.dealbreakers)) set.dealbreakers = input.dealbreakers.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim());
  if (typeof input.maxRentPrice === "number") set.maxRentPrice = input.maxRentPrice;
  if (typeof input.minCriticScore === "number") set.minCriticScore = input.minCriticScore;
  if (typeof input.festivalPreferred === "boolean") set.festivalPreferred = input.festivalPreferred;
  if (typeof input.originalVersion === "boolean") set.originalVersion = input.originalVersion;
  await TasteProfile.updateOne({ userId }, { $set: set }, { upsert: true });
}
