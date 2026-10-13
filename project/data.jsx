/* Owners Risk — mock data (generic owner; brand-swappable via Tweaks) */

// ---------- Owners (for brand swap) ----------
const OWNERS = {
  generic: { name: "Owner Co.",   short: "OC",  color: "#4F8EF7" },
  meta:    { name: "Meta",        short: "MT",  color: "#1877F2" },
  google:  { name: "Google",      short: "G",   color: "#4285F4" },
  microsoft:{name: "Microsoft",   short: "MS",  color: "#0078D4" },
  oracle:  { name: "Oracle",      short: "OR",  color: "#C74634" },
  amazon:  { name: "Amazon",      short: "AZ",  color: "#FF9900" },
  crusoe:  { name: "Crusoe",      short: "CR",  color: "#F25C24" },
  anthropic:{name: "Anthropic",   short: "AN",  color: "#D97757" },
  openai:  { name: "OpenAI",      short: "OAI", color: "#10A37F" },
  qts:     { name: "QTS",         short: "QTS", color: "#E31837" },
  digitalrealty:{name:"Digital Realty",short:"DR",color:"#0064A8" },
};

// ---------- GCs (general contractors) ----------
const GCS = {
  turner:  { name: "Turner",         short: "T",   color: "#F4A024" },
  skanska: { name: "Skanska",        short: "S",   color: "#0E70C0" },
  dpr:     { name: "DPR Construction",short: "DPR",color: "#293D5C" },
  clayco:  { name: "Clayco",         short: "C",   color: "#0F5D38" },
  holder:  { name: "Holder",         short: "H",   color: "#244E8A" },
  mortenson:{name: "Mortenson",      short: "M",   color: "#B91B27" },
  hensel:  { name: "Hensel Phelps",  short: "HP",  color: "#1A3B7A" },
  whiting: { name: "Whiting-Turner", short: "WT",  color: "#212B5A" },
  jedunn:  { name: "JE Dunn",        short: "JED", color: "#A6192E" },
  rosendin:{name: "Rosendin",        short: "R",   color: "#0E2150" }, // electrical megasub, but acts as MEP partner here
};

