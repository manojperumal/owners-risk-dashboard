/* Project detail (light). Three layout variants, chosen in View options:
   operator — KPI row + critical path + phase delays
   gantt    — big plan-vs-forecast Gantt on top
   tabbed   — Overview / Schedule / Contractors / Commissioning / Risks */
import { Fragment, useState } from "react";
import { CP_DEFAULT, GCS, PHASE_DEFAULT, RISKS_DEFAULT, TRADES } from "../data/data";
import type { ProjectLayout, Rag, Site } from "../data/types";
import { StatusIcon, ragInk, ragLabel, ragTag, schedRag, schedText } from "../components/common";

function ProjectHeader({ site, onGC }: { site: Site; onGC: () => void }) {
  const gc = GCS[site.gc];
  const sr = schedRag(site.sched);
  const pill = sr === "red" ? { background: "#FDE5E8", color: "#B11631" }
    : sr === "amber" ? { background: "#FFE7C1", color: "#8A4400" }
    : { background: "#D7F4DE", color: "#146E2B" };

  return (
    <div className="proj-header">
      <div className="left">
        <div className="eyebrow">Data center · {site.region}</div>
        <h1>{site.name} <span className="h1-suffix">· {site.id}</span></h1>
        <div className="sub">
          <span>📍 {site.city}</span>
          <span>⚡ <b>{site.mw} MW</b></span>
          <span>GC: <button className="link-btn" onClick={onGC}>{gc.name} →</button></span>
          <span>Phase: <b>{site.phase}</b></span>
          <span>
            Forecast RFS: <b>{site.rfs}</b>
            <span style={{ marginLeft: 4, padding: "1px 7px", borderRadius: 4, fontWeight: 700, ...pill }}>
              {schedText(site.sched)}
            </span>
          </span>
        </div>
      </div>
      <div className="proj-actions">
        <button className="btn btn-ghost">📄 Export brief</button>
        <button className="btn btn-ghost">🔔 Subscribe</button>
        <button className="btn btn-primary">Raise to OAR</button>
      </div>
    </div>
  );
}

function KPIRow({ site }: { site: Site }) {
  const sr = schedRag(site.sched);
  const atRiskShare = site.rag === "red" ? 0.6 : site.rag === "amber" ? 0.3 : 0.05;
  return (
    <div className="l-kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
      <div className={`l-kpi s-${sr}`}>
        <div className="stripe"></div>
        <div className="lab">Schedule variance</div>
        <div className={`val ${sr}`}>{site.sched > 0 ? "+" : ""}{site.sched}<span className="u">wks</span></div>
        <div className="delta up">▲ 4 wks since last qtr</div>
      </div>
      <div className={`l-kpi s-${site.rag}`}>
        <div className="stripe"></div>
        <div className="lab">Delivery risk</div>
        <div className={`val ${site.rag}`} style={{ fontSize: 22, lineHeight: 1.1, paddingTop: 4 }}>
          {site.rag === "red" ? "High" : site.rag === "amber" ? "Medium-High" : "Low"}
        </div>
        <div className="delta">critical path impacted · 2 milestones at risk</div>
      </div>
      <div className="l-kpi s-blue">
        <div className="stripe"></div>
        <div className="lab">Capacity at risk</div>
        <div className="val">{Math.round(site.mw * atRiskShare)}<span className="u">MW</span></div>
        <div className="delta">of {site.mw} MW total</div>
      </div>
    </div>
  );
}

