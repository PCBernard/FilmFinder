import type { Movie } from "../endpoints/movie/MovieModel";
import type { TasteProfileData } from "../endpoints/tasteProfile/TasteProfileModel";

type ProfileFilter = Pick<TasteProfileData, "dislikedMovies" | "watchedMovies" | "dislikedGenres">;

// Entfernt Filme, die der Nutzer nicht mag, schon gesehen hat
// oder deren Genre er ausgeschlossen hat.
export function applyProfile(movies: Movie[], profile: ProfileFilter): Movie[] {
  const blocked = new Set([...profile.dislikedMovies, ...profile.watchedMovies]);
  return movies.filter(
    (m) =>
      !blocked.has(m.id) &&
      !m.genreIds.some((g) => profile.dislikedGenres.includes(g)),
  );
}
