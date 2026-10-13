import type { ReactNode } from "react";
import type { MilestoneState, Rag } from "../data/types";

export const ragLabel = (rag: Rag) =>
  rag === "red" ? "Critical" : rag === "amber" ? "At risk" : "On track";

export const ragTag = (rag: Rag) =>
  rag === "red" ? "critical" : rag === "amber" ? "atrisk" : "ontrack";

/** Readable-on-light text color per RAG. */
export const ragInk = (rag: Rag) =>
  rag === "red" ? "var(--or-red)" : rag === "amber" ? "#B97300" : "#1B9C5C";

/** Soft background + dark ink pair per RAG (avatars, pills). */
export const ragSoft = (rag: Rag) =>
  rag === "red"   ? { background: "#FDE5E8", color: "#B11631" }
  : rag === "amber" ? { background: "#FFE7C1", color: "#8A4400" }
  :                   { background: "#D7F4DE", color: "#146E2B" };

export const schedRag = (wks: number): Rag => (wks > 4 ? "red" : wks > 0 ? "amber" : "green");

export const schedText = (wks: number) =>
  wks === 0 ? "On plan" : wks > 0 ? `+${wks} wks` : `${wks} wk`;

export function RAGPill({ rag }: { rag: Rag }) {
  return (
    <span className={`rag-pill r-${rag}`}>
      <span className="d"></span>{ragLabel(rag)}
    </span>
  );
}

export function StatusIcon({ state }: { state: MilestoneState }) {
  if (state === "ontrack") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (state === "watch" || state === "atrisk") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Horizontal rule with a centered uppercase label. */
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="section-divider">
      <div className="line"></div>
      <div className="label">{label}</div>
      <div className="line"></div>
    </div>
  );
}

/** Small uppercase stat label used inside light cards. */
export function MicroLabel({ children }: { children: ReactNode }) {
  return <div className="micro-lab">{children}</div>;
}
