import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { User } from "../user/UserModel";

export interface AuthRequest extends Request {
  userId?: string;
}

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET fehlt (.env)");
  return s;
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: "7d" });
}

export async function register(email: string, password: string) {
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Ungültige E-Mail");
  if (password.length < 8) throw new HttpError(400, "Passwort muss mindestens 8 Zeichen haben");
  if (await User.exists({ email: email.toLowerCase() })) {
    throw new HttpError(409, "E-Mail ist bereits registriert");
  }
  const user = await User.create({ email, passwordHash: await bcrypt.hash(password, 10) });
  return { id: user.id as string, email: user.email, token: signToken(user.id) };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "E-Mail oder Passwort falsch");
  }
  return { id: user.id as string, email: user.email, token: signToken(user.id) };
}

// Middleware: schützt Routen, setzt req.userId
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token fehlt" });
  }
  try {
    const payload = jwt.verify(header.slice(7), secret()) as jwt.JwtPayload;
    req.userId = String(payload.sub);
    next();
  } catch {
    res.status(401).json({ error: "Token ungültig oder abgelaufen" });
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
