/* Safety risk sections for the GC and Sub detail pages.
   Every safety metric is framed in terms of schedule impact — each stop-work,
   OSHA stand-down or recordable burns float on the critical path. */
import { GC_SAFETY, SUB_INCIDENTS, SUB_TRENDS, TRADES, TRADE_SAFETY } from "../data/data";
import type { ReactNode } from "react";
import type { RiskScore } from "../data/riskScore";
import type { Rag, Trade, TradeSafety } from "../data/types";
import { MicroLabel } from "./common";
import { RiskScoreBadge } from "./RiskScore";

const fillColor = (c: Rag) =>
  c === "red" ? "var(--or-red)" : c === "amber" ? "var(--or-amber)" : "#2BBE7B";

/** Our TRIR vs the industry benchmark (BLS heavy/civil 2.4). */
function TRIRBar({ value, benchmark, color }: { value: number; benchmark: number; color: Rag }) {
  const maxScale = Math.max(value, benchmark, 4) * 1.2;
  return (
    <div className="bench">
      <span>0</span>
      <div className="bench-bar">
        <div className="b-fill" style={{ width: `${(value / maxScale) * 100}%`, background: fillColor(color) }}></div>
        <div className="b-bench" style={{ left: `${(benchmark / maxScale) * 100}%` }}></div>
      </div>
      <span>BLS {benchmark.toFixed(1)}</span>
    </div>
  );
}

function SafetyIcon({ kind }: { kind: "warn" | "clock" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {kind === "warn" ? (
        <>
          <path d="M12 2L2 22h20L12 2z" /><line x1="12" y1="10" x2="12" y2="14" />
          <circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none" />
        </>
      ) : (
        <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>
      )}
    </svg>
  );
}

export function ScheduleImpactCallout({ icon, children, value }: {
  icon: "warn" | "clock"; children: ReactNode; value: string;
}) {
  return (
    <div className="sched-cost" style={{ marginTop: 14 }}>
      <div className="ic"><SafetyIcon kind={icon} /></div>
      <div className="t">{children}</div>
      <div className="v">{value}</div>
    </div>
  );
}

export function GCSafetyBand() {
  const s = GC_SAFETY;
  const trirCol: Rag = s.trir > s.benchmarkTRIR * 1.2 ? "red" : s.trir > s.benchmarkTRIR ? "amber" : "green";
  const ltirCol: Rag = s.ltir > 0.8 ? "red" : s.ltir > 0 ? "amber" : "green";
  return (
    <>
      <div className="lcard-head" style={{ margin: "8px 0 14px" }}>
        <h3 className="section-title">Safety risk — and how it bleeds into schedule</h3>
        <span className="r muted">
          {(s.hours / 1000).toFixed(0)}K work-hours YTD · benchmark BLS 2.4 TRIR
        </span>
      </div>

      <div className="safety-band">
        <div className={`safety-tile s-${trirCol}`}>
          <div className="stripe"></div>
          <div className="lab">TRIR</div>
          <div className={`val ${trirCol}`}>{s.trir}<span className="u">/200K hrs</span></div>
          <TRIRBar value={s.trir} benchmark={s.benchmarkTRIR} color={trirCol} />
        </div>
        <div className={`safety-tile s-${ltirCol}`}>
          <div className="stripe"></div>
          <div className="lab">LTIR</div>
          <div className={`val ${ltirCol}`}>{s.ltir}<span className="u">/200K hrs</span></div>
          <div className="sub"><b>{s.lt}</b> lost-time · <b>{s.ltd}</b> days lost</div>
        </div>
        <div className="safety-tile s-red">
          <div className="stripe"></div>
          <div className="lab">Recordables YTD</div>
          <div className="val red">{s.rec}</div>
          <div className="sub">last <b>{s.daysSinceRec}</b> days ago · steel sub</div>
        </div>
        <div className="safety-tile s-amber">
          <div className="stripe"></div>
          <div className="lab">Near misses</div>
          <div className="val amber">{s.nm}</div>
          <div className="sub"><b>{Math.round((s.nm / s.rec) * 10) / 10}</b>× recordables (leading)</div>
        </div>
        <div className="safety-tile s-blue">
          <div className="stripe"></div>
          <div className="lab">Observations</div>
          <div className="val">{s.kudos + s.atRisk}</div>
          <div className="sub">
            <span style={{ color: "#1B9C5C", fontWeight: 700 }}>{s.kudos} kudos</span>
            {" / "}
            <span style={{ color: "#B97300", fontWeight: 700 }}>{s.atRisk} at-risk</span>
          </div>
        </div>
        <div className="safety-tile s-amber">
          <div className="stripe"></div>
          <div className="lab">Stop-work hours</div>
          <div className="val amber">{s.stopHrs}<span className="u">hrs</span></div>
          <div className="sub">≈ <b>{(s.stopHrs / 40).toFixed(1)} crew-wks</b> burned on safety</div>
        </div>
      </div>
    </>
  );
}

