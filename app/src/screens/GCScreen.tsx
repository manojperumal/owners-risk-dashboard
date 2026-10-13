/* GC composite-risk page (light). Safety leads; schedule supports below. */
import { useMemo } from "react";
import { GCS, GC_SAFETY, OWNERS, SITES, TRADES, TRADE_SAFETY, rstats } from "../data/data";
import { computeGCRiskScore, computeRiskScore } from "../data/riskScore";
import type { OwnerKey, Site, Trade } from "../data/types";
import { SectionDivider, ragInk, ragSoft } from "../components/common";
import { RiskScoreBadge, RiskScoreHero } from "../components/RiskScore";
import { GCSafetyBand, SafetyByTrade } from "../components/Safety";

export function GCScreen({ site, owner, onSub }: {
  site: Site; owner: OwnerKey; onSub: (t: Trade) => void;
}) {
  const gc = GCS[site.gc];
  const maxImpact = TRADES.reduce((a, t) => Math.max(a, t.impactWks), 0);
  const hotTrades = TRADES.filter(t => t.impactWks > 0).sort((a, b) => b.impactWks - a.impactWks);
  const worstSlip = hotTrades[0];

  const { gcScore, tradeScores, worst } = useMemo(() => {
    const tradeScores = TRADES.map((t, i) => computeRiskScore(t, TRADE_SAFETY[i]));
    const worstIdx = tradeScores.reduce((w, s, i) => (s.total > tradeScores[w].total ? i : w), 0);
    return {
      gcScore: computeGCRiskScore(),
      tradeScores,
      worst: { ...tradeScores[worstIdx], trade: TRADES[worstIdx] },
    };
  }, []);

  return (
    <div className="page-light">
      <div className="proj-header">
        <div className="left">
          <div className="eyebrow">{site.id} · {site.name} — Contract structure</div>
          <h1>Composite risk — {gc.name}</h1>
          <div className="sub">
            <span>Single GC delivery model · {TRADES.length} prime trade contracts · <b>{site.mw} MW</b> scope</span>
            <span>Worst trade: <b>{worst.trade.company}</b> ({worst.total})</span>
          </div>
        </div>
        <div className="proj-actions">
          <button className="btn btn-ghost">⤓ Export contract map</button>
          <button className="btn btn-dark">Open contractor scorecards</button>
        </div>
      </div>

      {/* ===== Composite risk score hero ===== */}
      <RiskScoreHero
        // Worst-trade parts drive the GC-level driver bars (most actionable).
        score={{ ...gcScore, parts: worst.parts }}
        label="GC risk score"
        contextNote={`Across ${TRADES.length} trades and ${(GC_SAFETY.hours / 1000).toFixed(0)}K work-hours, ${gc.name}'s composite risk is driven by ${worst.trade.company} (${worst.trade.trade.toLowerCase()} — ${worst.total}), elevated TRIR vs the BLS heavy-civil benchmark, and ${GC_SAFETY.stopHrs} hours of stop-work YTD. Schedule-side contribution is led by utility-interconnect dependencies and switchgear long-lead.`}
      />

      {/* ===== Safety risk ===== */}
      <div style={{ marginTop: 20 }}>
        <GCSafetyBand />
        <SafetyByTrade onSub={onSub} tradeScores={tradeScores} />
      </div>

      {/* ===== Org tree ===== */}
      <div className="org-canvas" style={{ marginTop: 20 }}>
        <div className="org-tree">
          <div className="org-level">
            <div className="org-node owner" style={{ cursor: "default" }}>
              <div className="role">Owner — VP of Risk</div>
              <div className="name">{OWNERS[owner].name}</div>
              <div className="meta">{SITES.length} active builds · {rstats.totalMW.toLocaleString("en-US")} MW · {site.id} selected</div>
            </div>
          </div>

          <div style={{ width: 2, height: 20, background: "#C8D0DE", margin: "-18px 0 -18px" }}></div>

          <div className="org-level">
            <div className="org-node gc has-issue" style={{ minWidth: 300, cursor: "default" }}>
              <div className="role">General Contractor</div>
              <div className="name">{gc.name}</div>
              <div className="meta">CMAR delivery · {site.pct}% complete</div>
              <div className="badge-strip" style={{ marginTop: 10 }}>
                <RiskScoreBadge score={gcScore.total} band={gcScore.band} size="sm" />
                <span className="b amber">{site.sched > 0 ? "+" : ""}{site.sched} wks</span>
                <span className="b green">SPI 0.84</span>
              </div>
            </div>
          </div>

          {/* connector */}
          <div style={{ width: "100%", maxWidth: 920, height: 30, position: "relative", marginTop: -18 }}>
            <svg width="100%" height="30" viewBox="0 0 920 30" preserveAspectRatio="none" style={{ display: "block" }} aria-hidden="true">
              <line x1="460" y1="0" x2="460" y2="12" stroke="#C8D0DE" strokeWidth="1.5" />
              <line x1="110" y1="12" x2="810" y2="12" stroke="#C8D0DE" strokeWidth="1.5" />
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1={110 + i * 233} y1="12" x2={110 + i * 233} y2="30" stroke="#C8D0DE" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

          {/* Trades — risk-scored cards */}
          <div className="org-subs">
            {TRADES.map((t, i) => {
              const score = tradeScores[i];
              return (
                <div
                  key={t.slug}
                  className={`org-sub r-${t.rag}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSub(t)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSub(t); } }}
                >
                  <div className="stripe"></div>
                  <div className="trade">{t.trade}</div>
                  <div className="name">{t.company}</div>
                  <div style={{ marginTop: 8 }}>
                    <RiskScoreBadge score={score.total} band={score.band} size="sm" />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, font: "500 11px var(--sm-font-ui)", color: "var(--or-light-mute)" }}>
                    <span>Safety <b style={{ color: "#B11631" }}>{score.safety}</b></span>
                    <span>Sched <b style={{ color: "#B97300" }}>{score.schedule}</b></span>
                    <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--or-light-ink)" }}>{t.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionDivider label="Schedule & contract performance" />

      {/* Mini KPI band — supporting context */}
      <div className="l-kpi-row" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 20 }}>
        <div className="l-kpi s-red">
          <div className="stripe"></div>
          <div className="lab">Trades driving slip</div>
          <div className="val red">{TRADES.filter(t => t.rag === "red").length}<span className="u">of {TRADES.length}</span></div>
          <div className="delta">Electrical & Civil leading delay</div>
        </div>
        <div className="l-kpi s-amber">
          <div className="stripe"></div>
          <div className="lab">Worst trade slip</div>
          <div className="val amber">+{maxImpact}<span className="u">wks</span></div>
          <div className="delta">{worstSlip?.shortName ?? "—"} — switchgear & gens</div>
        </div>
        <div className="l-kpi s-blue">
          <div className="stripe"></div>
          <div className="lab">GC overall SPI</div>
          <div className="val blue">0.84</div>
          <div className="delta down">improved from 0.78</div>
        </div>
        <div className="l-kpi s-blue">
          <div className="stripe"></div>
          <div className="lab">Active subs on site</div>
          <div className="val">312<span className="u">workers</span></div>
          <div className="delta">peak target 480 by Q1'27</div>
        </div>
      </div>

      <div className="row-2" style={{ marginTop: 20 }}>
        <div className="lcard">
          <div className="lcard-head">
            <h3>Trade contribution to schedule slip</h3>
            <span className="r muted">+{maxImpact} wks max single-trade impact</span>
          </div>
          <div>
            {hotTrades.map(t => (
              <div key={t.slug} className="phase-row">
                <div className="name">{t.trade}</div>
                <div className="track">
                  <div className={`fill ${t.rag}`} style={{ width: `${(t.impactWks / maxImpact) * 100}%` }}></div>
                </div>
                <div className={`impact ${t.rag}`}>+{t.impactWks}<span className="sm">wks</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <h3>Top schedule-driving subs</h3>
            <span className="r muted">click to drill into sub</span>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Sub</th><th>Trade</th><th className="num">Slip</th><th className="num">% complete</th></tr>
            </thead>
            <tbody>
              {hotTrades.map(t => (
                <tr key={t.slug} className="row-click" onClick={() => onSub(t)}>
                  <td>
                    <div className="who">
                      <div className="av-sm" style={ragSoft(t.rag)}>{t.shortName.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="ttl">{t.company}</div>
                        <div className="sub">{t.scope}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ font: "500 12px var(--sm-font-ui)", color: "var(--or-light-dim)" }}>{t.trade}</span></td>
                  <td className="num"><b style={{ color: ragInk(t.rag) }}>+{t.impactWks} wks</b></td>
                  <td className="num">{t.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
