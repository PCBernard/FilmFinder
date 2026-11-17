import { Router } from "express";
import { HttpError, login, register } from "./AuthenticationService";

export const authenticationRouter = Router();

function fail(res: import("express").Response, e: unknown) {
  if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
  console.error(e);
  res.status(500).json({ error: "Interner Fehler" });
}

// POST /authentication/register { email, password }
authenticationRouter.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email und password erforderlich" });
  }
  try {
    res.status(201).json(await register(email, password));
  } catch (e) {
    fail(res, e);
  }
});

// POST /authentication/login { email, password }
authenticationRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email und password erforderlich" });
  }
  try {
    res.json(await login(email, password));
  } catch (e) {
    fail(res, e);
  }
});
