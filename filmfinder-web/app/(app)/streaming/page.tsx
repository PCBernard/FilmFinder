"use client";
import { Toggle } from "@/components/ui";
import { useProfile } from "@/lib/client";

const SERVICES: [string, string][] = [["netflix", "Netflix"], ["prime", "Amazon Prime"], ["apple", "Apple TV+"], ["mubi", "MUBI"], ["disney", "Disney+"], ["wow", "WOW / Sky"], ["paramount", "Paramount+"], ["joyn", "Joyn Plus+"]];
const Row = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <div className="border-2 border-ink bg-sand p-4 flex items-center justify-between gap-4"><div><p className="font-head font-bold uppercase text-sm">{title}</p>{sub && <p className="text-xs text-ink/70">{sub}</p>}</div>{children}</div>
);

export default function Streaming() {
  const { profile: p, error, save } = useProfile();
  if (!p) return <p className="font-bold">{error || "Lädt…"}</p>;
  const toggle = (id: string) => save({ services: p.services.includes(id) ? p.services.filter((s) => s !== id) : [...p.services, id] });
  return (
    <div className="max-w-3xl space-y-8">
      <div className="card p-8"><h1 className="h1 !text-4xl md:!text-5xl">Streaming-Dienste & Verfügbarkeits-Filter</h1>
        <p className="mt-4 text-ink/70">Der Kurator schlägt nur Filme vor, die du ohne Zusatzkosten streamen kannst, oder optional im Store leihen/kaufen möchtest.</p></div>

      <section className="card p-6 space-y-4"><div className="flex justify-between"><h2 className="font-head font-bold text-xl uppercase">Meine aktiven Flatrate-Abonnements</h2><span className="chip bg-yellow">{p.services.length} aktiv</span></div>
        <div className="grid sm:grid-cols-2 gap-3">
          {SERVICES.map(([id, name]) => { const on = p.services.includes(id); return (
            <div key={id} className={`border-2 border-ink p-4 flex items-center justify-between ${on ? "bg-white shadow-bs" : "border-dashed bg-sand text-ink/50"}`}>
              <span className="font-head font-bold uppercase">{name}</span><Toggle on={on} onChange={() => toggle(id)} /></div>); })}
        </div></section>

      <section className="card p-6 space-y-4"><h2 className="font-head font-bold text-xl uppercase">Kauf- & Leih-Optionen (VOD)</h2>
        <Row title="Auch Filme zum Leihen/Kaufen vorschlagen?" sub="Falls ein Meisterwerk bei keinem deiner Abos verfügbar ist."><Toggle on={p.allowBuyOrRent} onChange={(v) => save({ allowBuyOrRent: v })} /></Row>
        {p.allowBuyOrRent && <div className="border-2 border-ink bg-sand p-4"><p className="font-head font-bold uppercase text-sm mb-2">Maximaler Leihpreis: <span className="bg-ink text-yellow px-2">{p.maxRentPrice.toFixed(2)} €</span></p>
          <input type="range" min={0.99} max={9.99} step={0.5} value={p.maxRentPrice} onChange={(e) => save({ maxRentPrice: Number(e.target.value) })} className="w-full accent-ink" /></div>}
      </section>

      <section className="card p-6 space-y-4"><h2 className="font-head font-bold text-xl uppercase">Qualitäts- & Rezeptionsfilter</h2>
        <div className="border-2 border-ink bg-sand p-4"><p className="font-head font-bold uppercase text-sm mb-2">Mindest-Score: <span className="bg-ink text-yellow px-2">{p.minCriticScore}%</span></p>
          <input type="range" min={50} max={95} step={5} value={p.minCriticScore} onChange={(e) => save({ minCriticScore: Number(e.target.value) })} className="w-full accent-ink" />
          <div className="flex justify-between text-xs font-bold"><span>50% Popkultur</span><span>95% Meisterwerke</span></div></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Row title="Festival- & Oscar-Preisträger" sub="Cannes, Berlinale priorisieren"><Toggle on={p.festivalPreferred} onChange={(v) => save({ festivalPreferred: v })} /></Row>
          <Row title="Originalfassung mit UT" sub="Synchro nachrangig"><Toggle on={p.originalVersion} onChange={(v) => save({ originalVersion: v })} /></Row>
        </div></section>
    </div>
  );
}