// ---------- 25 Data Center Sites ----------
//  rag: derived from schedule_var_wks (+ delivery risk overlay)
//  capacity_mw: total IT load
//  phase: current phase
//  baseline_rfs: target ready-for-service date
const SITES = [
  // ---- RED (Critical / late) ----
  { id: "ATL-04", name: "Atlanta DC 04",     region: "Southeast", city: "Newnan, GA",        gc: "turner",   mw: 96,  pct: 58, sched: +14, cost: +18, phase: "MEP Rough-in",       rfs: "Q3 2027", rfsDelta: "+14 wks", rag: "red",   topRisk: "Utility substation interconnect +12 wks" },
  { id: "PHX-02", name: "Phoenix DC 02",     region: "Southwest", city: "Mesa, AZ",          gc: "dpr",      mw: 120, pct: 41, sched: +18, cost: +22, phase: "Structural Steel",   rfs: "Q1 2028", rfsDelta: "+18 wks", rag: "red",   topRisk: "Generator delivery slipped to Q4 27" },
  { id: "IAD-07", name: "Ashburn DC 07",     region: "Mid-Atlantic", city: "Ashburn, VA",    gc: "holder",   mw: 144, pct: 33, sched: +22, cost: +12, phase: "Site Civil",         rfs: "Q2 2028", rfsDelta: "+22 wks", rag: "red",   topRisk: "Dominion power interconnect study delay" },
  { id: "CMH-01", name: "Columbus DC 01",    region: "Midwest",   city: "New Albany, OH",    gc: "mortenson",mw: 80,  pct: 64, sched: +10, cost: +9,  phase: "MEP Rough-in",       rfs: "Q2 2027", rfsDelta: "+10 wks", rag: "red",   topRisk: "Switchgear long-lead +20 wks" },

  // ---- AMBER (At-risk / watch) ----
  { id: "DFW-03", name: "Dallas DC 03",      region: "South Central", city: "Red Oak, TX",   gc: "clayco",   mw: 72,  pct: 71, sched: +6,  cost: +5,  phase: "Commissioning Prep", rfs: "Q4 2026", rfsDelta: "+6 wks",  rag: "amber", topRisk: "Cooling tower commissioning sequencing" },
  { id: "ORD-05", name: "Chicago DC 05",     region: "Midwest",   city: "Elk Grove, IL",     gc: "skanska",  mw: 60,  pct: 78, sched: +4,  cost: +3,  phase: "IT White Space",     rfs: "Q1 2027", rfsDelta: "+4 wks",  rag: "amber", topRisk: "Network fiber path permitting" },
  { id: "SAT-02", name: "San Antonio DC 02", region: "South Central", city: "Hutto, TX",     gc: "turner",   mw: 88,  pct: 52, sched: +7,  cost: +6,  phase: "Structural Steel",   rfs: "Q3 2027", rfsDelta: "+7 wks",  rag: "amber", topRisk: "Steel erection crew availability" },
  { id: "PDX-01", name: "Portland DC 01",    region: "Pacific NW", city: "Hillsboro, OR",    gc: "hensel",   mw: 48,  pct: 84, sched: +3,  cost: +2,  phase: "Commissioning",      rfs: "Q3 2026", rfsDelta: "+3 wks",  rag: "amber", topRisk: "BMS integration testing" },
  { id: "RIC-02", name: "Richmond DC 02",    region: "Mid-Atlantic", city: "Sandston, VA",   gc: "whiting",  mw: 64,  pct: 47, sched: +8,  cost: +4,  phase: "Structural Steel",   rfs: "Q4 2027", rfsDelta: "+8 wks",  rag: "amber", topRisk: "Concrete supply intermittent" },
  { id: "MEM-01", name: "Memphis DC 01",     region: "Southeast", city: "Olive Branch, MS",  gc: "jedunn",   mw: 56,  pct: 39, sched: +9,  cost: +7,  phase: "Site Civil",         rfs: "Q1 2028", rfsDelta: "+9 wks",  rag: "amber", topRisk: "Heavy rains pushed earthwork +5 wks" },
  { id: "SLC-01", name: "Salt Lake DC 01",   region: "Mountain",  city: "Eagle Mountain, UT",gc: "mortenson",mw: 100, pct: 28, sched: +5,  cost: +3,  phase: "Site Civil",         rfs: "Q2 2028", rfsDelta: "+5 wks",  rag: "amber", topRisk: "Rocky Mtn Power interconnect study" },
  { id: "BOI-01", name: "Boise DC 01",       region: "Mountain",  city: "Kuna, ID",          gc: "dpr",      mw: 36,  pct: 92, sched: +2,  cost: +1,  phase: "IST",               rfs: "Q3 2026", rfsDelta: "+2 wks",  rag: "amber", topRisk: "IST punchlist trailing" },

  // ---- GREEN (On track / minor) ----
  { id: "ATL-03", name: "Atlanta DC 03",     region: "Southeast", city: "Douglasville, GA",  gc: "holder",   mw: 72,  pct: 96, sched: 0,   cost: -1,  phase: "Substantial Complete", rfs: "Q3 2026", rfsDelta: "On time", rag: "green", topRisk: "Final ATS punchlist" },
  { id: "PHX-01", name: "Phoenix DC 01",     region: "Southwest", city: "Goodyear, AZ",      gc: "turner",   mw: 80,  pct: 88, sched: -1,  cost: 0,   phase: "Commissioning",      rfs: "Q4 2026", rfsDelta: "-1 wk",   rag: "green", topRisk: "Heat-rejection IST validation" },
  { id: "DFW-02", name: "Dallas DC 02",      region: "South Central", city: "Garland, TX",   gc: "skanska",  mw: 64,  pct: 76, sched: +1,  cost: 0,   phase: "MEP Rough-in",       rfs: "Q1 2027", rfsDelta: "+1 wk",   rag: "green", topRisk: "Crane availability for chillers" },
  { id: "DFW-04", name: "Dallas DC 04",      region: "South Central", city: "Allen, TX",     gc: "clayco",   mw: 88,  pct: 67, sched: 0,   cost: -1,  phase: "MEP Rough-in",       rfs: "Q2 2027", rfsDelta: "On time", rag: "green", topRisk: "Drywall trade rotation" },
  { id: "IAD-05", name: "Ashburn DC 05",     region: "Mid-Atlantic", city: "Sterling, VA",   gc: "whiting",  mw: 96,  pct: 81, sched: +1,  cost: +1,  phase: "MEP Rough-in",       rfs: "Q4 2026", rfsDelta: "+1 wk",   rag: "green", topRisk: "Fire suppression integration" },
  { id: "IAD-06", name: "Ashburn DC 06",     region: "Mid-Atlantic", city: "Loudoun, VA",    gc: "dpr",      mw: 120, pct: 55, sched: +2,  cost: +2,  phase: "Structural Steel",   rfs: "Q3 2027", rfsDelta: "+2 wks",  rag: "green", topRisk: "Roofing weather-window" },
  { id: "OMA-01", name: "Omaha DC 01",       region: "Midwest",   city: "Papillion, NE",     gc: "mortenson",mw: 60,  pct: 91, sched: 0,   cost: 0,   phase: "Commissioning",      rfs: "Q4 2026", rfsDelta: "On time", rag: "green", topRisk: "BMS final tuning" },
  { id: "DEN-01", name: "Denver DC 01",      region: "Mountain",  city: "Aurora, CO",        gc: "hensel",   mw: 48,  pct: 73, sched: +1,  cost: 0,   phase: "MEP Rough-in",       rfs: "Q2 2027", rfsDelta: "+1 wk",   rag: "green", topRisk: "Conduit rough-in pace" },
  { id: "SAN-01", name: "San Diego DC 01",   region: "Pacific SW", city: "Otay Mesa, CA",    gc: "turner",   mw: 40,  pct: 82, sched: -2,  cost: -2,  phase: "IT White Space",     rfs: "Q3 2026", rfsDelta: "-2 wks",  rag: "green", topRisk: "Final landlord turnover" },
  { id: "SJC-01", name: "Santa Clara DC 01", region: "Pacific SW", city: "Santa Clara, CA",  gc: "dpr",      mw: 32,  pct: 88, sched: 0,   cost: -1,  phase: "Commissioning",      rfs: "Q4 2026", rfsDelta: "On time", rag: "green", topRisk: "PG&E utility outage window" },
  { id: "TPA-01", name: "Tampa DC 01",       region: "Southeast", city: "Lakeland, FL",      gc: "jedunn",   mw: 56,  pct: 62, sched: +1,  cost: 0,   phase: "MEP Rough-in",       rfs: "Q2 2027", rfsDelta: "+1 wk",   rag: "green", topRisk: "Hurricane-season risk window" },
  { id: "MSP-01", name: "Minneapolis DC 01", region: "Midwest",   city: "Elk River, MN",     gc: "mortenson",mw: 64,  pct: 71, sched: 0,   cost: 0,   phase: "MEP Rough-in",       rfs: "Q1 2027", rfsDelta: "On time", rag: "green", topRisk: "Cold-weather concrete pours" },
  { id: "NAS-01", name: "Nashville DC 01",   region: "Southeast", city: "Lebanon, TN",       gc: "skanska",  mw: 48,  pct: 79, sched: +1,  cost: +1,  phase: "MEP Rough-in",       rfs: "Q4 2026", rfsDelta: "+1 wk",   rag: "green", topRisk: "TVA energization sequencing" },
];

