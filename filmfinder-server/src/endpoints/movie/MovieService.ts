import { tmdb, posterUrl } from "../../utils/tmdbClient";
import type { Movie } from "./MovieModel";

type RawMovie = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  vote_average: number;
  poster_path: string | null;
  genre_ids?: number[];            // in Listen-Antworten
  genres?: { id: number }[];       // in Detail-Antworten
};

export function toMovie(m: RawMovie): Movie {
  const year = m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : NaN;
  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    releaseYear: Number.isNaN(year) ? null : year,
    rating: m.vote_average,
    posterUrl: posterUrl(m.poster_path),
    genreIds: m.genre_ids ?? m.genres?.map((g) => g.id) ?? [],
  };
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await tmdb<{ results: RawMovie[] }>("/search/movie", {
    query,
    include_adult: "false",
  });
  return data.results.map(toMovie);
}

export async function getMovieDetails(id: number): Promise<Movie> {
  return toMovie(await tmdb<RawMovie>(`/movie/${id}`));
}

export async function getMoviesByIds(ids: number[]): Promise<Movie[]> {
  const results = await Promise.allSettled(ids.map(getMovieDetails));
  return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
}

export async function findPersonId(name: string): Promise<number | null> {
  const data = await tmdb<{ results: { id: number }[] }>("/search/person", { query: name });
  return data.results[0]?.id ?? null;
}

export async function discoverMovies(params: Record<string, string>): Promise<Movie[]> {
  const data = await tmdb<{ results: RawMovie[] }>("/discover/movie", params);
  return data.results.map(toMovie);
}
