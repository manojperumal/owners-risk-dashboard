/* GC tree + Sub/Trade detail — LIGHT */

function ConnectorSVG({ rows = 1 }) {
  return (
    <svg width="100%" height="36" viewBox="0 0 800 36" preserveAspectRatio="none" style={{display:"block"}}>
      <line x1="400" y1="0" x2="400" y2="14" stroke="#C8D0DE" strokeWidth="1.5"/>
      <line x1="100" y1="14" x2="700" y2="14" stroke="#C8D0DE" strokeWidth="1.5"/>
      <line x1="100" y1="14" x2="100" y2="36" stroke="#C8D0DE" strokeWidth="1.5"/>
      <line x1="300" y1="14" x2="300" y2="36" stroke="#C8D0DE" strokeWidth="1.5"/>
      <line x1="500" y1="14" x2="500" y2="36" stroke="#C8D0DE" strokeWidth="1.5"/>
      <line x1="700" y1="14" x2="700" y2="36" stroke="#C8D0DE" strokeWidth="1.5"/>
    </svg>
  );
}

function GCTreeScreen({ site, onBack, onSub, owner }) {
  const gc = GCS[site.gc];
  const ownerObj = OWNERS[owner];
  const totalImpact = TRADES.reduce((a,t) => Math.max(a, t.impactWks), 0);
  const hotTrades = TRADES.filter(t => t.impactWks > 0).sort((a,b) => b.impactWks - a.impactWks);

  // Composite risk score for the GC (weighted by hours)
  const gcScore = computeGCRiskScore();
  // Per-trade scores for tree + tables (precompute once)
  const tradeScores = TRADES.map((t,i) => computeRiskScore(t, TRADE_SAFETY[i]));
  const worstTrade = tradeScores
    .map((s,i) => ({ ...s, trade: TRADES[i] }))
    .sort((a,b) => b.total - a.total)[0];

  return (
    <div className="page-light">
      <div className="proj-header">
        <div className="left">
          <div className="eyebrow">{site.id} · {site.name} — Contract structure</div>
          <h1>Composite risk — {gc.name}</h1>
          <div className="sub">
            <span>Single GC delivery model · {TRADES.length} prime trade contracts · <b>{site.mw} MW</b> scope</span>
            <span>Worst trade: <b>{worstTrade.trade.company}</b> ({worstTrade.total})</span>
          </div>
        </div>
        <div className="proj-actions">
          <button className="btn btn-ghost">⤓ Export contract map</button>
          <button className="btn btn-dark">Open contractor scorecards</button>
        </div>
      </div>

      {/* ===== COMPOSITE RISK SCORE HERO ===== */}
      <RiskScoreHero
        score={{
          total: gcScore.total,
          band: gcScore.band,
          safety: gcScore.safety,
          schedule: gcScore.schedule,
          // Use the worst-trade parts as the GC-level driver bars (most actionable)
          parts: worstTrade.parts
        }}
        label="GC risk score"
        contextNote={`Across ${TRADES.length} trades and ${(GC_SAFETY.hours/1000).toFixed(0)}K work-hours, ${gc.name}'s composite risk is driven by ${worstTrade.trade.company} (electrical — ${worstTrade.total}), elevated TRIR vs the BLS heavy-civil benchmark, and ${GC_SAFETY.stopHrs} hours of stop-work YTD. Schedule-side contribution is led by utility-interconnect dependencies and switchgear long-lead.`}
      />

      {/* ===== SAFETY RISK BAND (now elevated) ===== */}
      <div style={{ marginTop: 20 }}>
        <GCSafetyBand />
        <SafetyByTrade onSub={onSub} tradeScores={tradeScores} />
      </div>

      <div className="org-canvas" style={{ marginTop: 20 }}>
        <div className="org-tree">

          {/* OWNER */}
          <div className="org-level">
            <div className="org-node owner" style={{ cursor: "default" }}>
              <div className="role">Owner — VP of Risk</div>
              <div className="name">{ownerObj.name}</div>
              <div className="meta">25 active builds · 1,733 MW · {site.id} selected</div>
            </div>
          </div>

          <div style={{ width: 2, height: 20, background: "#C8D0DE", margin: "-18px 0 -18px" }}></div>

          {/* GC */}
          <div className="org-level">
            <div className={`org-node gc has-issue`} style={{ minWidth: 300, cursor: "default" }}>
              <div className="role">General Contractor</div>
              <div className="name">{gc.name}</div>
              <div className="meta">CMAR delivery · {site.pct}% complete</div>
              <div className="badge-strip" style={{ marginTop: 10 }}>
                <RiskScoreBadge score={gcScore.total} band={gcScore.band} size="sm" />
                <span className="b amber">+{site.sched} wks</span>
                <span className="b green">SPI 0.84</span>
              </div>
            </div>
          </div>

          {/* connector */}
          <div style={{ width: "100%", maxWidth: 920, height: 30, position: "relative", marginTop: -18 }}>
            <svg width="100%" height="30" viewBox="0 0 920 30" preserveAspectRatio="none" style={{ display: "block" }}>
              <line x1="460" y1="0" x2="460" y2="12" stroke="#C8D0DE" strokeWidth="1.5"/>
              <line x1="110" y1="12" x2="810" y2="12" stroke="#C8D0DE" strokeWidth="1.5"/>
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1={110 + i*233} y1="12" x2={110 + i*233} y2="30" stroke="#C8D0DE" strokeWidth="1.5"/>
              ))}
            </svg>
          </div>

          {/* TRADES — risk-scored cards */}
          <div className="org-subs">
            {TRADES.map((t, i) => {
              const score = tradeScores[i];
              return (
                <div key={i} className={`org-sub r-${t.rag}`} onClick={() => onSub(t)}>
                  <div className="stripe"></div>
                  <div className="trade">{t.trade}</div>
                  <div className="name">{t.company}</div>
                  <div style={{ marginTop: 8 }}>
                    <RiskScoreBadge score={score.total} band={score.band} size="sm" />
                  </div>
                  <div style={{
                    display: "flex", gap: 12, marginTop: 8,
                    font: "500 11px var(--sm-font-ui)", color: "var(--or-light-mute)"
                  }}>
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

      {/* ─── Schedule & contract performance ─── */}
      <div style={{
        margin: "32px 0 18px",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <div style={{ height: 1, background: "var(--or-light-line)", flex: 1 }}></div>
        <div style={{
          font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--or-light-mute)"
        }}>Schedule & contract performance</div>
        <div style={{ height: 1, background: "var(--or-light-line)", flex: 1 }}></div>
      </div>

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
          <div className="val amber">+{totalImpact}<span className="u">wks</span></div>
          <div className="delta">Rosendin — switchgear & gens</div>
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

      {/* Below: Schedule-impact summary across trades */}
      <div className="row-2" style={{ marginTop: 20 }}>
        <div className="lcard">
          <div className="lcard-head">
            <h3>Trade contribution to schedule slip</h3>
            <span className="r muted">+{totalImpact} wks max single-trade impact</span>
          </div>
          <div>
            {hotTrades.map((t,i) => (
              <div key={i} className="phase-row">
                <div className="name">{t.trade}</div>
                <div className="track">
                  <div className={`fill ${t.rag === "red" ? "red" : t.rag === "amber" ? "amber" : "green"}`}
                       style={{ width: `${(t.impactWks/totalImpact)*100}%` }}></div>
                </div>
                <div className={`impact ${t.rag === "red" ? "red" : t.rag === "amber" ? "amber" : "green"}`}>
                  +{t.impactWks}<span className="sm">wks</span>
                </div>
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
              {hotTrades.map((t,i) => (
                <tr key={i} className="row-click" onClick={() => onSub(t)}>
                  <td>
                    <div className="who">
                      <div className="av-sm" style={{
                        background: t.rag === "red" ? "#FDE5E8" : t.rag === "amber" ? "#FFE7C1" : "#D7F4DE",
                        color: t.rag === "red" ? "#B11631" : t.rag === "amber" ? "#8A4400" : "#146E2B"
                      }}>{t.shortName.slice(0,2).toUpperCase()}</div>
                      <div>
                        <div className="ttl">{t.company}</div>
                        <div className="sub">{t.scope}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{font:"500 12px var(--sm-font-ui)",color:"var(--or-light-dim)"}}>{t.trade}</span></td>
                  <td className="num">
                    <b style={{color: t.rag === "red" ? "var(--or-red)" : t.rag === "amber" ? "#B97300" : "#1B9C5C"}}>
                      +{t.impactWks} wks
                    </b>
                  </td>
                  <td className="num">{t.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SAFETY RISK SECTION ===== */}
      <div style={{ marginTop: 28 }}>
      </div>
    </div>
  );
}


/* ----------- SUB DETAIL ----------- */
function SubDetailScreen({ site, sub, onBack, onGC }) {
  const gc = GCS[site.gc];
  // Find this sub's safety record by matching the trade in TRADES → TRADE_SAFETY
  const tradeIdx = TRADES.findIndex(t => t.company === sub.company);
  const safety = TRADE_SAFETY[tradeIdx >= 0 ? tradeIdx : 0];
  const score = computeRiskScore(sub, safety);

  // Context narrative is generated from the actual drivers
  const driverNotes = [];
  if (safety.lt > 0) driverNotes.push(`${safety.lt} lost-time event(s) (${safety.ltd} days)`);
  if (safety.rec > 0) driverNotes.push(`${safety.rec} recordable${safety.rec > 1 ? "s" : ""} YTD`);
  if (safety.trir > 2.4) driverNotes.push(`TRIR ${safety.trir.toFixed(1)} vs BLS 2.4`);
  if (sub.impactWks > 4) driverNotes.push(`+${sub.impactWks} wks impact on RFS`);
  if (safety.stopHrs > 50) driverNotes.push(`${safety.stopHrs} hrs of stop-work`);

  return (
    <div className="page-light">
      <div className="proj-header">
        <div className="left">
          <div className="eyebrow">
            {site.id} ·{" "}
            <button onClick={onGC} style={{background:"none",border:0,padding:0,color:"var(--sm-blue)",font:"inherit",cursor:"pointer"}}>{gc.name}</button>
            {" "}·{" "}{sub.trade}
          </div>
          <h1>{sub.company} <span style={{ color: "var(--or-light-mute)", fontWeight: 500, fontSize: 22 }}>· Trade contractor</span></h1>
          <div className="sub">
            <span>Scope: <b>{sub.scope}</b></span>
            <span>Status: <span className={`tag ${sub.rag === "red" ? "critical" : sub.rag === "amber" ? "atrisk" : "ontrack"}`}>
              {sub.rag === "red" ? "Critical" : sub.rag === "amber" ? "At risk" : "On track"}
            </span></span>
            <span>Crew today: <b>84/120</b></span>
          </div>
        </div>
        <div className="proj-actions">
          <button className="btn btn-ghost">📞 Contact PM</button>
          <button className="btn btn-ghost">📄 Subcontract</button>
          <button className="btn btn-primary">Schedule recovery meeting</button>
        </div>
      </div>

      {/* ===== COMPOSITE RISK SCORE HERO ===== */}
      <RiskScoreHero
        score={score}
        label="Sub risk score"
        contextNote={`${sub.company}'s composite risk reflects ${driverNotes.length ? driverNotes.join(", ") + ", and " : ""}observation ratio of ${(safety.kudos/Math.max(1,safety.atRisk)).toFixed(1)}:1 against a 3:1 target. Safety and schedule are not independent here — ${safety.stopHrs} hours of stop-work YTD directly amount to roughly ${(safety.stopHrs/40).toFixed(1)} crew-weeks of float consumed on the critical path.`}
      />

      {/* ===== SAFETY RISK ===== */}
      <div style={{ marginTop: 28 }}>
        <div className="lcard-head" style={{ margin: "8px 0 14px" }}>
          <h3 style={{ font: "700 16px var(--sm-font-display)", color: "var(--or-light-ink)" }}>
            Safety risk — driving the +{sub.impactWks} wk schedule slip
          </h3>
          <span className="r muted">
            {(safety.hours/1000).toFixed(0)}K hours YTD · {safety.daysSince} days since last recordable
          </span>
        </div>

        <SubSafetyKPIs sub={sub} safety={safety} />

        <div style={{ marginTop: 16 }}>
          <DaysSinceCards safety={safety} />
        </div>

        <div className="row-2" style={{ marginTop: 16 }}>
          <ObservationsPanel safety={safety} />
          <div className="lcard">
            <div className="lcard-head">
              <h3>Corrective actions — open</h3>
              <span className="r muted"><b style={{ color: "var(--or-red)" }}>{safety.openCA}</b> active · <b>2</b> aged {'>'} 14d</span>
            </div>
            <div>
              {[
                { id: "CA-219", title: "Upgrade glove standard to ANSI A4 — terminations", owner: "Foreman Ramirez", due: "May 18", age: 8,  state: "in-progress" },
                { id: "CA-211", title: "100% tool-tethering audit on man-lifts",            owner: "Safety Lt. Kim",  due: "May 20", age: 16, state: "overdue" },
                { id: "CA-204", title: "Revise LOTO permit — verifier sign-off required",   owner: "GC Safety",       due: "May 14", age: 22, state: "overdue" },
              ].map((c,i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center",
                  padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--or-light-line-2)" : "none"
                }}>
                  <span className="mono" style={{ font: "600 12px var(--sm-font-mono)", color: "var(--or-light-mute)" }}>{c.id}</span>
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
            <div className="sched-cost" style={{ marginTop: 14 }}>
              <div className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                </svg>
              </div>
              <div className="t">
                Two aged corrective actions block <b>re-energization permit</b> for feeder 4B —
                holding the gen paralleling burn-in.
              </div>
              <div className="v">+8h</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <IncidentLog />
        </div>
      </div>

      {/* ─── Schedule & contract performance ─── */}
      <div style={{
        margin: "32px 0 18px",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <div style={{ height: 1, background: "var(--or-light-line)", flex: 1 }}></div>
        <div style={{
          font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--or-light-mute)"
        }}>Schedule & contract performance</div>
        <div style={{ height: 1, background: "var(--or-light-line)", flex: 1 }}></div>
      </div>

      <div className="l-kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className={`l-kpi s-${sub.rag}`}>
          <div className="stripe"></div>
          <div className="lab">Impact on RFS</div>
          <div className={`val ${sub.rag === "red" ? "red" : sub.rag === "amber" ? "amber" : "green"}`}>+{sub.impactWks}<span className="u">wks</span></div>
          <div className="delta up">▲ 2 wks since last week</div>
        </div>
        <div className="l-kpi s-blue">
          <div className="stripe"></div>
          <div className="lab">% complete</div>
          <div className="val blue">{sub.pct}<span className="u">%</span></div>
          <div className="delta">target {sub.pct + 12}% by month-end</div>
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
            {SUB_DETAIL.scopeMs.map((m, i) => (
              <div key={i} className="cp-row">
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
              <div key={i} style={{
                display:"grid", gridTemplateColumns: "1fr auto",
                padding: "14px 0", borderBottom: i < SUB_DETAIL.drivers.length-1 ? "1px solid var(--or-light-line-2)" : "none"
              }}>
                <div>
                  <div style={{font:"700 13px var(--sm-font-ui)",color:"var(--or-light-ink)"}}>{d.title}</div>
                  <div style={{font:"500 12px var(--sm-font-ui)",color:"var(--or-light-dim)",marginTop:2}}>{d.by}</div>
                  <span style={{
                    display:"inline-block",marginTop:6,
                    background:"#EEF1F6",padding:"2px 8px",borderRadius:999,
                    font:"600 10.5px var(--sm-font-ui)",color:"var(--or-light-dim)"
                  }}>{d.cat}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{font:"700 22px var(--sm-font-display)",color:"var(--or-red)"}}>+{d.impact}</div>
                  <div style={{font:"500 10.5px var(--sm-font-ui)",color:"var(--or-light-mute)"}}>weeks</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:16,padding:14,background:"#FFF7E5",border:"1px solid #FFE7C1",borderRadius:10}}>
            <div style={{font:"700 11px var(--sm-font-ui)",letterSpacing:".12em",textTransform:"uppercase",color:"#8A4400"}}>Recovery plan</div>
            <div style={{font:"500 13px var(--sm-font-ui)",color:"var(--or-light-ink)",marginTop:4}}>
              Pursue secondary OEM build slot for switchgear (lead time 28 wks vs 44 wks).
              Owner-furnished long-lead PO to be executed by <b>Jun 15</b>. Targeted recovery: <b>4 of 8 wks</b>.
            </div>
          </div>
        </div>
      </div>

      <div className="row-2" style={{marginTop:16}}>
        <div className="lcard">
          <div className="lcard-head">
            <h3>Sub performance — trim</h3>
            <span className="r muted">earned-value snapshot</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {SUB_DETAIL.trim.map((t,i) => (
              <div key={i}>
                <div style={{font:"600 10px var(--sm-font-ui)",letterSpacing:".12em",textTransform:"uppercase",color:"var(--or-light-mute)"}}>{t.lab}</div>
                <div style={{font:"700 17px var(--sm-font-display)",color:"var(--or-light-ink)",marginTop:3}}>{t.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <h3>Headcount trend — last 8 weeks</h3>
            <span className="r muted">target plateau: 120</span>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140,padding:"10px 0"}}>
            {[58,62,71,84,91,88,82,84].map((v,i,arr) => (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{
                  width:"100%",
                  height: `${v/120*100}%`,
                  background: i === arr.length-1 ? "var(--sm-blue)" : "#C2D5F7",
                  borderRadius: "5px 5px 0 0"
                }}></div>
                <div style={{font:"500 10px var(--sm-font-ui)",color:"var(--or-light-mute)"}}>W{i+1}</div>
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid var(--or-light-line-2)",paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{font:"600 10px var(--sm-font-ui)",letterSpacing:".12em",textTransform:"uppercase",color:"var(--or-light-mute)"}}>Current</div>
              <div style={{font:"700 22px var(--sm-font-display)",color:"var(--or-light-ink)"}}>84 <span style={{font:"500 12px var(--sm-font-ui)",color:"var(--or-light-mute)"}}>of 120 target</span></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{font:"600 10px var(--sm-font-ui)",letterSpacing:".12em",textTransform:"uppercase",color:"var(--or-light-mute)"}}>Gap to plateau</div>
              <div style={{font:"700 22px var(--sm-font-display)",color:"var(--or-red)"}}>-36</div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

window.GCTreeScreen = GCTreeScreen;
window.SubDetailScreen = SubDetailScreen;
