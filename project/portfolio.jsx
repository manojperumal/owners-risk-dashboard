/* Portfolio (dark) — top-level view of all 25 data centers */

const REGIONS = [
  "All regions", "Southeast", "Mid-Atlantic", "Midwest",
  "South Central", "Southwest", "Mountain", "Pacific NW", "Pacific SW"
];

function RAGPill({ rag }) {
  const label = rag === "red" ? "Critical" : rag === "amber" ? "At risk" : "On track";
  return (
    <span className={`rag-pill r-${rag}`}>
      <span className="d"></span>{label}
    </span>
  );
}

function SiteCard({ site, onClick, owner }) {
  const gc = GCS[site.gc];
  const schedClass = site.sched > 4 ? "red" : site.sched > 0 ? "amber" : "green";
  const schedText = site.sched === 0 ? "On plan" : (site.sched > 0 ? `+${site.sched} wks` : `${site.sched} wk`);

  return (
    <div className={`site-card r-${site.rag}`} onClick={onClick}>
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
          <div className={`val ${schedClass}`}>{schedText}</div>
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
            {site.topRisk.length > 38 ? site.topRisk.slice(0, 38) + "…" : site.topRisk}
          </div>
        </div>
      </div>

      <div className="site-progress">
        <div className="row"><span>Progress</span><em>{site.pct}%</em></div>
        <div className="site-track">
          <div className="plan" style={{ width: `${Math.min(100, site.pct + Math.max(0, site.sched/2))}%` }}></div>
          <div className="act"  style={{ width: `${site.pct}%` }}></div>
        </div>
      </div>

      <div className="site-foot">
        <div className="gc">GC <b>{gc.name}</b></div>
        <div className="risk-flags" title={site.topRisk}>
          <span className={`flag-dot ${site.rag === "red" ? "red" : "amber"}`} title="Schedule">S</span>
          <span className={`flag-dot ${site.topRisk.match(/utility|power|switchgear|generator/i) ? "red" : "green"}`} title="Power">P</span>
          <span className={`flag-dot ${site.topRisk.match(/permit/i) ? "amber" : "green"}`} title="Permits">R</span>
        </div>
      </div>
    </div>
  );
}

