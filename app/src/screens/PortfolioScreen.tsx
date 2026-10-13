/* Portfolio (dark) — top-level view of all data center builds */
import { useMemo, useState } from "react";
import { GCS, OWNERS, REGIONS, SITES, rstats } from "../data/data";
import type { OwnerKey, Rag, Site } from "../data/types";
import { RAGPill, schedRag, schedText } from "../components/common";

type Filter = "all" | Rag;
type SortBy = "risk" | "progress" | "mw" | "rfs";

const ragVar = (c: Rag) =>
  c === "red" ? "var(--or-red)" : c === "amber" ? "var(--or-amber)" : "var(--or-green)";

/** "Q3 2027" → 20273 so quarters sort chronologically. */
const rfsKey = (rfs: string) => {
  const m = /^Q(\d)\s+(\d{4})$/.exec(rfs);
  return m ? Number(m[2]) * 10 + Number(m[1]) : 0;
};

function SiteCard({ site, onClick }: { site: Site; onClick: () => void }) {
  const gc = GCS[site.gc];
  const topRisk = site.topRisk.length > 38 ? site.topRisk.slice(0, 38) + "…" : site.topRisk;

  return (
    <div
      className={`site-card r-${site.rag}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      <div className="stripe"></div>
      <div className="site-head">
        <div>
          <div className="site-code">{site.id}</div>
          <div className="site-name">{site.name}</div>
          <div className="site-loc">{site.city} · {site.mw} MW</div>
        </div>
        <RAGPill rag={site.rag} />
      </div>

      <div className="site-meta">
        <div className="m">
          <div className="lbl">Schedule</div>
          <div className={`val ${schedRag(site.sched)}`}>{schedText(site.sched)}</div>
        </div>
        <div className="m">
          <div className="lbl">Forecast RFS</div>
          <div className="val">{site.rfs}</div>
        </div>
        <div className="m">
          <div className="lbl">Phase</div>
          <div className="val">{site.phase}</div>
        </div>
        <div className="m">
          <div className="lbl">Top risk</div>
          <div className="val" style={{ font: "600 11px var(--sm-font-ui)", lineHeight: 1.3, color: "var(--or-text-dim)" }}>
            {topRisk}
          </div>
        </div>
      </div>

      <div className="site-progress">
        <div className="row"><span>Progress</span><em>{site.pct}%</em></div>
        <div className="site-track">
          <div className="plan" style={{ width: `${Math.min(100, site.pct + Math.max(0, site.sched / 2))}%` }}></div>
          <div className="act" style={{ width: `${site.pct}%` }}></div>
        </div>
      </div>

      <div className="site-foot">
        <div className="gc">GC <b>{gc.name}</b></div>
        <div className="risk-flags" title={site.topRisk}>
          <span className={`flag-dot ${site.rag === "red" ? "red" : "amber"}`} title="Schedule">S</span>
          <span className={`flag-dot ${/utility|power|switchgear|generator/i.test(site.topRisk) ? "red" : "green"}`} title="Power">P</span>
          <span className={`flag-dot ${/permit/i.test(site.topRisk) ? "amber" : "green"}`} title="Permits">R</span>
        </div>
      </div>
    </div>
  );
}

const SCHEDULE_DRIVERS: { t: string; v: string; color: Rag }[] = [
  { t: "Utility interconnect — IAD-07, ATL-04, PHX-02", v: "+12–22 wks", color: "red" },
  { t: "Switchgear long-lead (3 sites)",                v: "+8 wks",     color: "red" },
  { t: "Generator OEM build slot",                      v: "+6 wks",     color: "red" },
  { t: "Site civil — wet season",                       v: "+5 wks",     color: "amber" },
  { t: "Steel mill rolling lead",                       v: "+4 wks",     color: "amber" },
];

const GC_SCORECARD: { gc: string; sites: number; spi: number; color: Rag }[] = [
  { gc: "Turner",        sites: 3, spi: 0.86, color: "amber" },
  { gc: "DPR",           sites: 4, spi: 0.79, color: "red" },
  { gc: "Holder",        sites: 2, spi: 0.74, color: "red" },
  { gc: "Mortenson",     sites: 4, spi: 0.93, color: "green" },
  { gc: "Skanska",       sites: 3, spi: 0.97, color: "green" },
  { gc: "Hensel Phelps", sites: 2, spi: 0.95, color: "green" },
];

const DELIVERY_FORECAST = [
  { q: "Q3 2026", base: 3, fcst: 2, late: 1 },
  { q: "Q4 2026", base: 5, fcst: 5, late: 1 },
  { q: "Q1 2027", base: 4, fcst: 3, late: 1 },
  { q: "Q2 2027", base: 4, fcst: 3, late: 2 },
  { q: "Q3 2027", base: 3, fcst: 2, late: 3 },
  { q: "Q4 2027", base: 3, fcst: 2, late: 2 },
  { q: "Q1+2028", base: 3, fcst: 8, late: 4 },
];

const listRow = (last: boolean) => ({
  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
  borderBottom: last ? "none" : "1px solid var(--or-line)",
});

export function PortfolioScreen({ owner, onOpen }: { owner: OwnerKey; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [region, setRegion] = useState("All regions");
  const [sortBy, setSortBy] = useState<SortBy>("risk");

  const filtered = useMemo(() => {
    let s = SITES.slice();
    if (filter !== "all") s = s.filter(x => x.rag === filter);
    if (region !== "All regions") s = s.filter(x => x.region === region);
    if (sortBy === "risk") {
      const order: Record<Rag, number> = { red: 0, amber: 1, green: 2 };
      s.sort((a, b) => order[a.rag] - order[b.rag] || b.sched - a.sched);
    } else if (sortBy === "progress") s.sort((a, b) => b.pct - a.pct);
    else if (sortBy === "mw") s.sort((a, b) => b.mw - a.mw);
    else s.sort((a, b) => rfsKey(a.rfs) - rfsKey(b.rfs));
    return s;
  }, [filter, region, sortBy]);

  const n = SITES.length;
  const avgSlip = SITES.reduce((a, s) => a + s.sched, 0) / n;

  return (
    <div className="page-dark">
      {/* Hero KPI band */}
      <div className="dark-hero">
        <div className="eyebrow-dark">Owner Risk Portfolio · {OWNERS[owner].name}</div>
        <h1 className="hero-title">{n} data center builds · {rstats.totalMW.toLocaleString("en-US")} MW under construction</h1>
        <p className="hero-sub">
          Program-level view of schedule, safety, power, supply chain, permits and commissioning risk —
          every signal here resolves up to one question: <b style={{ color: "#fff" }}>will we hit Ready-for-Service?</b>
        </p>

        <div className="hero-kpis">
          <div className="hero-kpi alert">
            <div className="lab">Critical sites</div>
            <div className="val">{rstats.red}<span className="u">of {n}</span></div>
            <div className="delta up">▲ 2 since last quarter</div>
          </div>
          <div className="hero-kpi warn">
            <div className="lab">At-risk sites</div>
            <div className="val">{rstats.amber}<span className="u">of {n}</span></div>
            <div className="delta flat">— flat QoQ</div>
          </div>
          <div className="hero-kpi good">
            <div className="lab">On-track sites</div>
            <div className="val">{rstats.green}<span className="u">of {n}</span></div>
            <div className="delta down">▼ improved from 11</div>
          </div>
          <div className="hero-kpi">
            <div className="lab">MW at delivery risk</div>
            <div className="val">{rstats.lateMW}<span className="u">/{rstats.totalMW} MW</span></div>
            <div className="delta up">▲ {Math.round((rstats.lateMW / rstats.totalMW) * 100)}% of portfolio</div>
          </div>
          <div className="hero-kpi">
            <div className="lab">Avg. schedule slip</div>
            <div className="val">+{avgSlip.toFixed(1)}<span className="u">wks vs baseline</span></div>
            <div className="delta up">▲ 1.2 wks QoQ</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="port-body">
        <div className="port-toolbar">
          <h2>Sites</h2>
          <div className="count">{filtered.length} of {n}</div>

          <div style={{ marginLeft: 14 }}>
            <div className="tabs" role="tablist">
              <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
              <button className={filter === "red" ? "on" : ""} onClick={() => setFilter("red")}>
                <span className="dot" style={{ background: "var(--or-red)" }}></span>Critical ({rstats.red})
              </button>
              <button className={filter === "amber" ? "on" : ""} onClick={() => setFilter("amber")}>
                <span className="dot" style={{ background: "var(--or-amber)" }}></span>At-risk ({rstats.amber})
              </button>
              <button className={filter === "green" ? "on" : ""} onClick={() => setFilter("green")}>
                <span className="dot" style={{ background: "var(--or-green)" }}></span>On track ({rstats.green})
              </button>
            </div>
          </div>

          <div className="spacer-fill"></div>

          <div className="chip-row">
            <select aria-label="Region" value={region} onChange={e => setRegion(e.target.value)} className="fchip fchip-select">
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select aria-label="Sort by" value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="fchip fchip-select">
              <option value="risk">Sort: Risk</option>
              <option value="progress">Sort: Progress</option>
              <option value="mw">Sort: MW capacity</option>
              <option value="rfs">Sort: RFS date</option>
            </select>
          </div>
        </div>

        <div className="site-grid">
          {filtered.map(s => <SiteCard key={s.id} site={s} onClick={() => onOpen(s.id)} />)}
        </div>
        {filtered.length === 0 && (
          <div className="dark-empty">No sites match these filters.</div>
        )}

        {/* Program-level mini panels below grid */}
        <div className="row-3" style={{ marginTop: 28 }}>
          <div className="dark-card">
            <h3>Top schedule drivers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SCHEDULE_DRIVERS.map((r, i) => (
                <div key={i} style={listRow(i === SCHEDULE_DRIVERS.length - 1)}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: ragVar(r.color) }}></span>
                  <span style={{ flex: 1, font: "600 12.5px var(--sm-font-ui)", color: "#E7EBF3" }}>{r.t}</span>
                  <span style={{ font: "700 12px var(--sm-font-ui)", color: ragVar(r.color) }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dark-card">
            <h3>GC scorecard (this quarter)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GC_SCORECARD.map((r, i) => (
                <div key={i} style={listRow(i === GC_SCORECARD.length - 1)}>
                  <span style={{ flex: 1, font: "600 12.5px var(--sm-font-ui)", color: "#E7EBF3" }}>
                    {r.gc} <span style={{ color: "var(--or-text-mute)", fontWeight: 500 }}>· {r.sites} sites</span>
                  </span>
                  <span style={{ font: "700 12px var(--sm-font-ui)", color: ragVar(r.color) }}>SPI {r.spi.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dark-card">
            <h3>Delivery forecast vs baseline</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {DELIVERY_FORECAST.map((r, i) => {
                const max = 9;
                const onTimePct = ((r.fcst - r.late) / max) * 100;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "58px 1fr 50px", gap: 10, alignItems: "center" }}>
                    <span style={{ font: "500 11px var(--sm-font-ui)", color: "var(--or-text-dim)" }}>{r.q}</span>
                    <div style={{ position: "relative", height: 14, background: "rgba(255,255,255,.04)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ position: "absolute", inset: "2px auto 2px 0", width: `${onTimePct}%`, background: "var(--or-green)", borderRadius: 2 }}></div>
                      <div style={{ position: "absolute", inset: `2px auto 2px ${onTimePct}%`, width: `${(r.late / max) * 100}%`, background: "var(--or-red)", borderRadius: 2 }}></div>
                      <div style={{ position: "absolute", top: -3, bottom: -3, left: `${(r.base / max) * 100}%`, width: 2, background: "#fff", opacity: 0.6 }}></div>
                    </div>
                    <span style={{ font: "700 12px var(--sm-font-ui)", color: "#fff", textAlign: "right" }}>{r.fcst}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 14, font: "500 10.5px var(--sm-font-ui)", color: "var(--or-text-dim)" }}>
              <span className="legend-key"><span style={{ width: 9, height: 9, background: "var(--or-green)", borderRadius: 2 }}></span>Forecast on-time</span>
              <span className="legend-key"><span style={{ width: 9, height: 9, background: "var(--or-red)", borderRadius: 2 }}></span>Forecast late</span>
              <span className="legend-key"><span style={{ width: 2, height: 11, background: "#fff", opacity: 0.6 }}></span>Baseline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