// ---------- Critical-path milestones (per-project — keyed by site id, with sensible default) ----------
const CP_DEFAULT = [
  { key: "civil", title: "Site civil & foundations", state: "late",     impact: "+8 wks behind plan — labor shortage",          tagText: "Late",     dragWks: 8 },
  { key: "util",  title: "Utility substation energization", state: "critical", impact: "Utility interconnect delayed +12 wks", tagText: "Critical", dragWks: 16 },
  { key: "steel", title: "Structural steel topped-out", state: "late",  impact: "+6 wks — steel mill rolling lead",             tagText: "Late",     dragWks: 6 },
  { key: "mep",   title: "Mechanical & plumbing rough-in", state: "atrisk", impact: "+3 wks, float consumed",                   tagText: "At risk",  dragWks: 3 },
  { key: "white", title: "IT / white-space build-out", state: "ontrack", impact: "On schedule — 4 wks float remaining",         tagText: "On track", dragWks: 0 },
  { key: "ist",   title: "Commissioning & IST",      state: "watch",   impact: "Dependent on MEP — watch item",                 tagText: "Watch",    dragWks: 0 },
  { key: "sc",    title: "Substantial completion",   state: "atrisk",   impact: "Forecast +14 wks vs baseline RFS",              tagText: "At risk",  dragWks: 14 },
];

// Phase delays (mo) for "Phase delivery timeline" widget
const PHASE_DEFAULT = [
  { name: "Site civil",        mo: 3.2, color: "red" },
  { name: "Structural steel",  mo: 2.0, color: "red" },
  { name: "Utility connection",mo: 4.0, color: "red" },
  { name: "MEP rough-in",      mo: 1.2, color: "amber" },
  { name: "White-space build", mo: 0.3, color: "green" },
  { name: "Commissioning",     mo: 2.2, color: "amber" },
  { name: "Substantial compl.",mo: 3.6, color: "red" },
];