function PortfolioScreen({ onOpen, owner }) {
  const [filter, setFilter] = React.useState("all"); // all | red | amber | green
  const [region, setRegion] = React.useState("All regions");
  const [sortBy, setSortBy] = React.useState("risk"); // risk | progress | mw | rfs

  const filtered = React.useMemo(() => {
    let s = SITES.slice();
    if (filter !== "all") s = s.filter(x => x.rag === filter);
    if (region !== "All regions") s = s.filter(x => x.region === region);
    if (sortBy === "risk") {
      const order = { red: 0, amber: 1, green: 2 };
      s.sort((a,b) => order[a.rag] - order[b.rag] || b.sched - a.sched);
    } else if (sortBy === "progress") s.sort((a,b) => b.pct - a.pct);
    else if (sortBy === "mw") s.sort((a,b) => b.mw - a.mw);
    else if (sortBy === "rfs") s.sort((a,b) => a.rfs.localeCompare(b.rfs));
    return s;
  }, [filter, region, sortBy]);

  const ownerName = OWNERS[owner].name;

  return (
    <div className="page-dark">
      {/* Hero KPI band */}
      <div className="dark-hero">
        <div className="eyebrow-dark" style={{
          font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em", textTransform: "uppercase",
          color: "rgba(255,255,255,.55)", marginBottom: 6
        }}>
          Owner Risk Portfolio · {ownerName}
        </div>
        <h1 className="hero-title">25 data center builds · 1,733 MW under construction</h1>
        <p className="hero-sub">
          Program-level view of schedule, safety, power, supply chain, permits and commissioning risk —
          every signal here resolves up to one question: <b style={{color:"#fff"}}>will we hit Ready-for-Service?</b>
        </p>

        <div className="hero-kpis">
          <div className="hero-kpi alert">
            <div className="lab">Critical sites</div>
            <div className="val">{rstats.red}<span className="u">of 25</span></div>
            <div className="delta up">▲ 2 since last quarter</div>
          </div>
          <div className="hero-kpi warn">
            <div className="lab">At-risk sites</div>
            <div className="val">{rstats.amber}<span className="u">of 25</span></div>
            <div className="delta flat">— flat QoQ</div>
          </div>
          <div className="hero-kpi good">
            <div className="lab">On-track sites</div>
            <div className="val">{rstats.green}<span className="u">of 25</span></div>
            <div className="delta down">▼ improved from 11</div>
          </div>
          <div className="hero-kpi">
            <div className="lab">MW at delivery risk</div>
            <div className="val">{rstats.lateMW}<span className="u">/{rstats.totalMW} MW</span></div>
            <div className="delta up">▲ {Math.round(rstats.lateMW/rstats.totalMW*100)}% of portfolio</div>
          </div>
          <div className="hero-kpi">
            <div className="lab">Avg. schedule slip</div>
            <div className="val">+5.4<span className="u">wks vs baseline</span></div>
            <div className="delta up">▲ 1.2 wks QoQ</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="port-body">
        <div className="port-toolbar">
          <h2>Sites</h2>
          <div className="count">{filtered.length} of {SITES.length}</div>

          <div style={{ marginLeft: 14 }}>
            <div className="tabs">
              <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
              <button className={filter === "red" ? "on" : ""} onClick={() => setFilter("red")}>
                <span className="dot" style={{background: "var(--or-red)"}}></span>Critical ({rstats.red})
              </button>
              <button className={filter === "amber" ? "on" : ""} onClick={() => setFilter("amber")}>
                <span className="dot" style={{background: "var(--or-amber)"}}></span>At-risk ({rstats.amber})
              </button>
              <button className={filter === "green" ? "on" : ""} onClick={() => setFilter("green")}>
                <span className="dot" style={{background: "var(--or-green)"}}></span>On track ({rstats.green})
              </button>
            </div>
          </div>

          <div className="spacer-fill"></div>

          <div className="chip-row">
            <select
              value={region} onChange={e => setRegion(e.target.value)}
              className="fchip"
              style={{ appearance: "none", paddingRight: 22 }}
            >
              {REGIONS.map(r => <option key={r} value={r} style={{ background: "#161D2D", color: "#fff" }}>{r}</option>)}
            </select>
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="fchip"
              style={{ appearance: "none", paddingRight: 22 }}
            >
              <option value="risk"     style={{ background: "#161D2D", color: "#fff" }}>Sort: Risk</option>
              <option value="progress" style={{ background: "#161D2D", color: "#fff" }}>Sort: Progress</option>
              <option value="mw"       style={{ background: "#161D2D", color: "#fff" }}>Sort: MW capacity</option>
              <option value="rfs"      style={{ background: "#161D2D", color: "#fff" }}>Sort: RFS date</option>
            </select>
          </div>
        </div>

        <div className="site-grid">
          {filtered.map(s => (
            <SiteCard key={s.id} site={s} onClick={() => onOpen(s.id)} owner={owner} />
          ))}
        </div>

        {/* program-level mini panels below grid */}
        <div className="row-3" style={{ marginTop: 28 }}>
          <div className="dark-card">
            <h3>Top schedule drivers</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                { t: "Utility interconnect — IAD-07, ATL-04, PHX-02", v: "+12–22 wks", color: "red" },
                { t: "Switchgear long-lead (3 sites)",               v: "+8 wks",     color: "red" },
                { t: "Generator OEM build slot",                     v: "+6 wks",     color: "red" },
                { t: "Site civil — wet season",                       v: "+5 wks",     color: "amber" },
                { t: "Steel mill rolling lead",                       v: "+4 wks",     color: "amber" },
              ].map((r,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<4?"1px solid var(--or-line)":"none"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background: r.color === "red" ? "var(--or-red)" : "var(--or-amber)"}}></span>
                  <span style={{flex:1,font:"600 12.5px var(--sm-font-ui)",color:"#E7EBF3"}}>{r.t}</span>
                  <span style={{font:"700 12px var(--sm-font-ui)",color: r.color === "red" ? "var(--or-red)" : "var(--or-amber)"}}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dark-card">
            <h3>GC scorecard (this quarter)</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                { gc:"Turner",        sites:3, spi:0.86, color:"amber" },
                { gc:"DPR",           sites:4, spi:0.79, color:"red"   },
                { gc:"Holder",        sites:2, spi:0.74, color:"red"   },
                { gc:"Mortenson",     sites:4, spi:0.93, color:"green" },
                { gc:"Skanska",       sites:3, spi:0.97, color:"green" },
                { gc:"Hensel Phelps", sites:2, spi:0.95, color:"green" },
              ].map((r,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<5?"1px solid var(--or-line)":"none"}}>
                  <span style={{flex:1,font:"600 12.5px var(--sm-font-ui)",color:"#E7EBF3"}}>{r.gc} <span style={{color:"var(--or-text-mute)",fontWeight:500}}>· {r.sites} sites</span></span>
                  <span style={{font:"700 12px var(--sm-font-ui)",color: r.color === "red" ? "var(--or-red)" : r.color === "amber" ? "var(--or-amber)" : "var(--or-green)"}}>SPI {r.spi.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dark-card">
            <h3>Delivery forecast vs baseline</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:6}}>
              {[
                { q:"Q3 2026", base:3, fcst:2, late:1 },
                { q:"Q4 2026", base:5, fcst:5, late:1 },
                { q:"Q1 2027", base:4, fcst:3, late:1 },
                { q:"Q2 2027", base:4, fcst:3, late:2 },
                { q:"Q3 2027", base:3, fcst:2, late:3 },
                { q:"Q4 2027", base:3, fcst:2, late:2 },
                { q:"Q1+2028", base:3, fcst:8, late:4 },
              ].map((r,i) => {
                const max = 9;
                return (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"58px 1fr 50px",gap:10,alignItems:"center"}}>
                    <span style={{font:"500 11px var(--sm-font-ui)",color:"var(--or-text-dim)"}}>{r.q}</span>
                    <div style={{position:"relative",height:14,background:"rgba(255,255,255,.04)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{position:"absolute",inset:"2px auto 2px 0",width: `${(r.fcst-r.late)/max*100}%`, background:"var(--or-green)", borderRadius:2}}></div>
                      <div style={{position:"absolute",inset:"2px auto 2px " + (r.fcst-r.late)/max*100 + "%",width: `${r.late/max*100}%`,background:"var(--or-red)",borderRadius:2}}></div>
                      <div style={{position:"absolute",top:-3,bottom:-3,left:`${r.base/max*100}%`,width:2,background:"#fff",opacity:.6}}></div>
                    </div>
                    <span style={{font:"700 12px var(--sm-font-ui)",color:"#fff",textAlign:"right"}}>{r.fcst}</span>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:14,display:"flex",gap:14,font:"500 10.5px var(--sm-font-ui)",color:"var(--or-text-dim)"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,background:"var(--or-green)",borderRadius:2}}></span>Forecast on-time</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,background:"var(--or-red)",borderRadius:2}}></span>Forecast late</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:2,height:11,background:"#fff",opacity:.6}}></span>Baseline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PortfolioScreen = PortfolioScreen;
