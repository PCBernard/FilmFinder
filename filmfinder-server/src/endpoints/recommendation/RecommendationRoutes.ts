import { Router } from "express";
import { requireAuth, type AuthRequest } from "../authentication/AuthenticationService";
import { chat, searchWithAvailability } from "./RecommendationService";

export const recommendationRouter = Router();
recommendationRouter.use(requireAuth);

// GET /recommendations?genres=80,18&person=Robert De Niro&minRating=7&onlyAvailable=true
// Antwort: Filme inkl. Verfügbarkeit bei den Streamingdiensten des Nutzers
recommendationRouter.get("/", async (req: AuthRequest, res) => {
  const genres = typeof req.query.genres === "string"
    ? req.query.genres.split(",").map(Number).filter(Number.isInteger)
    : undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
  try {
    res.json(await searchWithAvailability(
      req.userId!,
      {
        genreIds: genres,
        personName: typeof req.query.person === "string" && req.query.person.trim() ? req.query.person.trim() : undefined,
        minRating: Number.isFinite(minRating) ? minRating : undefined,
      },
      req.query.onlyAvailable === "true",
    ));
  } catch (e) {
    res.status(502).json({ error: (e as Error).message });
  }
});

// POST /recommendations/chat { message }  (Platzhalter bis zur KI-Anbindung)
recommendationRouter.post("/chat", async (req: AuthRequest, res) => {
  const message = req.body?.message;
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message fehlt" });
  }
  try {
    res.json(await chat(req.userId!, message));
  } catch (e) {
    res.status(502).json({ error: (e as Error).message });
  }
});