// ---------- Risk register (per-site — default set) ----------
const RISKS_DEFAULT = [
  { id: "R-104", title: "Utility substation interconnect delay",      owner: "Owner / Utility",      cat: "Power & capacity",  sev: "Critical", prob: "High",   impactWks: 12, status: "Active",     trend: "up",   mitigation: "Escalated to utility VP; backup feed study in progress" },
  { id: "R-098", title: "Switchgear long-lead (Q4-27)",                owner: "Procurement",          cat: "Supply chain",      sev: "High",     prob: "High",   impactWks: 8,  status: "Active",     trend: "flat", mitigation: "Secondary OEM activated; partial drop-shipment Q2-27" },
  { id: "R-091", title: "Site civil labor shortage",                   owner: "GC — Turner",          cat: "Labor / trades",    sev: "High",     prob: "Med",    impactWks: 6,  status: "Mitigating", trend: "down", mitigation: "Crew rotation from PHX-01; overtime authorized" },
  { id: "R-087", title: "Stormwater permit revision (county)",         owner: "Permitting",           cat: "Permits & reg.",    sev: "Med",      prob: "Med",    impactWks: 4,  status: "Active",     trend: "flat", mitigation: "Public hearing scheduled for Jul-2026" },
  { id: "R-082", title: "Chiller plant FAT failure risk",              owner: "GC / Commissioning",   cat: "Commissioning",     sev: "Med",      prob: "Low",    impactWks: 3,  status: "Monitoring", trend: "flat", mitigation: "Witness FAT scheduled at OEM facility" },
  { id: "R-076", title: "Generator delivery (3 MW units)",             owner: "Procurement",          cat: "Supply chain",      sev: "High",     prob: "Med",    impactWks: 6,  status: "Active",     trend: "up",   mitigation: "Locked in OEM build slot; expediter assigned" },
  { id: "R-068", title: "Network fiber path permit (cross-easement)",  owner: "Owner — Network",      cat: "Permits & reg.",    sev: "Med",      prob: "Med",    impactWks: 2,  status: "Mitigating", trend: "down", mitigation: "Easement reissued; survey complete" },
  { id: "R-061", title: "Cooling tower commissioning sequencing",      owner: "GC / Mechanical sub",  cat: "Commissioning",     sev: "Med",      prob: "Med",    impactWks: 3,  status: "Monitoring", trend: "flat", mitigation: "Sequenced behind dry-cooler pre-cx" },
];

// ---------- GC tree per project ----------
// Each project has 1 GC + ~8 trades. Tied to schedule impact for the active project.
const TRADES = [
  { trade: "Electrical",        company: "Rosendin Electric",   shortName: "Rosendin",  rag: "red",    impactWks: 8,  pct: 42, scope: "Switchgear, generators, primary feeders" },
  { trade: "Mechanical",        company: "Limbach",             shortName: "Limbach",   rag: "amber",  impactWks: 3,  pct: 51, scope: "Chillers, CRAH units, piping" },
  { trade: "Structural steel",  company: "SteelFab Industries", shortName: "SteelFab",  rag: "amber",  impactWks: 6,  pct: 88, scope: "Primary structure & framing" },
  { trade: "Civil / site",      company: "Sundt Civil",         shortName: "Sundt",     rag: "red",    impactWks: 5,  pct: 95, scope: "Earthwork & site utilities" },
  { trade: "Concrete",          company: "Baker Concrete",      shortName: "Baker",     rag: "green",  impactWks: 0,  pct: 92, scope: "Slabs & foundations" },
  { trade: "Low-voltage / BMS", company: "ICS Integrators",     shortName: "ICS",       rag: "amber",  impactWks: 2,  pct: 28, scope: "BMS, EPMS, structured fiber" },
  { trade: "Fire / life safety",company: "Western States Fire", shortName: "WSF",       rag: "green",  impactWks: 0,  pct: 64, scope: "Sprinkler & clean agent" },
  { trade: "Envelope / roof",   company: "Centimark",           shortName: "Centimark", rag: "green",  impactWks: 1,  pct: 70, scope: "TPO roof & wall panels" },
];

