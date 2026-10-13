import type { RiskBand, RiskScore } from "../data/riskScore";

/** Circular gauge ring showing a 0–100 score in its band color. */
export function RiskGauge({ score, band, size = 180, stroke = 14, label = "Risk Score" }: {
  score: number; band: RiskBand; size?: number; stroke?: number; label?: string;
}) {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${score}, ${band.name}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF1F6" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={band.color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
      }}>
        <div style={{
          font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--or-light-mute)",
        }}>{label}</div>
        <div style={{
          font: `700 ${size * 0.28}px var(--sm-font-display)`,
          letterSpacing: "-.025em", color: band.color, lineHeight: 1, marginTop: 6,
        }}>{score}</div>
        <div style={{
          font: "700 11px var(--sm-font-ui)", letterSpacing: ".06em",
          color: band.color, marginTop: 6,
          background: band.soft, padding: "2px 10px", borderRadius: 999,
        }}>{band.name}</div>
      </div>
    </div>
  );
}

/** Compact inline badge (table rows / tree nodes). */
export function RiskScoreBadge({ score, band, size = "md" }: {
  score: number; band: RiskBand; size?: "sm" | "md";
}) {
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

function DriverBar({ value, max, color, label, hint }: {
  value: number; max: number; color: string; label: string; hint: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        font: "500 11px var(--sm-font-ui)", color: "var(--or-light-dim)", marginBottom: 4,
      }}>
        <span>{label} <span className="muted">· {hint}</span></span>
        <b style={{ color: "var(--or-light-ink)" }}>{value} pts</b>
      </div>
      <div style={{ height: 6, background: "#EEF1F6", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }}></div>
      </div>
    </div>
  );
}

const eyebrow = {
  font: "700 11px var(--sm-font-ui)", letterSpacing: ".14em",
  textTransform: "uppercase", color: "var(--or-light-mute)", marginBottom: 8,
} as const;

/** Hero card: gauge + safety/schedule split + driver contribution bars. */
export function RiskScoreHero({ score, label, contextNote }: {
  score: RiskScore; label?: string; contextNote?: string;
}) {
  const { total, band, safety, schedule, parts } = score;

  return (
    <div className="lcard" style={{ padding: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 24, alignItems: "center" }}>
        <RiskGauge score={total} band={band} size={190} stroke={16} label={label || "Risk Score"} />

        <div>
          <div style={eyebrow}>How the score breaks down</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ padding: "12px 14px", background: "#FDE5E8", borderRadius: 10, border: "1px solid #FCDDE3" }}>
              <div style={{ font: "600 10px var(--sm-font-ui)", letterSpacing: ".12em", textTransform: "uppercase", color: "#8B0F25" }}>Safety</div>
              <div style={{ font: "700 30px var(--sm-font-display)", color: "#B11631", letterSpacing: "-.02em", marginTop: 2, lineHeight: 1 }}>
                {safety}<span style={{ font: "500 13px var(--sm-font-ui)", color: "rgba(177,22,49,.6)", marginLeft: 2 }}>/50</span>
              </div>
            </div>
            <div style={{ padding: "12px 14px", background: "#FFF7E5", borderRadius: 10, border: "1px solid #FFE7C1" }}>
              <div style={{ font: "600 10px var(--sm-font-ui)", letterSpacing: ".12em", textTransform: "uppercase", color: "#8A4400" }}>Schedule</div>
              <div style={{ font: "700 30px var(--sm-font-display)", color: "#B97300", letterSpacing: "-.02em", marginTop: 2, lineHeight: 1 }}>
                {schedule}<span style={{ font: "500 13px var(--sm-font-ui)", color: "rgba(185,115,0,.6)", marginLeft: 2 }}>/50</span>
              </div>
            </div>
          </div>

          {/* Combined stacked bar */}
          <div style={{
            height: 14, background: "#EEF1F6", borderRadius: 999, overflow: "hidden", display: "flex",
            marginBottom: 6,
          }}>
            <div style={{
              width: `${safety}%`, background: "var(--or-red)",
              display: "flex", alignItems: "center", paddingLeft: 8,
              font: "700 10px var(--sm-font-ui)", color: "#fff", letterSpacing: ".04em",
            }}>{safety > 6 ? `SAFETY ${safety}` : ""}</div>
            <div style={{
              width: `${schedule}%`, background: "var(--or-amber)",
              display: "flex", alignItems: "center", paddingLeft: 8,
              font: "700 10px var(--sm-font-ui)", color: "#fff", letterSpacing: ".04em",
            }}>{schedule > 6 ? `SCHED ${schedule}` : ""}</div>
          </div>
          <div style={{ font: "500 11px var(--sm-font-ui)", color: "var(--or-light-mute)" }}>
            0&nbsp;&nbsp; · &nbsp; 30 Medium &nbsp; · &nbsp; 50 High &nbsp; · &nbsp; 70+ Critical &nbsp;&nbsp; 100
          </div>
        </div>

        <div>
          <div style={eyebrow}>Drivers</div>
          {parts && (
            <>
              <DriverBar value={parts.slip} max={35} color="var(--or-amber)" label="Weeks behind plan"     hint="schedule" />
              <DriverBar value={parts.trir} max={18} color="var(--or-red)"   label="TRIR vs BLS benchmark" hint="safety" />
              <DriverBar value={parts.rec}  max={12} color="var(--or-red)"   label="Recordables YTD"       hint="safety" />
              <DriverBar value={parts.lt}   max={10} color="#8B0F25"         label="Lost-time incidents"   hint="safety" />
              <DriverBar value={parts.stop} max={6}  color="#E5970E"         label="Stop-work hours"       hint="safety" />
              <DriverBar value={parts.pace} max={15} color="var(--or-amber)" label="Pace / % complete"     hint="schedule" />
            </>
          )}
        </div>
      </div>

      {contextNote && (
        <div style={{
          marginTop: 18, padding: "12px 16px",
          background: band.soft, borderRadius: 10, border: `1px solid ${band.color}33`,
          font: "500 13px var(--sm-font-ui)", color: "var(--or-light-ink)", lineHeight: 1.5,
        }}>
          <b style={{ color: band.color }}>Why {band.name.toLowerCase()}: </b>
          {contextNote}
        </div>
      )}
    </div>
  );
}
