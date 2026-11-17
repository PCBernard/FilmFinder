"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api, getToken, setToken } from "@/lib/client";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState("");
  // Schon angemeldet? Dann direkt weiter zum Chat.
  useEffect(() => { if (getToken()) router.replace("/chat"); }, [router]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr("");
    try {
      const r = await api<{ token: string }>(`/authentication/${mode}`, "POST", { email, password });
      setToken(r.token); window.location.assign("/chat");  // harte Navigation: Seite wechselt garantiert
    } catch (x) { setErr((x as Error).message); }
  }
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md p-8 space-y-6">
        <div className="w-12 h-12 bg-yellow border-2 border-ink shadow-bs grid place-items-center font-head font-bold text-2xl">F</div>
        <h1 className="h1 !text-4xl">{mode === "login" ? "Anmelden" : "Registrieren"}</h1>
        <input className="input" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Passwort (min. 8 Zeichen)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="bg-red text-white font-bold text-sm p-2 border-2 border-ink">{err}</p>}
        <button className="btn-y w-full justify-center">{mode === "login" ? "Anmelden" : "Konto erstellen"}</button>
        <button type="button" className="text-xs font-bold underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Noch kein Konto? Registrieren" : "Schon registriert? Anmelden"}
        </button>
      </form>
    </div>
  );
}