// ---------- Per-trade SAFETY data (joined to TRADES by index) ----------
// hours: man-hours worked YTD
// rec: OSHA recordables · nm: near-misses · lt: lost-time incidents · ltd: lost-time days
// trir = (rec * 200,000) / hours · daysSince: since last recordable
// kudos / atRisk = observations YTD · ptp = PTP compliance %
// stopHrs: hours of work lost to safety stand-downs (direct schedule impact)
const TRADE_SAFETY = [
  // Electrical (Rosendin) — high hours, high exposure, recent incident
  { hours: 124500, rec: 1, nm: 7, lt: 1, ltd: 6,  trir: 1.6, daysSince: 12, kudos: 38, atRisk: 14, ptp: 91, openCA: 3, stopHrs: 96 },
  // Mechanical (Limbach)
  { hours:  86200, rec: 1, nm: 5, lt: 0, ltd: 0,  trir: 2.3, daysSince: 28, kudos: 22, atRisk:  9, ptp: 88, openCA: 2, stopHrs: 32 },
  // Structural steel (SteelFab) — slips, falls, struck-by
  { hours:  41800, rec: 2, nm: 6, lt: 1, ltd: 11, trir: 9.6, daysSince:  4, kudos: 16, atRisk: 18, ptp: 74, openCA: 5, stopHrs: 184 },
  // Civil / site (Sundt)
  { hours:  29400, rec: 1, nm: 4, lt: 0, ltd: 0,  trir: 6.8, daysSince: 19, kudos: 14, atRisk: 12, ptp: 79, openCA: 4, stopHrs: 48 },
  // Concrete (Baker)
  { hours:  62100, rec: 0, nm: 3, lt: 0, ltd: 0,  trir: 0.0, daysSince: 365,kudos: 26, atRisk:  4, ptp: 97, openCA: 0, stopHrs: 0  },
  // Low-voltage / BMS (ICS)
  { hours:  18200, rec: 0, nm: 1, lt: 0, ltd: 0,  trir: 0.0, daysSince: 210,kudos: 11, atRisk:  3, ptp: 95, openCA: 1, stopHrs: 0  },
  // Fire (WSF)
  { hours:  14600, rec: 0, nm: 2, lt: 0, ltd: 0,  trir: 0.0, daysSince: 180,kudos:  8, atRisk:  2, ptp: 93, openCA: 0, stopHrs: 0  },
  // Envelope (Centimark) — fall hazard
  { hours:  22700, rec: 1, nm: 4, lt: 0, ltd: 0,  trir: 8.8, daysSince: 41, kudos: 10, atRisk:  6, ptp: 82, openCA: 2, stopHrs: 24 },
];

// GC-level safety rollup (derived from TRADE_SAFETY)
const GC_SAFETY = (() => {
  const sum = (k) => TRADE_SAFETY.reduce((a,s) => a + s[k], 0);
  const hours = sum("hours");
  const rec = sum("rec");
  const lt = sum("lt");
  const nm = sum("nm");
  return {
    hours,
    rec,
    lt,
    ltd: sum("ltd"),
    nm,
    trir: +((rec * 200000) / hours).toFixed(2),
    ltir: +((lt * 200000) / hours).toFixed(2),
    dart: +(((rec) * 200000) / hours * 0.6).toFixed(2),
    kudos: sum("kudos"),
    atRisk: sum("atRisk"),
    openCA: sum("openCA"),
    stopHrs: sum("stopHrs"),
    ptp: 86,  // weighted avg
    daysSinceRec: 4,
    daysSinceLT: 41,
    // Industry benchmark (BLS heavy & civil engineering construction)
    benchmarkTRIR: 2.4,
    benchmarkLTIR: 0.8,
  };
})();

