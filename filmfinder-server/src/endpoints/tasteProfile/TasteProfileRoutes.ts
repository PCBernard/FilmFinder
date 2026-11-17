import { Router, type Response } from "express";
import { requireAuth, type AuthRequest } from "../authentication/AuthenticationService";
import {
  addMovie, getExpandedProfile, isMovieList, removeMovie, updateSettings,
} from "./TasteProfileService";

export const tasteProfileRouter = Router();
tasteProfileRouter.use(requireAuth);

function fail(res: Response, e: unknown) {
  console.error(e);
  res.status(500).json({ error: "Interner Fehler" });
}

// GET /profile  -> Profil mit Filmdetails und Postern
tasteProfileRouter.get("/", async (req: AuthRequest, res) => {
  try {
    res.json(await getExpandedProfile(req.userId!));
  } catch (e) {
    fail(res, e);
  }
});

// POST /profile/movies { list: "favoriteMovies" | "likedMovies" | "dislikedMovies" | "watchedMovies", movieId }
tasteProfileRouter.post("/movies", async (req: AuthRequest, res) => {
  const { list, movieId } = req.body ?? {};
  if (!isMovieList(list) || !Number.isInteger(movieId)) {
    return res.status(400).json({ error: "list oder movieId ungültig" });
  }
  try {
    await addMovie(req.userId!, list, movieId);
    res.status(204).end();
  } catch (e) {
    fail(res, e);
  }
});

// DELETE /profile/movies/:list/:movieId
tasteProfileRouter.delete("/movies/:list/:movieId", async (req: AuthRequest, res) => {
  const movieId = Number(req.params.movieId);
  if (!isMovieList(req.params.list) || !Number.isInteger(movieId)) {
    return res.status(400).json({ error: "list oder movieId ungültig" });
  }
  try {
    await removeMovie(req.userId!, req.params.list, movieId);
    res.status(204).end();
  } catch (e) {
    fail(res, e);
  }
});

// PUT /profile/settings { favoritePeople?, dislikedGenres?, services?, allowBuyOrRent? }
tasteProfileRouter.put("/settings", async (req: AuthRequest, res) => {
  try {
    await updateSettings(req.userId!, req.body ?? {});
    res.status(204).end();
  } catch (e) {
    fail(res, e);
  }
});
