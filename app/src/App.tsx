/* Owners Risk — app root: top chrome, hash-routed drill-down, view options. */
import { useEffect } from "react";
import { findSite, findTrade } from "./data/data";
import { navigate, useRoute } from "./router";
import { useSettings } from "./settings";
import { TopChrome } from "./components/TopChrome";
import { ViewOptions } from "./components/ViewOptions";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { ProjectScreen } from "./screens/ProjectScreen";
import { GCScreen } from "./screens/GCScreen";
import { SubScreen } from "./screens/SubScreen";

export function App() {
  const [settings, set] = useSettings();
  const route = useRoute();

  const site = route.view === "portfolio" ? undefined : findSite(route.siteId);
  const sub = route.view === "sub" ? findTrade(route.subSlug) : undefined;

  // Unknown site / sub in the URL → fall back to the nearest valid level.
  const invalid = (route.view !== "portfolio" && !site) || (route.view === "sub" && !sub);
  useEffect(() => {
    if (!invalid) return;
    navigate(site ? { view: "gc", siteId: site.id } : { view: "portfolio" });
  }, [invalid, site]);

  return (
    <div className="app-shell">
      <div className="demo-banner" role="note">
        <b>Demo data — illustrative only.</b> All figures, incidents and schedules are fictional and do not
        represent the actual performance of any company named.
      </div>
      <TopChrome owner={settings.owner} route={route} site={site} sub={sub} />

      {route.view === "portfolio" && (
        <PortfolioScreen owner={settings.owner} onOpen={id => navigate({ view: "project", siteId: id })} />
      )}
      {route.view === "project" && site && (
        <ProjectScreen
          site={site}
          layout={settings.layout}
          onGC={() => navigate({ view: "gc", siteId: site.id })}
        />
      )}
      {route.view === "gc" && site && (
        <GCScreen
          site={site}
          owner={settings.owner}
          onSub={t => navigate({ view: "sub", siteId: site.id, subSlug: t.slug })}
        />
      )}
      {route.view === "sub" && site && sub && (
        <SubScreen site={site} sub={sub} onGC={() => navigate({ view: "gc", siteId: site.id })} />
      )}

      <ViewOptions settings={settings} set={set} />
    </div>
  );
}