// Recent incident/near-miss log for sub detail (Rosendin)
const SUB_INCIDENTS = [
  { date: "May 06", type: "Recordable",  severity: "Med",  title: "Hand laceration — temporary panel terminations",
    crew: "Crew B / Bldg A", reporter: "Foreman Ramirez", days: 6, dragHrs: 24, status: "Investigation closed",
    capa: "Glove standard upgraded to ANSI A4; toolbox talk Mon" },
  { date: "Apr 28", type: "Near-miss",   severity: "High", title: "Dropped object from man-lift — exclusion zone breach",
    crew: "Crew D / Yard", reporter: "Safety Lt. Kim",   days: 0, dragHrs: 12, status: "CA in progress",
    capa: "Tool tethering 100% audit; ground spotter required" },
  { date: "Apr 21", type: "First aid",   severity: "Low",  title: "Eye irritation — wire pulling lubricant",
    crew: "Crew A / Bldg B", reporter: "Self-report",    days: 0, dragHrs: 2,  status: "Closed",
    capa: "Eye-wash inspection logged; PPE refresher" },
  { date: "Apr 14", type: "Near-miss",   severity: "Med",  title: "LOTO scope mismatch — feeder 4B",
    crew: "Crew C / Substation", reporter: "Foreman Patel", days: 0, dragHrs: 8, status: "Closed",
    capa: "LOTO permit revised; verifier sign-off added" },
  { date: "Apr 09", type: "Near-miss",   severity: "Low",  title: "Trip hazard — exposed conduit at egress",
    crew: "Crew B / Bldg A", reporter: "Walk-around",    days: 0, dragHrs: 4, status: "Closed",
    capa: "Housekeeping cadence increased to 2×/shift" },
  { date: "Mar 30", type: "Recordable",  severity: "High", title: "Strain — improper lift, 6\" rigid conduit bundle",
    crew: "Crew A / Bldg B", reporter: "Foreman Diaz",   days: 0, dragHrs: 0, status: "Closed",
    capa: "Lift assist required for >50 lb bundles" },
];

// PTP/Observation trends (12 weeks) for sub
const SUB_TRENDS = {
  ptp: [78, 82, 80, 85, 88, 84, 89, 90, 87, 91, 88, 91],
  kudos:  [2, 3, 1, 4, 3, 4, 5, 3, 4, 3, 4, 2],
  atRisk: [3, 2, 2, 1, 2, 1, 1, 2, 1, 1, 1, 0],
};

// ---------- Sub/Trade detail (for Rosendin drill) ----------
const SUB_DETAIL = {
  scopeMs: [
    { title: "Main switchgear set in place",          state: "late",     impact: "+6 wks — OEM cleared crating Aug 2026", tag: "Late" },
    { title: "Primary feeder pull (Bldgs A/B)",        state: "atrisk",   impact: "Awaiting concrete cure on duct bank",   tag: "At risk" },
    { title: "Generator paralleling cabinet",          state: "critical", impact: "+8 wks — controller firmware bug",       tag: "Critical" },
    { title: "PDU rough-in (rooms 1.01–1.04)",         state: "ontrack",  impact: "On schedule",                            tag: "On track" },
    { title: "ATS integration & burn-in",              state: "watch",    impact: "Predecessor: gen paralleling",           tag: "Watch" },
  ],
  trim: [
    { lab: "Schedule perf (SPI)",val: "0.78" },
    { lab: "Crew on site (today)", val: "84 / 120" },
    { lab: "RFIs open",          val: "23  (4 aged >14d)" },
    { lab: "Submittals open",    val: "11" },
    { lab: "Float remaining",    val: "0 wks" },
    { lab: "Days behind plan",   val: "42 days" },
  ],
  drivers: [
    { title: "Switchgear OEM build slot",     by: "PowerGrid Mfg. — Lot 184",            impact: 6, cat: "Supply chain" },
    { title: "Generator paralleling firmware",by: "OEM firmware revision pending",       impact: 8, cat: "Equipment" },
    { title: "Duct bank predecessor (civil)",  by: "Sundt Civil — concrete cure window",  impact: 2, cat: "Predecessor" },
    { title: "Electrician headcount",         by: "Local 613 — manpower allocation",      impact: 2, cat: "Labor" },
  ]
};

// helpers
const rstats = (() => {
  const red = SITES.filter(s => s.rag === "red").length;
  const amber = SITES.filter(s => s.rag === "amber").length;
  const green = SITES.filter(s => s.rag === "green").length;
  const totalMW = SITES.reduce((a,s) => a+s.mw, 0);
  const liveMW  = SITES.filter(s => s.pct >= 80).reduce((a,s) => a+s.mw, 0);
  const avgPct = Math.round(SITES.reduce((a,s) => a+s.pct, 0) / SITES.length);
  const lateMW = SITES.filter(s => s.rag === "red").reduce((a,s) => a+s.mw, 0);
  return { red, amber, green, totalMW, liveMW, avgPct, lateMW };
})();

Object.assign(window, {
  OWNERS, GCS, SITES, CP_DEFAULT, PHASE_DEFAULT, RISKS_DEFAULT, TRADES, SUB_DETAIL, rstats,
  TRADE_SAFETY, GC_SAFETY, SUB_INCIDENTS, SUB_TRENDS
});
