import "dotenv/config";
import express from "express";
import cors from "cors";
import { startDB } from "./db/Database";
import { authenticationRouter } from "./endpoints/authentication/AuthenticationRoutes";
import { movieRouter } from "./endpoints/movie/MovieRoutes";
import { tasteProfileRouter } from "./endpoints/tasteProfile/TasteProfileRoutes";
import { recommendationRouter } from "./endpoints/recommendation/RecommendationRoutes";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3001" }));
app.use(express.json());

app.use("/authentication", authenticationRouter);
app.use("/movies", movieRouter);
app.use("/profile", tasteProfileRouter);
app.use("/recommendations", recommendationRouter);

async function main() {
  await startDB();
  app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error("Start fehlgeschlagen:", err);
  process.exit(1);
});