function CriticalPath() {
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Critical path milestones</h3>
        <span className="r">
          <span className="muted">Impact on RFS:</span>
          <b style={{ color: "var(--or-red)" }}>+14 wks</b>
        </span>
      </div>
      <div className="cp-list">
        {CP_DEFAULT.map(m => (
          <div key={m.key} className="cp-row">
            <div className={`cp-icon ${m.state}`}><StatusIcon state={m.state} /></div>
            <div>
              <div className="t">{m.title}</div>
              <div className="d">{m.impact}</div>
            </div>
            <div className="right">
              <div className={`impact ${m.dragWks > 5 ? "red" : m.dragWks > 0 ? "amber" : "green"}`}>
                <em>{m.dragWks > 0 ? `+${m.dragWks}` : "0"} wks</em><br />
                <span>schedule drag</span>
              </div>
              <span className={`tag ${m.state}`}>{m.tagText}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhaseTimeline() {
  const maxMo = Math.max(...PHASE_DEFAULT.map(p => p.mo)) + 1;
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Phase delivery timeline</h3>
        <span className="r"><span className="muted">months delay vs baseline</span></span>
      </div>
      <div>
        {PHASE_DEFAULT.map(p => (
          <div key={p.name} className="phase-row">
            <div className="name">{p.name}</div>
            <div className="track">
              <div className={`fill ${p.color}`} style={{ width: `${(p.mo / maxMo) * 100}%` }}></div>
            </div>
            <div className={`impact ${p.color}`}>+{p.mo.toFixed(1)}<span className="sm">mo</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractorStrip({ onGC }: { onGC: () => void }) {
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Trade impact on schedule</h3>
        <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={onGC}>View org tree →</button>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Trade / sub</th>
            <th className="num">Scope %</th>
            <th className="num">SPI</th>
            <th className="num">Impact on RFS</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {TRADES.map(t => (
            <tr key={t.slug} className="row-click" onClick={onGC}>
              <td>
                <div className="who">
                  <div className="av-sm">{t.shortName.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="ttl">{t.company}</div>
                    <div className="sub">{t.trade}</div>
                  </div>
                </div>
              </td>
              <td className="num">{t.pct}%</td>
              <td className="num"><b style={{ color: ragInk(t.rag) }}>{(1 - t.impactWks * 0.04).toFixed(2)}</b></td>
              <td className="num">
                {t.impactWks > 0 ? <b style={{ color: ragInk(t.rag) }}>+{t.impactWks} wks</b> : <span className="muted">—</span>}
              </td>
              <td><span className={`tag ${ragTag(t.rag)}`}>{ragLabel(t.rag)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskRegister() {
  const dim = { font: "500 12px var(--sm-font-ui)", color: "var(--or-light-dim)" };
  return (
    <div className="lcard padless">
      <div style={{ padding: "16px 20px 0 20px" }} className="lcard-head">
        <h3>Active risk register — schedule-impacting</h3>
        <span className="r"><span className="muted">{RISKS_DEFAULT.length} active · sorted by impact (wks)</span></span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Risk</th>
            <th>Category</th>
            <th>Owner</th>
            <th>Severity</th>
            <th className="num">Impact</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {RISKS_DEFAULT.map(r => (
            <tr key={r.id}>
              <td><span className="mono-id">{r.id}</span></td>
              <td>
                <div className="ttl">{r.title}</div>
                <div className="sub">{r.mitigation}</div>
              </td>
              <td><span style={dim}>{r.cat}</span></td>
              <td><span style={dim}>{r.owner}</span></td>
              <td><span className={`tag ${r.sev === "Critical" ? "critical" : r.sev === "High" ? "atrisk" : "watch"}`}>{r.sev}</span></td>
              <td className="num">
                <b style={{ color: r.impactWks > 6 ? "var(--or-red)" : r.impactWks > 3 ? "#B97300" : "var(--or-light-dim)" }}>+{r.impactWks} wks</b>
              </td>
              <td>
                <span style={{
                  font: "600 11.5px var(--sm-font-ui)",
                  color: r.status === "Active" ? "var(--or-red)" : r.status === "Mitigating" ? "#B97300" : "var(--or-light-dim)",
                }}>
                  {r.trend === "up" ? "▲" : r.trend === "down" ? "▼" : "—"} {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------- Layout B: Gantt-first -------- */
const QUARTERS = ["Q3'25", "Q4'25", "Q1'26", "Q2'26", "Q3'26", "Q4'26", "Q1'27", "Q2'27", "Q3'27", "Q4'27"];

// plan / fcst: [start column, span in columns]
const GANTT_ROWS: { name: string; swatch: string; plan: [number, number]; fcst: [number, number]; color: Rag }[] = [
  { name: "Site civil",             swatch: "#9F7BEA", plan: [0, 3],     fcst: [0, 4],     color: "red" },
  { name: "Structural steel",       swatch: "#4F8EF7", plan: [2, 3],     fcst: [2, 4],     color: "red" },
  { name: "Envelope / roof",        swatch: "#2BBE7B", plan: [4, 2],     fcst: [4, 2],     color: "green" },
  { name: "Utility interconnect",   swatch: "#F05B6A", plan: [3, 3],     fcst: [3, 6],     color: "red" },
  { name: "MEP rough-in",           swatch: "#F5A524", plan: [4, 3],     fcst: [4.5, 3.5], color: "amber" },
  { name: "Switchgear set",         swatch: "#9F7BEA", plan: [5, 1],     fcst: [6, 1.5],   color: "red" },
  { name: "Generator delivery",     swatch: "#F05B6A", plan: [5, 1.5],   fcst: [7, 1.5],   color: "red" },
  { name: "IT white-space",         swatch: "#4F8EF7", plan: [6, 2],     fcst: [7, 2],     color: "amber" },
  { name: "Commissioning & IST",    swatch: "#F5A524", plan: [7, 2],     fcst: [8.5, 2],   color: "red" },
  { name: "Substantial completion", swatch: "#0F1A2E", plan: [8.5, 0.5], fcst: [9.5, 0.5], color: "red" },
];
const TODAY_COL = 5.4;

function GanttView() {
  const colPct = 100 / QUARTERS.length;
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Master schedule — plan vs forecast</h3>
        <div className="r" style={{ gap: 14 }}>
          <span className="legend-key">
            <span style={{ width: 14, height: 10, border: "1px dashed #5B6479", borderRadius: 2, background: "rgba(15,26,46,.16)" }}></span>
            Baseline plan
          </span>
          <span className="legend-key">
            <span style={{ width: 14, height: 10, background: "var(--or-red)", borderRadius: 2 }}></span>
            Forecast
          </span>
        </div>
      </div>
      <div className="gantt-wrap">
        <div className="gantt" style={{ minWidth: 920 }}>
          <div className="col-head">Phase</div>
          <div className="timeline-head" style={{ gridTemplateColumns: `repeat(${QUARTERS.length}, 1fr)` }}>
            {QUARTERS.map(q => <div key={q} className="q">{q}</div>)}
          </div>

          {GANTT_ROWS.map(r => (
            <Fragment key={r.name}>
              <div className="row-name">
                <span className="swatch" style={{ background: r.swatch }}></span>
                {r.name}
              </div>
              <div className="row-track">
                {QUARTERS.map((q, gi) => (
                  <div key={q} className="grid-q" style={{ left: `${gi * colPct}%`, width: `${colPct}%` }}></div>
                ))}
                <div className="bar plan" style={{ left: `${r.plan[0] * colPct}%`, width: `${r.plan[1] * colPct}%` }}>plan</div>
                <div className={`bar ${r.color}`} style={{ left: `${r.fcst[0] * colPct}%`, width: `${r.fcst[1] * colPct}%`, top: 26 }}>
                  {r.name.split(" ")[0]}
                </div>
                <div className="now-line" style={{ left: `${TODAY_COL * colPct}%` }}></div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const CX_LEVELS: { l: string; state: Rag; pct: number }[] = [
  { l: "L1 Factory",      state: "green", pct: 92 },
  { l: "L2 Site receipt", state: "green", pct: 78 },
  { l: "L3 Static",       state: "amber", pct: 42 },
  { l: "L4 Functional",   state: "amber", pct: 12 },
  { l: "L5 IST",          state: "red",   pct: 0 },
];

function CommissioningReadiness() {
  return (
    <div className="lcard">
      <div className="lcard-head"><h3>Commissioning readiness</h3><span className="r muted">L1 → L5</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginTop: 8 }}>
        {CX_LEVELS.map(s => (
          <div key={s.l} style={{ padding: 14, border: "1px solid var(--or-light-line)", borderRadius: 10 }}>
            <div style={{ font: "700 10px var(--sm-font-ui)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--or-light-mute)" }}>{s.l}</div>
            <div style={{ font: "700 28px var(--sm-font-display)", color: ragInk(s.state), marginTop: 6 }}>{s.pct}%</div>
            <div style={{ height: 6, background: "var(--or-light-line)", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${s.pct}%`,
                background: s.state === "red" ? "var(--or-red)" : s.state === "amber" ? "var(--or-amber)" : "#2BBE7B",
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Tab = "overview" | "schedule" | "contractors" | "commissioning" | "risks";

export function ProjectScreen({ site, onGC, layout }: { site: Site; onGC: () => void; layout: ProjectLayout }) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; cnt?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "schedule", label: "Schedule", cnt: CP_DEFAULT.length },
    { key: "contractors", label: "Contractors", cnt: TRADES.length },
    { key: "commissioning", label: "Commissioning" },
    { key: "risks", label: "Risks", cnt: RISKS_DEFAULT.length },
  ];

  return (
    <div className="page-light">
      <ProjectHeader site={site} onGC={onGC} />
      <KPIRow site={site} />

      {layout === "operator" && (
        <div className="col-stack">
          <div className="row-2">
            <CriticalPath />
            <PhaseTimeline />
          </div>
          <ContractorStrip onGC={onGC} />
          <RiskRegister />
        </div>
      )}

      {layout === "gantt" && (
        <div className="col-stack">
          <GanttView />
          <div className="row-2">
            <CriticalPath />
            <ContractorStrip onGC={onGC} />
          </div>
          <RiskRegister />
        </div>
      )}

      {layout === "tabbed" && (
        <div>
          <div className="ltabs" role="tablist">
            {tabs.map(t => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>
                {t.label}{t.cnt != null && <span className="cnt">{t.cnt}</span>}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="col-stack">
              <div className="row-2">
                <CriticalPath />
                <PhaseTimeline />
              </div>
            </div>
          )}
          {tab === "schedule" && (
            <div className="col-stack">
              <GanttView />
              <CriticalPath />
            </div>
          )}
          {tab === "contractors" && <ContractorStrip onGC={onGC} />}
          {tab === "commissioning" && <CommissioningReadiness />}
          {tab === "risks" && <RiskRegister />}
        </div>
      )}
    </div>
  );
}
