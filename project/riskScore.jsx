/* Composite Risk Score — Safety + Schedule.
   Higher = worse. 0–100 scale, two equally-weighted halves.

   ─── Safety (0–50) ─────────────────
   TRIR vs BLS benchmark (2.4)  : up to 18 pts
   Recordables YTD              : up to 12 pts
   Lost-time incidents          : up to 10 pts
   Stop-work hours              : up to  6 pts
   Observation kudos:at-risk     : up to  4 pts (if ratio < 2:1)

   ─── Schedule (0–50) ───────────────
   Weeks behind plan            : up to 35 pts
   Pace / % complete penalty    : up to 15 pts

   Bands: 0–29 Low · 30–49 Medium · 50–69 High · 70+ Critical
*/

const RISK_BENCH = { trir: 2.4, kudosRatio: 3 };
const RISK_BAND = (n) =>
  n >= 70 ? { name: "Critical", code: "critical", color: "#B11631", soft: "#FDE5E8" }
  : n >= 50 ? { name: "High",   code: "high",     color: "#C61733", soft: "#FCDDE3" }
  : n >= 30 ? { name: "Medium", code: "medium",   color: "#B97300", soft: "#FFE7C1" }
  :           { name: "Low",    code: "low",      color: "#1B9C5C", soft: "#D7F4DE" };

function computeRiskScore(trade, safety) {
  // ---- Safety half ----
  const trirScore   = Math.min(Math.max(0, safety.trir - RISK_BENCH.trir) * 3, 18);
  const recScore    = Math.min(safety.rec * 4, 12);
  const ltScore     = Math.min(safety.lt  * 6, 10);
  const stopScore   = Math.min(safety.stopHrs / 25, 6);
  const obsRatio    = safety.kudos / Math.max(1, safety.atRisk);
  const obsScore    = obsRatio < RISK_BENCH.kudosRatio
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
    band: RISK_BAND(total),
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
    }
  };
}

// Aggregate GC score = weighted avg by hours worked
function computeGCRiskScore() {
  const totalHrs = TRADE_SAFETY.reduce((a,s) => a + s.hours, 0);
  let totalSafe = 0, totalSched = 0, total = 0;
  TRADES.forEach((t, i) => {
    const r = computeRiskScore(t, TRADE_SAFETY[i]);
    const w = TRADE_SAFETY[i].hours / totalHrs;
    totalSafe  += r.safety * w;
    totalSched += r.schedule * w;
    total      += r.total * w;
  });
  const n = Math.round(total);
  return {
    total: n,
    band: RISK_BAND(n),
    safety: Math.round(totalSafe),
    schedule: Math.round(totalSched),
  };
}

// ─────────────────────────────── COMPONENTS ───────────────────────────────

// Circular gauge ring. Pass size, score, band.
function RiskGauge({ score, band, size = 180, stroke = 14, label = "Risk Score" }) {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="#EEF1F6" strokeWidth={stroke} />
        {/* gradient stops for fill — green→amber→red across band */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={band.color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center"
      }}>
        <div style={{
          font: "700 11px var(--sm-font-ui)",
          letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--or-light-mute)"
        }}>{label}</div>
        <div style={{
          font: "700 " + (size * .28) + "px var(--sm-font-display)",
          letterSpacing: "-.025em", color: band.color, lineHeight: 1,
          marginTop: 6,
        }}>{score}</div>
        <div style={{
          font: "700 11px var(--sm-font-ui)",
          letterSpacing: ".06em",
          color: band.color, marginTop: 6,
          background: band.soft, padding: "2px 10px", borderRadius: 999
        }}>{band.name}</div>
      </div>
    </div>
  );
}

// Compact inline badge (for table rows / tree nodes)
function RiskScoreBadge({ score, band, size = "md" }) {
  const small = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: small ? "2px 7px" : "3px 10px 3px 4px",
      borderRadius: 999,
      background: band.soft,
      color: band.color,
      font: `700 ${small ? 10.5 : 11.5}px var(--sm-font-ui)`,
      letterSpacing: ".02em",
    }}>
      <span style={{
        display: "inline-grid", placeItems: "center",
        width: small ? 18 : 22, height: small ? 18 : 22,
        borderRadius: "50%", background: band.color, color: "#fff",
        font: `700 ${small ? 10 : 11}px var(--sm-font-display)`,
        letterSpacing: 0,
      }}>{score}</span>
      {band.name}
    </span>
  );
}