export function SafetyByTrade({ onSub, tradeScores }: {
  onSub: (t: Trade) => void; tradeScores: RiskScore[];
}) {
  // Sort by combined risk: lost-time first, then recordables, then near-misses.
  const rows = TRADES.map((t, i) => ({ trade: t, s: TRADE_SAFETY[i], score: tradeScores[i] }))
    .sort((a, b) => (b.s.lt * 100 + b.s.rec * 10 + b.s.nm) - (a.s.lt * 100 + a.s.rec * 10 + a.s.nm));

  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Safety performance by trade · composite risk score</h3>
        <span className="r muted">
          <span className="legend-key"><span className="sw" style={{ background: "var(--or-red)" }}></span> Recordable</span>
          <span className="legend-key"><span className="sw" style={{ background: "var(--or-amber)" }}></span> Near-miss</span>
        </span>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th>Trade / sub</th>
            <th>Risk score</th>
            <th className="num">Hours</th>
            <th className="num">TRIR</th>
            <th className="num">Rec</th>
            <th className="num">NM</th>
            <th className="num">LT days</th>
            <th>Observations</th>
            <th className="num">PTP %</th>
            <th className="num">Stop-work</th>
            <th>Schedule impact</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ trade: t, s, score }) => {
            const trirCol: Rag = s.trir > 4 ? "red" : s.trir > 2 ? "amber" : "green";
            const totalObs = s.kudos + s.atRisk;
            const kudosPct = totalObs ? (s.kudos / totalObs) * 100 : 0;
            const schedImpact = Math.round(s.stopHrs / 40); // crew-weeks
            const avRag: Rag = s.lt > 0 ? "red" : s.rec > 0 ? "amber" : "green";
            return (
              <tr key={t.slug} className="row-click" onClick={() => onSub(t)}>
                <td>
                  <div className="who">
                    <div className="av-sm" style={{
                      background: avRag === "red" ? "#FDE5E8" : avRag === "amber" ? "#FFE7C1" : "#D7F4DE",
                      color: avRag === "red" ? "#B11631" : avRag === "amber" ? "#8A4400" : "#146E2B",
                    }}>{t.shortName.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="ttl">{t.company}</div>
                      <div className="sub">{t.trade}</div>
                    </div>
                  </div>
                </td>
                <td><RiskScoreBadge score={score.total} band={score.band} /></td>
                <td className="num">{(s.hours / 1000).toFixed(0)}K</td>
                <td className="num">
                  <b style={{ color: trirCol === "red" ? "var(--or-red)" : trirCol === "amber" ? "#B97300" : "#1B9C5C" }}>
                    {s.trir.toFixed(1)}
                  </b>
                </td>
                <td className="num">{s.rec > 0 ? <b style={{ color: "var(--or-red)" }}>{s.rec}</b> : <span className="muted">0</span>}</td>
                <td className="num">{s.nm > 0 ? <span style={{ color: "#8A4400", fontWeight: 600 }}>{s.nm}</span> : <span className="muted">0</span>}</td>
                <td className="num">{s.lt > 0 ? <b style={{ color: "#8B0F25" }}>{s.ltd}d</b> : <span className="muted">—</span>}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
                    <div style={{
                      flex: 1, height: 8, background: "#EEF1F6",
                      borderRadius: 999, overflow: "hidden", display: "flex",
                    }}>
                      <div style={{ width: `${kudosPct}%`, background: "#2BBE7B" }}></div>
                      <div style={{ width: `${100 - kudosPct}%`, background: "var(--or-amber)" }}></div>
                    </div>
                    <span style={{ font: "500 11px var(--sm-font-ui)", color: "var(--or-light-dim)", whiteSpace: "nowrap" }}>
                      {s.kudos}/{s.atRisk}
                    </span>
                  </div>
                </td>
                <td className="num">
                  <b style={{ color: s.ptp >= 90 ? "#1B9C5C" : s.ptp >= 80 ? "#B97300" : "var(--or-red)" }}>{s.ptp}%</b>
                </td>
                <td className="num">
                  {s.stopHrs > 0
                    ? <b style={{ color: s.stopHrs > 100 ? "var(--or-red)" : "#B97300" }}>{s.stopHrs}h</b>
                    : <span className="muted">—</span>}
                </td>
                <td>
                  {schedImpact > 2 ? <span className="tag critical">+{schedImpact} crew-wks</span>
                    : schedImpact > 0 ? <span className="tag atrisk">+{schedImpact} crew-wks</span>
                    : <span className="tag ontrack">none</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ScheduleImpactCallout icon="warn" value={`+${Math.round(GC_SAFETY.stopHrs / 40 / 4)} wks`}>
        <b>Safety-driven schedule loss</b> — stop-work, stand-downs, and lost-time absences have
        consumed <b>{GC_SAFETY.stopHrs} crew-hours</b> across all trades YTD, equivalent to roughly{" "}
        <b>{(GC_SAFETY.stopHrs / 40).toFixed(1)} crew-weeks</b> of progress on the critical path.
      </ScheduleImpactCallout>
    </div>
  );
}

/* =========== SUB DETAIL — SAFETY ============ */

export function SubSafetyKPIs({ safety }: { safety: TradeSafety }) {
  const trirCol: Rag = safety.trir > 4 ? "red" : safety.trir > 2 ? "amber" : "green";
  const ptpCol: Rag = safety.ptp >= 90 ? "green" : safety.ptp >= 80 ? "amber" : "red";
  return (
    <div className="safety-band" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
      <div className={`safety-tile s-${trirCol}`}>
        <div className="stripe"></div>
        <div className="lab">Sub TRIR</div>
        <div className={`val ${trirCol}`}>{safety.trir.toFixed(1)}</div>
        <TRIRBar value={safety.trir} benchmark={2.4} color={trirCol} />
      </div>
      <div className={`safety-tile s-${safety.rec > 0 ? "red" : "green"}`}>
        <div className="stripe"></div>
        <div className="lab">Recordables</div>
        <div className={`val ${safety.rec > 0 ? "red" : "green"}`}>{safety.rec}<span className="u">YTD</span></div>
        <div className="sub">
          {safety.lt > 0
            ? <span style={{ color: "#8B0F25", fontWeight: 700 }}>{safety.lt} lost-time · {safety.ltd}d</span>
            : "no lost-time"}
        </div>
      </div>
      <div className="safety-tile s-amber">
        <div className="stripe"></div>
        <div className="lab">Near misses</div>
        <div className="val amber">{safety.nm}</div>
        <div className="sub">
          ratio <b>{safety.rec ? (safety.nm / safety.rec).toFixed(1) : "—"}</b>×{" "}
          <span className="muted">(target {">"}10×)</span>
        </div>
      </div>
      <div className="safety-tile s-blue">
        <div className="stripe"></div>
        <div className="lab">PTP compliance</div>
        <div className={`val ${ptpCol}`}>{safety.ptp}<span className="u">%</span></div>
        <div className="sub">target ≥ <b>95%</b></div>
      </div>
      <div className="safety-tile s-amber">
        <div className="stripe"></div>
        <div className="lab">Open corrective actions</div>
        <div className="val amber">{safety.openCA}</div>
        <div className="sub"><b>2</b> aged {">"} 14 days</div>
      </div>
    </div>
  );
}

export function DaysSinceCards({ safety }: { safety: TradeSafety }) {
  const recCol: Rag = safety.daysSince < 14 ? "red" : safety.daysSince < 60 ? "amber" : "green";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div className="days-since">
        <div>
          <div className="lab">Days since recordable</div>
          <div className={`big ${recCol}`}>{safety.daysSince}</div>
        </div>
        <div className="body" style={{ flex: 1 }}>
          Last recordable on <b style={{ color: "#fff" }}>May 06</b> —
          hand laceration during temporary panel terminations.
          Crew on glove-standard upgrade; stand-down completed Mon.
        </div>
      </div>
      <div className="days-since">
        <div>
          <div className="lab">Hours of stop-work YTD</div>
          <div className="big amber">
            {safety.stopHrs}
            <span style={{ font: "500 18px var(--sm-font-ui)", color: "rgba(255,255,255,.55)", marginLeft: 6 }}>hrs</span>
          </div>
        </div>
        <div className="body" style={{ flex: 1 }}>
          ≈ <b style={{ color: "#fff" }}>{(safety.stopHrs / 40).toFixed(1)} crew-weeks</b> of float consumed by stand-downs,
          investigations, and LOTO re-verification — directly visible as the <b style={{ color: "#fff" }}>+2 wks</b> drag
          on the electrical scope this quarter.
        </div>
      </div>
    </div>
  );
}

export function ObservationsPanel({ safety }: { safety: TradeSafety }) {
  const total = safety.kudos + safety.atRisk;
  const kudosPct = total ? (safety.kudos / total) * 100 : 0;
  const ratio = safety.kudos / Math.max(1, safety.atRisk);
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Observations — leading indicator</h3>
        <span className="r muted">target ratio <b style={{ color: "var(--or-light-ink)" }}>3:1</b> kudos to at-risk</span>
      </div>
      <div className="obs-split">
        <div className="obs-bar">
          <div className="seg kudos" style={{ width: `${kudosPct}%` }}>{safety.kudos} kudos</div>
          <div className="seg atrisk" style={{ width: `${100 - kudosPct}%` }}>{safety.atRisk} at-risk</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <div>
          <MicroLabel>Current ratio</MicroLabel>
          <div style={{ font: "700 22px var(--sm-font-display)", color: ratio < 2 ? "var(--or-red)" : ratio < 3 ? "#B97300" : "#1B9C5C" }}>
            {ratio.toFixed(1)}:1
          </div>
        </div>
        <div>
          <MicroLabel>Trend — last 12 wks</MicroLabel>
          <div className="spk" style={{ width: 180, marginTop: 4 }}>
            {SUB_TRENDS.atRisk.map((v, i, arr) => {
              const k = SUB_TRENDS.kudos[i];
              const tot = v + k;
              const goodPct = tot ? k / tot : 1;
              return (
                <div key={i}
                  className={`b ${i === arr.length - 1 ? "last" : ""} ${goodPct < 0.6 ? "red" : goodPct < 0.75 ? "amber" : ""}`}
                  style={{ height: `${(tot / 8) * 100}%` }}></div>
              );
            })}
          </div>
        </div>
        <div>
          <MicroLabel>PTP compliance — 12 wks</MicroLabel>
          <div className="spk" style={{ width: 180, marginTop: 4 }}>
            {SUB_TRENDS.ptp.map((v, i, arr) => (
              <div key={i}
                className={`b ${i === arr.length - 1 ? "last" : ""} ${v < 80 ? "red" : v < 90 ? "amber" : ""}`}
                style={{ height: `${v}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const OPEN_CAS = [
  { id: "CA-219", title: "Upgrade glove standard to ANSI A4 — terminations", owner: "Foreman Ramirez", due: "May 18", age: 8,  state: "in-progress" },
  { id: "CA-211", title: "100% tool-tethering audit on man-lifts",            owner: "Safety Lt. Kim",  due: "May 20", age: 16, state: "overdue" },
  { id: "CA-204", title: "Revise LOTO permit — verifier sign-off required",   owner: "GC Safety",       due: "May 14", age: 22, state: "overdue" },
] as const;

export function CorrectiveActions({ safety }: { safety: TradeSafety }) {
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Corrective actions — open</h3>
        <span className="r muted"><b style={{ color: "var(--or-red)" }}>{safety.openCA}</b> active · <b>2</b> aged {">"} 14d</span>
      </div>
      <div>
        {OPEN_CAS.map((c, i) => (
          <div key={c.id} style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center",
            padding: "12px 0", borderBottom: i < OPEN_CAS.length - 1 ? "1px solid var(--or-light-line-2)" : "none",
          }}>
            <span className="mono-id">{c.id}</span>
            <div>
              <div style={{ font: "600 13px var(--sm-font-ui)", color: "var(--or-light-ink)" }}>{c.title}</div>
              <div style={{ font: "500 11.5px var(--sm-font-ui)", color: "var(--or-light-dim)", marginTop: 2 }}>
                Owner: <b>{c.owner}</b> · Due {c.due} · Age {c.age}d
              </div>
            </div>
            <span className={`tag ${c.state === "overdue" ? "critical" : "atrisk"}`}>
              {c.state === "overdue" ? "Overdue" : "In progress"}
            </span>
          </div>
        ))}
      </div>
      <ScheduleImpactCallout icon="clock" value="+8h">
        Two aged corrective actions block <b>re-energization permit</b> for feeder 4B —
        holding the gen paralleling burn-in.
      </ScheduleImpactCallout>
    </div>
  );
}

export function IncidentLog() {
  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Incident & near-miss log</h3>
        <span className="r muted">last 6 weeks · click any row for investigation</span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Event</th>
            <th>Sev</th>
            <th className="num">Sched impact</th>
            <th>Corrective action</th>
          </tr>
        </thead>
        <tbody>
          {SUB_INCIDENTS.map((e, i) => {
            const typeClass = e.type === "Recordable" ? "recordable"
              : e.type === "Near-miss" ? "nearmiss"
              : e.type === "First aid" ? "firstaid" : "lost";
            const sevClass = e.severity === "High" ? "high" : e.severity === "Med" ? "med" : "low";
            return (
              <tr key={i} className="row-click">
                <td><span className="mono-id">{e.date}</span></td>
                <td><span className={`itype-pill ${typeClass}`}><span className="dot"></span>{e.type}</span></td>
                <td>
                  <div className="ttl">{e.title}</div>
                  <div className="sub">{e.crew} · reported by {e.reporter}</div>
                </td>
                <td><span className={`sev-pill ${sevClass}`}>{e.severity}</span></td>
                <td className="num">
                  {e.days > 0 ? <b style={{ color: "#8B0F25" }}>{e.days}d lost</b>
                    : e.dragHrs > 0 ? <span style={{ color: "#8A4400", fontWeight: 700 }}>{e.dragHrs}h stop</span>
                    : <span className="muted">—</span>}
                </td>
                <td>
                  <div style={{ font: "500 12px var(--sm-font-ui)", color: "var(--or-light-dim)" }}>{e.capa}</div>
                  <div style={{ font: "600 11px var(--sm-font-ui)", color: e.status.includes("progress") ? "#B97300" : "var(--or-light-mute)", marginTop: 2 }}>
                    {e.status}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
