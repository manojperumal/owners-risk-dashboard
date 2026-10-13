/* Floating "View options" panel (the design's Tweaks panel): owner brand swap,
   project-detail layout and quick-nav shortcuts. Collapsed to a pill by default. */
import { useEffect, useState } from "react";
import { OWNERS, TRADES } from "../data/data";
import type { OwnerKey, ProjectLayout } from "../data/types";
import type { Settings } from "../settings";
import { navigate } from "../router";

const LAYOUT_OPTIONS: { value: ProjectLayout; label: string }[] = [
  { value: "operator", label: "Operator" },
  { value: "gantt",    label: "Schedule-first" },
  { value: "tabbed",   label: "Tabbed" },
];

export function ViewOptions({ settings, set }: {
  settings: Settings;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) {
    return (
      <button className="twk-launcher" onClick={() => setOpen(true)} aria-expanded="false">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="9" cy="6" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="7" cy="18" r="2" fill="currentColor" />
        </svg>
        View options
      </button>
    );
  }

  return (
    <div className="twk-panel" role="dialog" aria-label="View options">
      <div className="twk-hd">
        <b>View options</b>
        <button className="twk-x" aria-label="Close view options" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">Owner brand</div>
        <label className="twk-row">
          <span className="twk-lbl"><span>Owner</span></span>
          <select className="twk-field" value={settings.owner} onChange={e => set("owner", e.target.value as OwnerKey)}>
            {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </label>
        <div className="twk-note">
          Swaps the owner name across portfolio header, crumbs and org tree. Layout, data and GCs stay constant.
        </div>

        <div className="twk-sect">Project detail layout</div>
        <label className="twk-row">
          <span className="twk-lbl"><span>Layout</span></span>
          <select className="twk-field" value={settings.layout} onChange={e => set("layout", e.target.value as ProjectLayout)}>
            {LAYOUT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <div className="twk-note" style={{ lineHeight: 1.4 }}>
          <b>Operator</b> — KPIs + critical path + phase delays.<br />
          <b>Schedule-first</b> — Big Gantt baseline-vs-forecast on top.<br />
          <b>Tabbed</b> — Overview / Schedule / Contractors / Commissioning / Risks.
        </div>

        <div className="twk-sect">Navigate</div>
        <div style={{ display: "grid", gap: 6 }}>
          <button className="btn btn-ghost twk-nav" onClick={() => navigate({ view: "portfolio" })}>← Portfolio (25 sites)</button>
          <button className="btn btn-ghost twk-nav" onClick={() => navigate({ view: "project", siteId: "ATL-04" })}>→ Critical example (ATL-04)</button>
          <button className="btn btn-ghost twk-nav" onClick={() => navigate({ view: "project", siteId: "ATL-03" })}>→ Green example (ATL-03)</button>
          <button className="btn btn-ghost twk-nav" onClick={() => navigate({ view: "gc", siteId: "ATL-04" })}>→ GC tree (ATL-04)</button>
          <button className="btn btn-ghost twk-nav" onClick={() => navigate({ view: "sub", siteId: "ATL-04", subSlug: TRADES[0].slug })}>→ Sub detail (Rosendin)</button>
        </div>
      </div>
    </div>
  );
}
