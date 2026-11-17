"use client";
import Link from "next/link";
import { useState } from "react";
import { Poster, Toggle } from "@/components/ui";
import { api, GENRES, useProfile, type Availability, type MovieList, type Result } from "@/lib/client";

const FEEDBACK: [string, MovieList, string][] = [["★ Meisterwerk", "favoriteMovies", "hover:bg-yellow"], ["± Gut", "likedMovies", "hover:bg-sand"], ["× Nicht meins", "dislikedMovies", "hover:bg-red hover:text-white"]];
const eur = (p: number | null) => (p == null ? "" : ` ${p.toFixed(2).replace(".", ",")} €`);

function AvailabilityBox({ a }: { a: Availability }) {
  if (a.status === "stream") return <p className="bg-yellow border-2 border-ink p-3 text-sm font-bold">✓ Bei dir verfügbar: {a.onMyServices.join(", ")}</p>;
  if (a.status === "rentbuy") return <p className="bg-blue text-white border-2 border-ink p-3 text-sm font-bold">Nicht im Abo, aber leihen/kaufen: {a.rentBuy.map((r) => `${r.name}${eur(r.price)}`).join(" · ")}</p>;
  if (a.status === "none") return <p className="bg-sand border-2 border-ink p-3 text-sm font-bold">✕ Bei keinem deiner Dienste{a.otherServices.length ? ` · läuft bei: ${a.otherServices.join(", ")}` : ""}</p>;
  return <p className="bg-sand border-2 border-dashed border-ink p-3 text-sm">Verfügbarkeit konnte nicht geprüft werden (Watchmode-Key gesetzt?)</p>;
}

export default function Filmsuche() {
  const { profile, addMovie } = useProfile();
  const [genres, setGenres] = useState<number[]>([]); const [person, setPerson] = useState(""); const [only, setOnly] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [done, setDone] = useState<Record<number, string>>({});

  async function search() {
    setBusy(true); setErr("");
    const qs = new URLSearchParams();
    if (genres.length) qs.set("genres", genres.join(","));
    if (person.trim()) qs.set("person", person.trim());
    if (only) qs.set("onlyAvailable", "true");
    try { setResults(await api<Result[]>(`/recommendations?${qs}`)); } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }
  async function rate(m: Result, list: MovieList, label: string) {
    await addMovie(list, m.id); if (list !== "watchlist") await addMovie("watchedMovies", m.id);
    setDone((d) => ({ ...d, [m.id]: label }));
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <section className="lg:col-span-8 space-y-6">
        <div className="card p-6 space-y-5">
          <h1 className="h1 !text-4xl">Filmsuche</h1>
          <div><p className="text-xs font-head font-bold uppercase mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-2">{GENRES.map(([name, id]) => { const on = genres.includes(id); return (
              <button key={id} onClick={() => setGenres(on ? genres.filter((g) => g !== id) : [...genres, id])} className={`chip ${on ? "!bg-ink text-white" : "hover:bg-yellow"}`}>{name}</button>); })}</div></div>
          <div><p className="text-xs font-head font-bold uppercase">Schauspieler</p>
            <input className="input" placeholder="z. B. Robert De Niro" value={person} onChange={(e) => setPerson(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} /></div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm font-bold"><Toggle on={only} onChange={setOnly} />Nur verfügbare Filme</label>
            <button className="btn-y" onClick={search} disabled={busy}>{busy ? "Suche läuft…" : "Filme suchen"}</button></div>
        </div>
        {err && <p className="bg-red text-white font-bold text-sm p-3 border-2 border-ink">{err}</p>}
        {results && !results.length && <p className="card p-4 text-sm font-bold">Keine passenden Filme gefunden. Versuche andere Filter.</p>}
        {results?.map((m) => (
          <article key={m.id} className="card grid md:grid-cols-12 overflow-hidden">
            <Poster movie={m} className="md:col-span-4 w-full h-full min-h-[260px] border-b-2 md:border-b-0 md:border-r-2 border-ink" />
            <div className="md:col-span-8 p-5 space-y-3">
              <div className="flex items-center gap-2"><span className="chip bg-yellow">★ {m.rating.toFixed(1)}</span><span className="text-xs font-bold">{m.releaseYear}</span></div>
              <h3 className="font-head font-bold text-2xl">{m.title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed line-clamp-4">{m.overview || "Keine Beschreibung verfügbar."}</p>
              <AvailabilityBox a={m.availability} />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-ink pt-3">
                <button className="btn" onClick={() => rate(m, "watchlist", "Auf der Watchlist")}>+ Watchlist</button>
                {done[m.id] ? <span className="chip bg-yellow">{done[m.id]}</span> : <div className="flex gap-1.5">
                  {FEEDBACK.map(([label, list, cls]) => <button key={list} onClick={() => rate(m, list, label)} className={`px-2.5 py-1 border-2 border-ink bg-white text-xs font-head font-bold ${cls}`}>{label}</button>)}</div>}
              </div>
            </div>
          </article>
        ))}
      </section>
      <aside className="lg:col-span-4 card p-6 space-y-5">
        <h2 className="font-head font-bold text-base border-b-2 border-ink pb-3">Aktive Parameter</h2>
        <div><p className="text-xs font-head font-bold uppercase mb-2">Meine Abonnements</p>
          <div className="flex flex-wrap gap-2">{profile?.services.length ? profile.services.map((s) => <span key={s} className="chip bg-yellow">{s}</span>) : <Link href="/streaming" className="text-xs underline font-bold">Noch keine gewählt – jetzt festlegen</Link>}</div></div>
        <div><p className="text-xs font-head font-bold uppercase text-red mb-2">Ausgeschlossen</p>
          <p className="text-xs">Filme, die du als „nicht meins“ markiert oder schon gesehen hast, und deine Dealbreaker-Genres werden herausgefiltert.</p></div>
        <Link href="/profil" className="btn w-full justify-center">Geschmacksprofil bearbeiten</Link>
      </aside>
    </div>
  );
}
