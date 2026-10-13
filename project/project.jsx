/* Project detail screen — LIGHT. Three layout variants (Tweak).
   A = "Operator view"  → KPI row + critical path + phase delays  (matches user's screenshots)
   B = "Schedule first" → Big Gantt + contractor strip
   C = "Tabbed"         → Overview / Schedule / Cost / Contractors / Commissioning
*/

function StatusIcon({ state }) {
  // simple SVG glyph
  if (state === "ontrack")  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  if (state === "watch")    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>;
  if (state === "atrisk")   return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>;
  if (state === "late" || state === "critical") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5"/><circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none"/></svg>;
  return null;
}

function ProjectHeader({ site, onBack, onGC }) {
  const gc = GCS[site.gc];
  const schedClass = site.sched > 4 ? "red" : site.sched > 0 ? "amber" : "green";
  const schedText = site.sched === 0 ? "On plan" : (site.sched > 0 ? `+${site.sched} wks` : `${site.sched} wk`);

  return (
    <div className="proj-header">
      <div className="left">
        <div className="eyebrow">Data center · {site.region}</div>
        <h1>{site.name} <span style={{ color: "var(--or-light-mute)", fontWeight: 500, fontSize: 22 }}>· {site.id}</span></h1>
        <div className="sub">
          <span>📍 {site.city}</span>
          <span>⚡ <b>{site.mw} MW</b></span>
          <span>GC: <button onClick={onGC} style={{background:"none",border:0,padding:0,color:"var(--sm-blue)",font:"600 13px var(--sm-font-ui)",cursor:"pointer"}}>{gc.name} →</button></span>
          <span>Phase: <b>{site.phase}</b></span>
          <span>Forecast RFS: <b>{site.rfs}</b> <span className={schedClass === "red" ? "" : ""} style={{
            marginLeft: 4, padding: "1px 7px", borderRadius: 4,
            background: schedClass === "red" ? "#FDE5E8" : schedClass === "amber" ? "#FFE7C1" : "#D7F4DE",
            color: schedClass === "red" ? "#B11631" : schedClass === "amber" ? "#8A4400" : "#146E2B",
            fontWeight: 700
          }}>{schedText}</span></span>
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

function KPIRow({ site }) {
  const schedClass = site.sched > 4 ? "red" : site.sched > 0 ? "amber" : "green";
  return (
    <div className="l-kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
      <div className={`l-kpi s-${schedClass}`}>
        <div className="stripe"></div>
        <div className="lab">Schedule variance</div>
        <div className={`val ${schedClass}`}>+{site.sched}<span className="u">wks</span></div>
        <div className="delta up">▲ 4 wks since last qtr</div>
      </div>
      <div className={`l-kpi s-${site.rag}`}>
        <div className="stripe"></div>
        <div className="lab">Delivery risk</div>
        <div className={`val ${site.rag === "red" ? "red" : site.rag === "amber" ? "amber" : "green"}`}
          style={{ fontSize: 22, lineHeight: 1.1, paddingTop: 4 }}>
          {site.rag === "red" ? "High" : site.rag === "amber" ? "Medium-High" : "Low"}
        </div>
        <div className="delta">critical path impacted · 2 milestones at risk</div>
      </div>
      <div className="l-kpi s-blue">
        <div className="stripe"></div>
        <div className="lab">Capacity at risk</div>
        <div className="val">{Math.round(site.mw * (site.rag === "red" ? 0.6 : site.rag === "amber" ? 0.3 : 0.05))}<span className="u">MW</span></div>
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
        {CP_DEFAULT.map((m, i) => (
          <div key={i} className="cp-row">
            <div className={`cp-icon ${m.state}`}><StatusIcon state={m.state} /></div>
            <div>
              <div className="t">{m.title}</div>
              <div className="d">{m.impact}</div>
            </div>
            <div className="right">
              <div className={`impact ${m.dragWks > 5 ? "red" : m.dragWks > 0 ? "amber" : "green"}`}>
                <em>{m.dragWks > 0 ? `+${m.dragWks}` : "0"} wks</em><br/>
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
        {PHASE_DEFAULT.map((p, i) => (
          <div key={i} className="phase-row">
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

function ContractorStrip({ onGC }) {
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
          {TRADES.map((t, i) => (
            <tr key={i} className="row-click" onClick={onGC}>
              <td>
                <div className="who">
                  <div className="av-sm">{t.shortName.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div className="ttl">{t.company}</div>
                    <div className="sub">{t.trade}</div>
                  </div>
                </div>
              </td>
              <td className="num">{t.pct}%</td>
              <td className="num"><b style={{color: t.rag === "red" ? "var(--or-red)" : t.rag === "amber" ? "#B97300" : "#1B9C5C"}}>
                {(1 - t.impactWks * 0.04).toFixed(2)}</b>
              </td>
              <td className="num">
                {t.impactWks > 0 ? (
                  <b style={{color: t.rag === "red" ? "var(--or-red)" : t.rag === "amber" ? "#B97300" : "#1B9C5C"}}>+{t.impactWks} wks</b>
                ) : <span className="muted">—</span>}
              </td>
              <td><span className={`tag ${t.rag === "red" ? "critical" : t.rag === "amber" ? "atrisk" : "ontrack"}`}>
                {t.rag === "red" ? "Critical" : t.rag === "amber" ? "At risk" : "On track"}
              </span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskRegister() {
  return (
    <div className="lcard padless">
      <div style={{ padding: "16px 20px 0 20px" }} className="lcard-head">
        <h3>Active risk register — schedule-impacting</h3>
        <span className="r"><span className="muted">8 active · sorted by impact (wks)</span></span>
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
          {RISKS_DEFAULT.map((r,i) => (
            <tr key={i}>
              <td><span className="mono" style={{font:"600 12px var(--sm-font-mono)",color:"var(--or-light-mute)"}}>{r.id}</span></td>
              <td>
                <div className="ttl">{r.title}</div>
                <div className="sub">{r.mitigation}</div>
              </td>
              <td><span style={{font:"500 12px var(--sm-font-ui)",color:"var(--or-light-dim)"}}>{r.cat}</span></td>
              <td><span style={{font:"500 12px var(--sm-font-ui)",color:"var(--or-light-dim)"}}>{r.owner}</span></td>
              <td><span className={`tag ${r.sev === "Critical" ? "critical" : r.sev === "High" ? "atrisk" : "watch"}`}>{r.sev}</span></td>
              <td className="num"><b style={{color: r.impactWks > 6 ? "var(--or-red)" : r.impactWks > 3 ? "#B97300" : "var(--or-light-dim)"}}>+{r.impactWks} wks</b></td>
              <td><span style={{font:"600 11.5px var(--sm-font-ui)",color: r.status === "Active" ? "var(--or-red)" : r.status === "Mitigating" ? "#B97300" : "var(--or-light-dim)"}}>
                {r.trend === "up" ? "▲" : r.trend === "down" ? "▼" : "—"} {r.status}
              </span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------- Layout B: Gantt-first -------- */
function GanttView() {
  // 8 quarters (Q3-25 .. Q2-27) – simple model
  const Q = ["Q3'25","Q4'25","Q1'26","Q2'26","Q3'26","Q4'26","Q1'27","Q2'27","Q3'27","Q4'27"];
  const cols = Q.length;
  const colPct = 100 / cols;

  // bar: start col, span cols, plan vs forecast
  const rows = [
    { name: "Site civil",          swatch:"#9F7BEA", plan:[0, 3],   fcst:[0, 4],   color:"red"   },
    { name: "Structural steel",    swatch:"#4F8EF7", plan:[2, 3],   fcst:[2, 4],   color:"red"   },
    { name: "Envelope / roof",     swatch:"#2BBE7B", plan:[4, 2],   fcst:[4, 2],   color:"green" },
    { name: "Utility interconnect",swatch:"#F05B6A", plan:[3, 3],   fcst:[3, 6],   color:"red"   },
    { name: "MEP rough-in",        swatch:"#F5A524", plan:[4, 3],   fcst:[4.5, 3.5], color:"amber" },
    { name: "Switchgear set",      swatch:"#9F7BEA", plan:[5, 1],   fcst:[6, 1.5], color:"red"   },
    { name: "Generator delivery",  swatch:"#F05B6A", plan:[5, 1.5], fcst:[7, 1.5], color:"red"   },
    { name: "IT white-space",      swatch:"#4F8EF7", plan:[6, 2],   fcst:[7, 2],   color:"amber" },
    { name: "Commissioning & IST", swatch:"#F5A524", plan:[7, 2],   fcst:[8.5, 2], color:"red"   },
    { name: "Substantial completion", swatch:"#0F1A2E", plan:[8.5, 0.5], fcst:[9.5, 0.5], color:"red" },
  ];
  const todayCol = 5.4; // somewhere mid Q4-26

  return (
    <div className="lcard">
      <div className="lcard-head">
        <h3>Master schedule — plan vs forecast</h3>
        <div className="r" style={{ gap: 14 }}>
          <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
            <span style={{width:14,height:10,border:"1px dashed #5B6479",borderRadius:2,background:"rgba(15,26,46,.16)"}}></span>
            Baseline plan
          </span>
          <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
            <span style={{width:14,height:10,background:"var(--or-red)",borderRadius:2}}></span>
            Forecast
          </span>
        </div>
      </div>
      <div className="gantt-wrap">
        <div className="gantt" style={{ minWidth: 920 }}>
          <div className="col-head">Phase</div>
          <div className="timeline-head" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Q.map((q,i) => <div key={i} className="q">{q}</div>)}
          </div>

          {rows.map((r,i) => (
            <React.Fragment key={i}>
              <div className="row-name">
                <span className="swatch" style={{ background: r.swatch }}></span>
                {r.name}
              </div>
              <div className="row-track" style={{ position: "relative" }}>
                {/* grid lines */}
                {Q.map((_,gi) => (
                  <div key={gi} className="grid-q" style={{ left: `${gi*colPct}%`, width: `${colPct}%` }}></div>
                ))}
                {/* plan bar */}
                <div className="bar plan" style={{
                  left: `${r.plan[0]*colPct}%`,
                  width: `${r.plan[1]*colPct}%`
                }}>plan</div>
                {/* forecast bar */}
                <div className={`bar ${r.color}`} style={{
                  left: `${r.fcst[0]*colPct}%`,
                  width: `${r.fcst[1]*colPct}%`,
                  top: 26
                }}>{r.name.split(" ")[0]}</div>

                {/* today line */}
                <div className="now-line" style={{ left: `${todayCol*colPct}%` }}></div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectScreen({ site, onBack, onGC, layout }) {
  const [tab, setTab] = React.useState("overview");

  return (
    <div className="page-light">
      <ProjectHeader site={site} onBack={onBack} onGC={onGC} />
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
          <div className="ltabs">
            <button className={tab==="overview" ? "on" : ""} onClick={() => setTab("overview")}>Overview</button>
            <button className={tab==="schedule" ? "on" : ""} onClick={() => setTab("schedule")}>Schedule <span className="cnt">7</span></button>
            <button className={tab==="contractors" ? "on" : ""} onClick={() => setTab("contractors")}>Contractors <span className="cnt">8</span></button>
            <button className={tab==="commissioning" ? "on" : ""} onClick={() => setTab("commissioning")}>Commissioning</button>
            <button className={tab==="risks" ? "on" : ""} onClick={() => setTab("risks")}>Risks <span className="cnt">8</span></button>
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
          {tab === "commissioning" && (
            <div className="lcard">
              <div className="lcard-head"><h3>Commissioning readiness</h3><span className="r muted">L1 → L5</span></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginTop:8}}>
                {[
                  { l:"L1 Factory", state:"green",  pct:92 },
                  { l:"L2 Site receipt", state:"green", pct:78 },
                  { l:"L3 Static",  state:"amber", pct:42 },
                  { l:"L4 Functional", state:"amber", pct:12 },
                  { l:"L5 IST",     state:"red",   pct:0  },
                ].map((s,i) => (
                  <div key={i} style={{padding:14,border:"1px solid var(--or-light-line)",borderRadius:10}}>
                    <div style={{font:"700 10px var(--sm-font-ui)",letterSpacing:".12em",textTransform:"uppercase",color:"var(--or-light-mute)"}}>{s.l}</div>
                    <div style={{font:"700 28px var(--sm-font-display)",color: s.state === "red" ? "var(--or-red)" : s.state === "amber" ? "#B97300" : "#1B9C5C",marginTop:6}}>{s.pct}%</div>
                    <div style={{height:6,background:"var(--or-light-line)",borderRadius:999,marginTop:6,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${s.pct}%`,background: s.state === "red" ? "var(--or-red)" : s.state === "amber" ? "var(--or-amber)" : "#2BBE7B"}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "risks" && <RiskRegister />}
        </div>
      )}
    </div>
  );
}

window.ProjectScreen = ProjectScreen;
