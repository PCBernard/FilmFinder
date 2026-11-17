"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, type Movie } from "@/lib/client";

const NAV = [["/chat", "Filmsuche"], ["/profil", "Mein Geschmacksprofil"], ["/streaming", "Streaming & Filter"]];

export function Shell({ children }: { children: ReactNode }) {
  const router = useRouter(); const path = usePathname(); const [ok, setOk] = useState(false);
  useEffect(() => { if (getToken()) setOk(true); else router.replace("/login"); }, [router]);
  if (!ok) return null;
  return (<>
    <header className="border-b-2 border-ink bg-paper shadow-bs sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        <Link href="/chat" className="flex items-center gap-3">
          <span className="w-10 h-10 bg-yellow border-2 border-ink shadow-bs grid place-items-center font-head font-bold text-xl">F</span>
          <span className="font-head font-bold text-xl uppercase">Filmfinder</span>
        </Link>
        <nav className="flex gap-1 p-1 bg-white border-2 border-ink shadow-bs overflow-x-auto">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={`px-3 py-1.5 font-head font-bold text-xs whitespace-nowrap ${path === href ? "bg-ink text-white" : "hover:bg-yellow"}`}>{label}</Link>
          ))}
        </nav>
        <button className="btn hidden md:inline-flex" onClick={() => { setToken(null); router.replace("/login"); }}>Abmelden</button>
      </div>
    </header>
    <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 min-h-[80vh]">{children}</main>
    <footer className="border-t-2 border-ink bg-white py-6 px-4 md:px-8 text-xs font-bold">
      <span className="font-head text-lg mr-3">FILMFINDER</span>Kuratierte Empfehlungen für Cineasten · Filmdaten: TMDB
    </footer>
  </>);
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={`w-14 h-8 border-2 border-ink p-0.5 flex ${on ? "bg-ink justify-end" : "bg-sand justify-start"}`}>
      <span className={`w-6 h-6 ${on ? "bg-yellow" : "bg-white border border-ink"}`} />
    </button>
  );
}

export function Poster({ movie, className = "" }: { movie: Movie; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return movie.posterUrl ? <img src={movie.posterUrl} alt={movie.title} className={`object-cover ${className}`} />
    : <div className={`bg-sand grid place-items-center p-2 text-center font-head font-bold ${className}`}>{movie.title}</div>;
}

export function MovieSearch({ title, onPick, onClose }: { title: string; onPick: (m: Movie) => void; onClose: () => void }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState<Movie[]>([]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    const t = setTimeout(() => api<Movie[]>(`/movies/search?q=${encodeURIComponent(q)}`).then(setRes).catch(() => setRes([])), 300);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="fixed inset-0 z-50 bg-ink/60 grid place-items-start justify-center p-4 pt-20 overflow-auto" onClick={onClose}>
      <div className="card w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h2 className="font-head font-bold text-2xl uppercase">{title}</h2><button className="btn" onClick={onClose}>Schließen</button></div>
        <input autoFocus className="input mb-4" placeholder="Filmtitel suchen…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {res.slice(0, 8).map((m) => (
            <button key={m.id} onClick={() => { onPick(m); onClose(); }} className="border-2 border-ink text-left hover:shadow-bs">
              <Poster movie={m} className="w-full aspect-[2/3]" />
              <div className="p-2 text-xs font-bold">{m.title} <span className="text-ink/60">{m.releaseYear}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
