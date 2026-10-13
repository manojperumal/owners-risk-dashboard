/* Composite Risk Score — Safety + Schedule.
   Higher = worse. 0–100 scale, two equally-weighted halves.

   ─── Safety (0–50) ─────────────────
   TRIR vs BLS benchmark (2.4)  : up to 18 pts
   Recordables YTD              : up to 12 pts
   Lost-time incidents          : up to 10 pts
   Stop-work hours              : up to  6 pts
   Observation kudos:at-risk    : up to  4 pts (if ratio < 3:1)

   ─── Schedule (0–50) ───────────────
   Weeks behind plan            : up to 35 pts
   Pace / % complete penalty    : up to 15 pts

   Bands: 0–29 Low · 30–49 Medium · 50–69 High · 70+ Critical

   Thresholds and weights are tuned for illustration; swap in an in-house
   rubric (ISN, Avetta, owner PQQ) by editing the constants below.
*/
import { TRADES, TRADE_SAFETY } from "./data";
import type { Trade, TradeSafety } from "./types";

export const RISK_BENCH = { trir: 2.4, kudosRatio: 3 };

export interface RiskBand {
  name: "Critical" | "High" | "Medium" | "Low";
  code: "critical" | "high" | "medium" | "low";
  color: string;
  soft: string;
}

export const riskBand = (n: number): RiskBand =>
  n >= 70 ? { name: "Critical", code: "critical", color: "#B11631", soft: "#FDE5E8" }
  : n >= 50 ? { name: "High",   code: "high",     color: "#C61733", soft: "#FCDDE3" }
  : n >= 30 ? { name: "Medium", code: "medium",   color: "#B97300", soft: "#FFE7C1" }
  :           { name: "Low",    code: "low",      color: "#1B9C5C", soft: "#D7F4DE" };

export interface RiskParts {
  trir: number; rec: number; lt: number; stop: number; obs: number; slip: number; pace: number;
}

export interface RiskScore {
  total: number;
  band: RiskBand;
  safety: number;
  schedule: number;
  parts?: RiskParts;
}

export function computeRiskScore(trade: Trade, safety: TradeSafety): Required<RiskScore> {
  // ---- Safety half ----
  const trirScore = Math.min(Math.max(0, safety.trir - RISK_BENCH.trir) * 3, 18);
  const recScore  = Math.min(safety.rec * 4, 12);
  const ltScore   = Math.min(safety.lt * 6, 10);
  const stopScore = Math.min(safety.stopHrs / 25, 6);
  const obsRatio  = safety.kudos / Math.max(1, safety.atRisk);
  const obsScore  = obsRatio < RISK_BENCH.kudosRatio
    ? Math.min(4, (RISK_BENCH.kudosRatio - obsRatio) * 2)
    : 0;
  const safetyScore = Math.min(trirScore + recScore + ltScore + stopScore + obsScore, 50);

  // ---- Schedule half ----
  const slipScore = Math.min(trade.impactWks * 4.2, 35);
  const paceScore = trade.pct < 50 ? 12 : trade.pct < 70 ? 7 : trade.pct < 85 ? 3 : 0;
  const scheduleScore = Math.min(slipScore + paceScore, 50);

  const total = Math.round(safetyScore + scheduleScore);
  return {
    total,
    band: riskBand(total),
    safety: Math.round(safetyScore),
    schedule: Math.round(scheduleScore),
    parts: {
      trir: +trirScore.toFixed(1),
      rec: +recScore.toFixed(1),
      lt: +ltScore.toFixed(1),
      stop: +stopScore.toFixed(1),
      obs: +obsScore.toFixed(1),
      slip: +slipScore.toFixed(1),
      pace: +paceScore.toFixed(1),
    },
  };
}

/** Aggregate GC score = per-trade scores weighted by hours worked. */
export function computeGCRiskScore(): RiskScore {
  const totalHrs = TRADE_SAFETY.reduce((a, s) => a + s.hours, 0);
  let totalSafe = 0, totalSched = 0, total = 0;
  TRADES.forEach((t, i) => {
    const r = computeRiskScore(t, TRADE_SAFETY[i]);
    const w = TRADE_SAFETY[i].hours / totalHrs;
    totalSafe += r.safety * w;
    totalSched += r.schedule * w;
    total += r.total * w;
  });
  const n = Math.round(total);
  return { total: n, band: riskBand(n), safety: Math.round(totalSafe), schedule: Math.round(totalSched) };
}
