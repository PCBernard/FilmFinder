"use client";
import { useState } from "react";
import { MovieSearch, Poster } from "@/components/ui";
import { GENRES, useProfile, type MovieList } from "@/lib/client";

export default function Profil() {
  const { profile: p, error, save, addMovie, removeMovie } = useProfile();
  const [adding, setAdding] = useState<MovieList | null>(null);
  const [deal, setDeal] = useState(""); const [person, setPerson] = useState("");
  if (!p) return <p className="font-bold">{error || "Lädt…"}</p>;
  const filled = [p.favoriteMovies, p.likedMovies, p.watchedMovies, p.dislikedMovies, p.favoritePeople, p.services, p.dealbreakers].filter((x) => x.length).length;

  return (
    <div className="space-y-12">
      {adding && <MovieSearch title="Film hinzufügen" onClose={() => setAdding(null)} onPick={(m) => addMovie(adding, m.id)} />}
      <div className="flex flex-wrap justify-between gap-6 border-b-2 border-ink pb-8">
        <div><h1 className="h1">Mein Geschmacksprofil</h1><p className="mt-4 max-w-xl text-ink/70">Basiert auf deinen Lieblingsfilmen, Vorlieben und Bewertungen. Es wächst mit jedem Film, den du bewertest.</p></div>
        <div className="card p-5 self-start"><p className="font-head font-bold text-xs uppercase">Profilvollständigkeit</p><p className="font-head font-bold text-5xl">{Math.round((filled / 7) * 100)}%</p></div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6"><div><p className="text-red text-xs font-head font-bold uppercase">■ Fundamentale Pfeiler</p><h2 className="h1 !text-3xl">All-Time Lieblingsfilme</h2></div>
          <button className="btn-y" onClick={() => setAdding("favoriteMovies")}>+ Film hinzufügen</button></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {p.favoriteMovies.map((m) => (
            <div key={m.id} className="card relative">
              <button onClick={() => removeMovie("favoriteMovies", m.id)} className="absolute top-2 right-2 z-10 w-7 h-7 bg-white border-2 border-ink font-bold hover:bg-red hover:text-white">×</button>
              <Poster movie={m} className="w-full aspect-[2/3] border-b-2 border-ink" />
              <div className="p-3"><p className="font-head font-bold uppercase leading-tight">{m.title}</p><p className="text-xs font-bold mt-1">★ {m.rating.toFixed(1)} · {m.releaseYear}</p></div>
            </div>
          ))}
          {!p.favoriteMovies.length && <p className="col-span-full text-sm">Noch keine Lieblingsfilme. Füge deinen ersten hinzu.</p>}
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-head font-bold text-2xl uppercase">🚫 Absolute Dealbreaker & No-Gos</h2>
        <p className="text-sm text-ink/70">Der Kurator filtert diese Genres und Tropes aus allen Vorschlägen heraus.</p>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(([name, id]) => { const on = p.dislikedGenres.includes(id); return (
            <button key={id} onClick={() => save({ dislikedGenres: on ? p.dislikedGenres.filter((g) => g !== id) : [...p.dislikedGenres, id] })}
              className={`chip ${on ? "!bg-red text-white" : "hover:bg-yellow"}`}>{on ? "✕ " : ""}{name}</button>); })}
        </div>
        <div className="flex flex-wrap gap-3">
          {p.dealbreakers.map((d) => <span key={d} className="chip bg-red/10">{d}<button className="ml-1" onClick={() => save({ dealbreakers: p.dealbreakers.filter((x) => x !== d) })}>×</button></span>)}
        </div>
        <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); if (deal.trim()) { save({ dealbreakers: [...p.dealbreakers, deal.trim()] }); setDeal(""); } }}>
          <input className="input" placeholder="z. B. Deutsche Klamauk-Komödien" value={deal} onChange={(e) => setDeal(e.target.value)} /><button className="btn">Hinzufügen</button>
        </form>
      </section>

      <section className="space-y-5">
        <div><p className="text-blue text-xs font-head font-bold uppercase">■ Affinitäts-Cluster</p><h2 className="h1 !text-3xl">Bevorzugte Filmemacher & Schauspieler</h2></div>
        <div className="flex flex-wrap gap-3">
          {p.favoritePeople.map((n) => <span key={n} className="card !shadow-bs px-4 py-3 font-head font-bold">{n}<button className="ml-3" onClick={() => save({ favoritePeople: p.favoritePeople.filter((x) => x !== n) })}>×</button></span>)}
        </div>
        <form className="flex gap-3 max-w-xl" onSubmit={(e) => { e.preventDefault(); if (person.trim()) { save({ favoritePeople: [...p.favoritePeople, person.trim()] }); setPerson(""); } }}>
          <input className="input" placeholder="Name hinzufügen, z. B. Peter Jackson" value={person} onChange={(e) => setPerson(e.target.value)} /><button className="btn">Hinzufügen</button>
        </form>
      </section>

      <section className="card p-6 space-y-4">
        <div className="flex justify-between"><h2 className="font-head font-bold text-2xl uppercase">Zuletzt gesehen & Feedback</h2><button className="btn" onClick={() => setAdding("watchedMovies")}>+ Gesehen</button></div>
        {p.watchedMovies.map((m) => {
          const verdict = p.favoriteMovies.some((x) => x.id === m.id) ? "★ Meisterwerk" : p.likedMovies.some((x) => x.id === m.id) ? "± Gut" : p.dislikedMovies.some((x) => x.id === m.id) ? "× Nicht meins" : "";
          return (<div key={m.id} className="flex items-center gap-4 bg-sand border-2 border-ink p-3">
            <Poster movie={m} className="w-12 h-16 border-2 border-ink" /><span className="font-head font-bold uppercase flex-1">{m.title}</span>
            {verdict && <span className="chip bg-yellow">{verdict}</span>}
            <button onClick={() => removeMovie("watchedMovies", m.id)} className="font-bold">×</button></div>);
        })}
        {!p.watchedMovies.length && <p className="text-sm">Noch nichts bewertet. Bewerte Empfehlungen im Chat.</p>}
      </section>
    </div>
  );
}
