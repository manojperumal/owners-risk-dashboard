/* Owners Risk — App root: top chrome, breadcrumb navigation, screen switcher, tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "owner": "generic",
  "layout": "operator"
}/*EDITMODE-END*/;

function TopChrome({ owner, view, site, sub, goPortfolio, goProject, goGC }) {
  const ownerObj = OWNERS[owner];
  return (
    <div className="app-top">
      <div className="brand">
        <div className="brand-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 L4 6 v6 c0 4.5 3.5 8.5 8 10 c4.5 -1.5 8 -5.5 8 -10 V6 L12 2 z"/>
          </svg>
        </div>
        <span>
          <span className="w-owners">owners</span>
          <span className="w-risk">.risk</span>
        </span>
      </div>

      <div className="sep"></div>

      <div className="crumbs">
        <button onClick={goPortfolio}>{ownerObj.name} portfolio</button>
        {view !== "portfolio" && (
          <>
            <span className="chev">›</span>
            {(view === "gc" || view === "sub") ? (
              <button onClick={() => goProject(site.id)}>{site.id}</button>
            ) : (
              <span className="now">{site.id} · {site.name}</span>
            )}
          </>
        )}
        {(view === "gc" || view === "sub") && (
          <>
            <span className="chev">›</span>
            {view === "sub" ? (
              <button onClick={() => goGC(site.id)}>GC · {GCS[site.gc].name}</button>
            ) : (
              <span className="now">GC · {GCS[site.gc].name}</span>
            )}
          </>
        )}
        {view === "sub" && (
          <>
            <span className="chev">›</span>
            <span className="now">{sub.company}</span>
          </>
        )}
      </div>

      <div className="spacer"></div>

      <div className="top-meta">
        <span>As of <b>May 14, 2026</b></span>
        <span className="sep" style={{ height: 18 }}></span>
        <span>VP Risk &amp; Delivery</span>
      </div>
      <div className="av">VP</div>
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // view state: "portfolio" | "project" | "gc" | "sub"
  const [view, setView] = React.useState("portfolio");
  const [siteId, setSiteId] = React.useState(null);
  const [sub, setSub] = React.useState(null);

  const site = React.useMemo(() => SITES.find(s => s.id === siteId), [siteId]);

  const goPortfolio = () => { setView("portfolio"); window.scrollTo(0,0); };
  const goProject = (id) => { setSiteId(id); setView("project"); window.scrollTo(0,0); };
  const goGC = (id) => { if (id) setSiteId(id); setView("gc"); window.scrollTo(0,0); };
  const goSub = (s) => { setSub(s); setView("sub"); window.scrollTo(0,0); };

  return (
    <div className="app-shell">
      <TopChrome
        owner={tweaks.owner}
        view={view}
        site={site}
        sub={sub}
        goPortfolio={goPortfolio}
        goProject={goProject}
        goGC={goGC}
      />

      {view === "portfolio" && (
        <PortfolioScreen onOpen={goProject} owner={tweaks.owner} />
      )}
      {view === "project" && site && (
        <ProjectScreen
          site={site}
          onBack={goPortfolio}
          onGC={() => goGC()}
          layout={tweaks.layout}
        />
      )}
      {view === "gc" && site && (
        <GCTreeScreen
          site={site}
          onBack={() => goProject(site.id)}
          onSub={goSub}
          owner={tweaks.owner}
        />
      )}
      {view === "sub" && site && sub && (
        <SubDetailScreen
          site={site}
          sub={sub}
          onBack={() => goGC()}
          onGC={() => goGC()}
        />
      )}

      <TweaksPanel title="Tweaks">
          <TweakSection label="Owner brand">
            <TweakSelect
              label="Owner"
              value={tweaks.owner}
              onChange={v => setTweak("owner", v)}
              options={Object.entries(OWNERS).map(([k, v]) => ({ value: k, label: v.name }))}
            />
            <div style={{ font: "500 11.5px var(--sm-font-ui)", color: "#5B6479", marginTop: 6, lineHeight: 1.45 }}>
              Swaps the owner name across portfolio header, crumbs and org tree. Layout, data and GCs stay constant.
            </div>
          </TweakSection>

          <TweakSection label="Project detail layout">
            <TweakRadio
              value={tweaks.layout}
              onChange={v => setTweak("layout", v)}
              options={[
                { value: "operator", label: "Operator" },
                { value: "gantt",    label: "Schedule-first" },
                { value: "tabbed",   label: "Tabbed" },
              ]}
            />
            <div style={{ font: "500 11.5px var(--sm-font-ui)", color: "#5B6479", marginTop: 6, lineHeight: 1.4 }}>
              <b>Operator</b> — KPIs + critical path + phase delays (matches reference).<br/>
              <b>Schedule-first</b> — Big Gantt baseline-vs-forecast on top.<br/>
              <b>Tabbed</b> — Overview / Schedule / Contractors / Commissioning / Risks.
            </div>
          </TweakSection>

          <TweakSection label="Navigate">
            <div style={{ display: "grid", gap: 6 }}>
              <button className="btn btn-ghost" style={{justifyContent:"flex-start"}} onClick={goPortfolio}>← Portfolio (25 sites)</button>
              <button className="btn btn-ghost" style={{justifyContent:"flex-start"}} onClick={() => goProject("ATL-04")}>→ Critical example (ATL-04)</button>
              <button className="btn btn-ghost" style={{justifyContent:"flex-start"}} onClick={() => goProject("ATL-03")}>→ Green example (ATL-03)</button>
              <button className="btn btn-ghost" style={{justifyContent:"flex-start"}} onClick={() => { setSiteId("ATL-04"); setView("gc"); }}>→ GC tree (ATL-04)</button>
              <button className="btn btn-ghost" style={{justifyContent:"flex-start"}} onClick={() => { setSiteId("ATL-04"); setSub(TRADES[0]); setView("sub"); }}>→ Sub detail (Rosendin)</button>
            </div>
          </TweakSection>
        </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
