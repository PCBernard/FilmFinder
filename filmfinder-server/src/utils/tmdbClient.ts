const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

export async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_ACCESS_TOKEN fehlt (.env)");
  const url = new URL(BASE + path);
  url.searchParams.set("language", "de-DE");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  console.log("[TMDB]", url.toString());
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} bei ${path}`);
  return (await res.json()) as T;
}

export function posterUrl(path: string | null | undefined): string | null {
  return path ? IMG + path : null;
}

// Genre-IDs von TMDB (für die spätere KI-Filterung nützlich)
export const GENRES: Record<string, number> = {
  action: 28, abenteuer: 12, animation: 16, komödie: 35, krimi: 80,
  dokumentarfilm: 99, drama: 18, fantasy: 14, horror: 27, mystery: 9648,
  liebesfilm: 10749, scifi: 878, thriller: 53, krieg: 10752,
};
