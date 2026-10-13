export type Rag = "red" | "amber" | "green";
export type MilestoneState = "late" | "critical" | "atrisk" | "ontrack" | "watch";

export type OwnerKey =
  | "generic" | "meta" | "google" | "microsoft" | "oracle" | "amazon"
  | "crusoe" | "anthropic" | "openai" | "qts" | "digitalrealty";

export type GCKey =
  | "turner" | "skanska" | "dpr" | "clayco" | "holder" | "mortenson"
  | "hensel" | "whiting" | "jedunn" | "rosendin";

export type ProjectLayout = "operator" | "gantt" | "tabbed";

export interface Owner { name: string; short: string; color: string }
export interface GC { name: string; short: string; color: string }

export interface Site {
  id: string;
  name: string;
  region: string;
  city: string;
  gc: GCKey;
  mw: number;
  pct: number;
  /** Schedule variance in weeks vs baseline (+ = late). */
  sched: number;
  phase: string;
  rfs: string;
  rfsDelta: string;
  rag: Rag;
  topRisk: string;
}

export interface CriticalPathMilestone {
  key: string;
  title: string;
  state: MilestoneState;
  impact: string;
  tagText: string;
  dragWks: number;
}

export interface PhaseDelay { name: string; mo: number; color: Rag }

export interface Risk {
  id: string;
  title: string;
  owner: string;
  cat: string;
  sev: "Critical" | "High" | "Med";
  prob: "High" | "Med" | "Low";
  impactWks: number;
  status: "Active" | "Mitigating" | "Monitoring";
  trend: "up" | "down" | "flat";
  mitigation: string;
}

export interface Trade {
  /** URL-safe identifier. */
  slug: string;
  trade: string;
  company: string;
  shortName: string;
  rag: Rag;
  impactWks: number;
  pct: number;
  scope: string;
}

export interface TradeSafety {
  /** Man-hours worked YTD. */
  hours: number;
  /** OSHA recordables. */
  rec: number;
  /** Near-misses. */
  nm: number;
  /** Lost-time incidents. */
  lt: number;
  /** Lost-time days. */
  ltd: number;
  /** (rec * 200,000) / hours. */
  trir: number;
  /** Days since last recordable. */
  daysSince: number;
  kudos: number;
  atRisk: number;
  /** Pre-task-plan compliance %. */
  ptp: number;
  openCA: number;
  /** Hours of work lost to safety stand-downs. */
  stopHrs: number;
}

export interface SubIncident {
  date: string;
  type: "Recordable" | "Near-miss" | "First aid" | "Lost time";
  severity: "High" | "Med" | "Low";
  title: string;
  crew: string;
  reporter: string;
  days: number;
  dragHrs: number;
  status: string;
  capa: string;
}

export interface SubMilestone { title: string; state: MilestoneState; impact: string; tag: string }
export interface SubTrimItem { lab: string; val: string }
export interface SubDriver { title: string; by: string; impact: number; cat: string }
