import { Schema, model, Types } from "mongoose";

export const SERVICES = ["netflix", "prime", "apple", "mubi", "disney", "wow", "paramount", "joyn", "other"] as const;
export type StreamingService = (typeof SERVICES)[number];

export const MOVIE_LISTS = ["favoriteMovies", "likedMovies", "dislikedMovies", "watchedMovies", "watchlist"] as const;
export type MovieList = (typeof MOVIE_LISTS)[number];

export interface TasteProfileData {
  userId: Types.ObjectId;
  favoriteMovies: number[];   // TMDB-IDs
  likedMovies: number[];
  dislikedMovies: number[];
  watchedMovies: number[];
  favoritePeople: string[];   // Schauspieler/Regisseure
  dislikedGenres: number[];   // TMDB-Genre-IDs
  services: StreamingService[];
  allowBuyOrRent: boolean;
  watchlist: number[];
  dealbreakers: string[];
  maxRentPrice: number;
  minCriticScore: number;
  festivalPreferred: boolean;
  originalVersion: boolean;
}

const tasteProfileSchema = new Schema<TasteProfileData>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    favoriteMovies: { type: [Number], default: [] },
    likedMovies: { type: [Number], default: [] },
    dislikedMovies: { type: [Number], default: [] },
    watchedMovies: { type: [Number], default: [] },
    favoritePeople: { type: [String], default: [] },
    dislikedGenres: { type: [Number], default: [] },
    services: { type: [String], enum: SERVICES, default: [] },
    allowBuyOrRent: { type: Boolean, default: false },
    watchlist: { type: [Number], default: [] },
    dealbreakers: { type: [String], default: [] },
    maxRentPrice: { type: Number, default: 4.99 },
    minCriticScore: { type: Number, default: 75 },
    festivalPreferred: { type: Boolean, default: false },
    originalVersion: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const TasteProfile = model<TasteProfileData>("TasteProfile", tasteProfileSchema);