// Big hero card: gauge + breakdown contribution bars
function RiskScoreHero({ score, label, subtitle, contextNote }) {
  const { total, band, safety, schedule, parts } = score;

  const Bar = ({ value, max, color, label, hint }) => {
    const pct = Math.min(100, (value / max) * 100);
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          font: "500 11px var(--sm-font-ui)", color: "var(--or-light-dim)",
          marginBottom: 4
        }}>
          <span>{label} <span className="muted">· {hint}</span></span>
          <b style={{ color: "var(--or-light-ink)" }}>{value} pts</b>
        </div>
        <div style={{ height: 6, background: "#EEF1F6", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="lcard" style={{ padding: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 24, alignItems: "center" }}>
        <RiskGauge score={total} band={band} size={190} stroke={16} label={label || "Risk Score"} />

        <div>
          <div style={{
            font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--or-light-mute)",
            marginBottom: 8
          }}>How the score breaks down</div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14,
          }}>
            <div style={{ padding: "12px 14px", background: "#FDE5E8", borderRadius: 10, border: "1px solid #FCDDE3" }}>
              <div style={{ font:"600 10px var(--sm-font-ui)", letterSpacing:".12em", textTransform:"uppercase", color:"#8B0F25" }}>Safety</div>
              <div style={{ font: "700 30px var(--sm-font-display)", color: "#B11631", letterSpacing:"-.02em", marginTop: 2, lineHeight: 1 }}>
                {safety}<span style={{ font: "500 13px var(--sm-font-ui)", color: "rgba(177,22,49,.6)", marginLeft: 2 }}>/50</span>
              </div>
            </div>
            <div style={{ padding: "12px 14px", background: "#FFF7E5", borderRadius: 10, border: "1px solid #FFE7C1" }}>
              <div style={{ font:"600 10px var(--sm-font-ui)", letterSpacing:".12em", textTransform:"uppercase", color:"#8A4400" }}>Schedule</div>
              <div style={{ font: "700 30px var(--sm-font-display)", color: "#B97300", letterSpacing:"-.02em", marginTop: 2, lineHeight: 1 }}>
                {schedule}<span style={{ font: "500 13px var(--sm-font-ui)", color: "rgba(185,115,0,.6)", marginLeft: 2 }}>/50</span>
              </div>
            </div>
          </div>

          {/* Combined stacked bar */}
          <div style={{
            height: 14, background: "#EEF1F6", borderRadius: 999, overflow: "hidden", display: "flex",
            marginBottom: 6
          }}>
            <div style={{
              width: `${safety}%`, background: "var(--or-red)",
              display: "flex", alignItems: "center", paddingLeft: 8,
              font: "700 10px var(--sm-font-ui)", color: "#fff", letterSpacing: ".04em"
            }}>{safety > 6 ? `SAFETY ${safety}` : ""}</div>
            <div style={{
              width: `${schedule}%`, background: "var(--or-amber)",
              display: "flex", alignItems: "center", paddingLeft: 8,
              font: "700 10px var(--sm-font-ui)", color: "#fff", letterSpacing: ".04em"
            }}>{schedule > 6 ? `SCHED ${schedule}` : ""}</div>
          </div>
          <div style={{ font: "500 11px var(--sm-font-ui)", color: "var(--or-light-mute)" }}>
            0&nbsp;&nbsp; · &nbsp; 30 Medium &nbsp; · &nbsp; 50 High &nbsp; · &nbsp; 70+ Critical &nbsp;&nbsp; 100
          </div>
        </div>

        <div>
          <div style={{
            font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--or-light-mute)",
            marginBottom: 8
          }}>Drivers</div>

          {parts && (
            <>
              <Bar value={parts.slip} max={35} color="var(--or-amber)" label="Weeks behind plan"    hint="schedule" />
              <Bar value={parts.trir} max={18} color="var(--or-red)"   label="TRIR vs BLS benchmark" hint="safety" />
              <Bar value={parts.rec}  max={12} color="var(--or-red)"   label="Recordables YTD"       hint="safety" />
              <Bar value={parts.lt}   max={10} color="#8B0F25"         label="Lost-time incidents"   hint="safety" />
              <Bar value={parts.stop} max={6}  color="#E5970E"         label="Stop-work hours"       hint="safety" />
              <Bar value={parts.pace} max={15} color="var(--or-amber)" label="Pace / % complete"     hint="schedule" />
            </>
          )}
        </div>
      </div>

      {contextNote && (
        <div style={{
          marginTop: 18, padding: "12px 16px",
          background: band.soft, borderRadius: 10, border: `1px solid ${band.color}33`,
          font: "500 13px var(--sm-font-ui)", color: "var(--or-light-ink)", lineHeight: 1.5
        }}>
          <b style={{ color: band.color }}>Why {band.name.toLowerCase()}: </b>
          {contextNote}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  computeRiskScore, computeGCRiskScore, RISK_BAND,
  RiskGauge, RiskScoreBadge, RiskScoreHero
});
