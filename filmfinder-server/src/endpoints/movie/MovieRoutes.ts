import { Router } from "express";
import { searchMovies } from "./MovieService";

export const movieRouter = Router();

// GET /movies/search?q=Der Pate
movieRouter.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.status(400).json({ error: "Parameter q fehlt" });
  try {
    res.json(await searchMovies(q));
  } catch (e) {
    res.status(502).json({ error: (e as Error).message });
  }
});
