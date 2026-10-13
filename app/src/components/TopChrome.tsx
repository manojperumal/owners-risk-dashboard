import { GCS, OWNERS } from "../data/data";
import type { OwnerKey, Site, Trade } from "../data/types";
import type { Route } from "../router";
import { routeHref } from "../router";

export function TopChrome({ owner, route, site, sub }: {
  owner: OwnerKey; route: Route; site?: Site; sub?: Trade;
}) {
  const view = route.view;
  const deep = view === "gc" || view === "sub";

  return (
    <div className="app-top">
      <a className="brand" href={routeHref({ view: "portfolio" })}>
        <div className="brand-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 L4 6 v6 c0 4.5 3.5 8.5 8 10 c4.5 -1.5 8 -5.5 8 -10 V6 L12 2 z" />
          </svg>
        </div>
        <span>
          <span className="w-owners">owners</span>
          <span className="w-risk">.risk</span>
        </span>
      </a>

      <div className="sep"></div>

      <nav className="crumbs" aria-label="Breadcrumb">
        <a href={routeHref({ view: "portfolio" })}>{OWNERS[owner].name} portfolio</a>
        {site && view !== "portfolio" && (
          <>
            <span className="chev">›</span>
            {deep
              ? <a href={routeHref({ view: "project", siteId: site.id })}>{site.id}</a>
              : <span className="now">{site.id} · {site.name}</span>}
          </>
        )}
        {site && deep && (
          <>
            <span className="chev">›</span>
            {view === "sub"
              ? <a href={routeHref({ view: "gc", siteId: site.id })}>GC · {GCS[site.gc].name}</a>
              : <span className="now">GC · {GCS[site.gc].name}</span>}
          </>
        )}
        {view === "sub" && sub && (
          <>
            <span className="chev">›</span>
            <span className="now">{sub.company}</span>
          </>
        )}
      </nav>

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
