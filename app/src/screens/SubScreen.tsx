/* Sub / trade-contractor detail (light). Safety leads; schedule supports below. */
import { GCS, SUB_DETAIL, safetyFor } from "../data/data";
import { computeRiskScore } from "../data/riskScore";
import type { Site, Trade } from "../data/types";
import { MicroLabel, SectionDivider, StatusIcon, ragLabel, ragTag } from "../components/common";
import { RiskScoreHero } from "../components/RiskScore";
import {
  CorrectiveActions, DaysSinceCards, IncidentLog, ObservationsPanel, SubSafetyKPIs,
} from "../components/Safety";

const HEADCOUNT = [58, 62, 71, 84, 91, 88, 82, 84];
const HEADCOUNT_TARGET = 120;

export function SubScreen({ site, sub, onGC }: { site: Site; sub: Trade; onGC: () => void }) {
  const gc = GCS[site.gc];
  const safety = safetyFor(sub);
  const score = computeRiskScore(sub, safety);

  // Context narrative generated from the actual drivers
  const driverNotes: string[] = [];
  if (safety.lt > 0) driverNotes.push(`${safety.lt} lost-time event(s) (${safety.ltd} days)`);
  if (safety.rec > 0) driverNotes.push(`${safety.rec} recordable${safety.rec > 1 ? "s" : ""} YTD`);
  if (safety.trir > 2.4) driverNotes.push(`TRIR ${safety.trir.toFixed(1)} vs BLS 2.4`);
  if (sub.impactWks > 4) driverNotes.push(`+${sub.impactWks} wks impact on RFS`);
  if (safety.stopHrs > 50) driverNotes.push(`${safety.stopHrs} hrs of stop-work`);
  const obsRatio = (safety.kudos / Math.max(1, safety.atRisk)).toFixed(1);

  const current = HEADCOUNT[HEADCOUNT.length - 1];

  return (
    <div className="page-light">
      <div className="proj-header">
        <div className="left">
          <div className="eyebrow">
            {site.id} · <button className="link-btn inherit" onClick={onGC}>{gc.name}</button> · {sub.trade}
          </div>
          <h1>{sub.company} <span className="h1-suffix">· Trade contractor</span></h1>
          <div className="sub">
            <span>Scope: <b>{sub.scope}</b></span>
            <span>Status: <span className={`tag ${ragTag(sub.rag)}`}>{ragLabel(sub.rag)}</span></span>
            <span>Crew today: <b>84/120</b></span>
          </div>
        </div>
        <div className="proj-actions">
          <button className="btn btn-ghost">📞 Contact PM</button>
          <button className="btn btn-ghost">📄 Subcontract</button>
          <button className="btn btn-primary">Schedule recovery meeting</button>
        </div>
      </div>

      {/* ===== Composite risk score hero ===== */}
      <RiskScoreHero
        score={score}
        label="Sub risk score"
        contextNote={`${sub.company}'s composite risk reflects ${driverNotes.length ? driverNotes.join(", ") + ", and " : ""}observation ratio of ${obsRatio}:1 against a 3:1 target. Safety and schedule are not independent here — ${safety.stopHrs} hours of stop-work YTD directly amount to roughly ${(safety.stopHrs / 40).toFixed(1)} crew-weeks of float consumed on the critical path.`}
      />

      {/* ===== Safety risk ===== */}
      <div style={{ marginTop: 28 }}>
        <div className="lcard-head" style={{ margin: "8px 0 14px" }}>
          <h3 className="section-title">Safety risk — driving the +{sub.impactWks} wk schedule slip</h3>
          <span className="r muted">
            {(safety.hours / 1000).toFixed(0)}K hours YTD · {safety.daysSince} days since last recordable
          </span>
        </div>

        <SubSafetyKPIs safety={safety} />

        <div style={{ marginTop: 16 }}>
          <DaysSinceCards safety={safety} />
        </div>

        <div className="row-2" style={{ marginTop: 16 }}>
          <ObservationsPanel safety={safety} />
          <CorrectiveActions safety={safety} />
        </div>

        <div style={{ marginTop: 16 }}>
          <IncidentLog />
        </div>
      </div>

      <SectionDivider label="Schedule & contract performance" />

      <div className="l-kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className={`l-kpi s-${sub.rag}`}>
          <div className="stripe"></div>
          <div className="lab">Impact on RFS</div>
          <div className={`val ${sub.rag}`}>+{sub.impactWks}<span className="u">wks</span></div>
          <div className="delta up">▲ 2 wks since last week</div>
        </div>
        <div className="l-kpi s-blue">
          <div className="stripe"></div>
          <div className="lab">% complete</div>
          <div className="val blue">{sub.pct}<span className="u">%</span></div>
          <div className="delta">target {Math.min(100, sub.pct + 12)}% by month-end</div>
        </div>
        <div className="l-kpi s-amber">
          <div className="stripe"></div>
          <div className="lab">SPI</div>
          <div className="val amber" style={{ fontSize: 28 }}>0.78</div>
          <div className="delta up">▲ falling 6 wks</div>
        </div>
      </div>

      <div className="row-2">
        <div className="lcard">
          <div className="lcard-head">
            <h3>Sub milestones — schedule impact</h3>
            <span className="r muted">filter: <b>Schedule-critical</b></span>
          </div>
          <div className="cp-list">
            {SUB_DETAIL.scopeMs.map(m => (
              <div key={m.title} className="cp-row">
                <div className={`cp-icon ${m.state}`}><StatusIcon state={m.state} /></div>
                <div>
                  <div className="t">{m.title}</div>
                  <div className="d">{m.impact}</div>
                </div>
                <div className="right">
                  <span className={`tag ${m.state}`}>{m.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <h3>Schedule slip drivers</h3>
            <span className="r muted">why this sub is late</span>
          </div>
          <div>
            {SUB_DETAIL.drivers.map((d, i) => (
              <div key={d.title} style={{
                display: "grid", gridTemplateColumns: "1fr auto", padding: "14px 0",
                borderBottom: i < SUB_DETAIL.drivers.length - 1 ? "1px solid var(--or-light-line-2)" : "none",
              }}>
                <div>
                  <div style={{ font: "700 13px var(--sm-font-ui)", color: "var(--or-light-ink)" }}>{d.title}</div>
                  <div style={{ font: "500 12px var(--sm-font-ui)", color: "var(--or-light-dim)", marginTop: 2 }}>{d.by}</div>
                  <span style={{
                    display: "inline-block", marginTop: 6,
                    background: "#EEF1F6", padding: "2px 8px", borderRadius: 999,
                    font: "600 10.5px var(--sm-font-ui)", color: "var(--or-light-dim)",
                  }}>{d.cat}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ font: "700 22px var(--sm-font-display)", color: "var(--or-red)" }}>+{d.impact}</div>
                  <div style={{ font: "500 10.5px var(--sm-font-ui)", color: "var(--or-light-mute)" }}>weeks</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 14, background: "#FFF7E5", border: "1px solid #FFE7C1", borderRadius: 10 }}>
            <div style={{ font: "700 11px var(--sm-font-ui)", letterSpacing: ".12em", textTransform: "uppercase", color: "#8A4400" }}>Recovery plan</div>
            <div style={{ font: "500 13px var(--sm-font-ui)", color: "var(--or-light-ink)", marginTop: 4 }}>
              Pursue secondary OEM build slot for switchgear (lead time 28 wks vs 44 wks).
              Owner-furnished long-lead PO to be executed by <b>Jun 15</b>. Targeted recovery: <b>4 of 8 wks</b>.
            </div>
          </div>
        </div>
      </div>

      <div className="row-2" style={{ marginTop: 16 }}>
        <div className="lcard">
          <div className="lcard-head">
            <h3>Sub performance — trim</h3>
            <span className="r muted">earned-value snapshot</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {SUB_DETAIL.trim.map(t => (
              <div key={t.lab}>
                <MicroLabel>{t.lab}</MicroLabel>
                <div style={{ font: "700 17px var(--sm-font-display)", color: "var(--or-light-ink)", marginTop: 3 }}>{t.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <h3>Headcount trend — last 8 weeks</h3>
            <span className="r muted">target plateau: {HEADCOUNT_TARGET}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "10px 0" }}>
            {HEADCOUNT.map((v, i, arr) => (
              <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: "100%",
                  height: `${(v / HEADCOUNT_TARGET) * 100}%`,
                  background: i === arr.length - 1 ? "var(--sm-blue)" : "#C2D5F7",
                  borderRadius: "5px 5px 0 0",
                }}></div>
                <div style={{ font: "500 10px var(--sm-font-ui)", color: "var(--or-light-mute)" }}>W{i + 1}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--or-light-line-2)", paddingTop: 10, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
            <div>
              <MicroLabel>Current</MicroLabel>
              <div style={{ font: "700 22px var(--sm-font-display)", color: "var(--or-light-ink)" }}>
                {current} <span style={{ font: "500 12px var(--sm-font-ui)", color: "var(--or-light-mute)" }}>of {HEADCOUNT_TARGET} target</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <MicroLabel>Gap to plateau</MicroLabel>
              <div style={{ font: "700 22px var(--sm-font-display)", color: "var(--or-red)" }}>{current - HEADCOUNT_TARGET}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
