/* Viewer preferences (owner brand + project layout), remembered per browser. */
import { useCallback, useState } from "react";
import { OWNERS } from "./data/data";
import type { OwnerKey, ProjectLayout } from "./data/types";

export interface Settings {
  owner: OwnerKey;
  layout: ProjectLayout;
}

const DEFAULTS: Settings = { owner: "generic", layout: "operator" };
const STORAGE_KEY = "owners-risk.settings";
const LAYOUTS: ProjectLayout[] = ["operator", "gantt", "tabbed"];

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      owner: raw.owner in OWNERS ? raw.owner : DEFAULTS.owner,
      layout: LAYOUTS.includes(raw.layout) ? raw.layout : DEFAULTS.layout,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings(): [Settings, <K extends keyof Settings>(key: K, value: Settings[K]) => void] {
  const [settings, setSettings] = useState(load);
  const set = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);
  return [settings, set];
}
