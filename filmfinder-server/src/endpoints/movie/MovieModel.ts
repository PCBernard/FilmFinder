export interface Movie {
  id: number;            // TMDB-ID
  title: string;
  overview: string;
  releaseYear: number | null;
  rating: number;        // TMDB vote_average (0-10)
  posterUrl: string | null;
  genreIds: number[];
}

// Kriterien, die später die KI aus dem Nutzertext erzeugt.
// In Meilenstein 1 kommen sie aus normalen Query-Parametern.
export interface SearchCriteria {
  genreIds?: number[];
  personName?: string;
  minRating?: number;
}
