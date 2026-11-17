"use client";
import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("ff_token"));
export const setToken = (t: string | null) => (t ? localStorage.setItem("ff_token", t) : localStorage.removeItem("ff_token"));

export async function api<T = any>(path: string, method = "GET", body?: unknown): Promise<T> {
  const t = getToken();
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && t && !path.startsWith("/authentication")) { setToken(null); location.href = "/login"; }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Fehler ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export interface Movie { id: number; title: string; overview: string; releaseYear: number | null; rating: number; posterUrl: string | null; genreIds: number[] }
export type MovieList = "favoriteMovies" | "likedMovies" | "dislikedMovies" | "watchedMovies" | "watchlist";
export interface Profile {
  favoriteMovies: Movie[]; likedMovies: Movie[]; dislikedMovies: Movie[]; watchedMovies: Movie[]; watchlist: Movie[];
  favoritePeople: string[]; dislikedGenres: number[]; dealbreakers: string[]; services: string[];
  allowBuyOrRent: boolean; maxRentPrice: number; minCriticScore: number; festivalPreferred: boolean; originalVersion: boolean;
}
export const GENRES: [string, number][] = [["Action", 28], ["Komödie", 35], ["Krimi", 80], ["Drama", 18], ["Horror", 27], ["Thriller", 53], ["Sci-Fi", 878], ["Fantasy", 14], ["Liebesfilm", 10749], ["Animation", 16]];

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(() => api<Profile>("/profile").then(setProfile).catch((e) => setError(e.message)), []);
  useEffect(() => { reload(); }, [reload]);
  const save = async (patch: Partial<Record<keyof Profile, unknown>>) => {
    setProfile((p) => (p ? { ...p, ...patch } as Profile : p));   // optimistisch
    await api("/profile/settings", "PUT", patch).catch((e) => setError(e.message));
  };
  const addMovie = async (list: MovieList, id: number) => { await api("/profile/movies", "POST", { list, movieId: id }); await reload(); };
  const removeMovie = async (list: MovieList, id: number) => { await api(`/profile/movies/${list}/${id}`, "DELETE"); await reload(); };
  return { profile, error, reload, save, addMovie, removeMovie };
}

export interface Availability {
  status: "stream" | "rentbuy" | "none" | "unknown";
  onMyServices: string[]; otherServices: string[];
  rentBuy: { name: string; type: string; price: number | null }[];
}
export type Result = Movie & { availability: Availability };
