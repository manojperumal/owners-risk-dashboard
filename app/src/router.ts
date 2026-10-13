/* Minimal hash router so every drill-down level is linkable and the browser
   back button walks back up the hierarchy.
     #/                          portfolio
     #/sites/:siteId             project detail
     #/sites/:siteId/gc          GC composite risk + org tree
     #/sites/:siteId/subs/:slug  sub / trade detail */
import { useEffect, useState } from "react";

export type Route =
  | { view: "portfolio" }
  | { view: "project"; siteId: string }
  | { view: "gc"; siteId: string }
  | { view: "sub"; siteId: string; subSlug: string };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] === "sites" && parts[1]) {
    const siteId = parts[1];
    if (parts[2] === "gc") return { view: "gc", siteId };
    if (parts[2] === "subs" && parts[3]) return { view: "sub", siteId, subSlug: parts[3] };
    return { view: "project", siteId };
  }
  return { view: "portfolio" };
}

export function routeHref(route: Route): string {
  switch (route.view) {
    case "portfolio": return "#/";
    case "project":   return `#/sites/${encodeURIComponent(route.siteId)}`;
    case "gc":        return `#/sites/${encodeURIComponent(route.siteId)}/gc`;
    case "sub":       return `#/sites/${encodeURIComponent(route.siteId)}/subs/${encodeURIComponent(route.subSlug)}`;
  }
}

export function navigate(route: Route) {
  const href = routeHref(route);
  if (window.location.hash === href) return;
  window.location.hash = href;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
