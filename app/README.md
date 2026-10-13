# Owners Risk Dashboard

Implementation of the Claude Design handoff in `../project/Owners Risk Dashboard.html`
(Vite + React 18 + TypeScript, no runtime dependencies beyond React).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
```

## Structure

- `src/data/` — mock portfolio, GC/trade, safety data (`data.ts`) and the composite
  risk-score formula (`riskScore.ts`; edit the constants there to plug in an in-house rubric).
- `src/screens/` — the four drill-down levels: Portfolio (dark) → Project → GC → Sub (light).
- `src/components/` — top chrome, risk-score gauge/badge/hero, safety panels, view options.
- `src/styles/` — design tokens and app CSS ported from the prototype.

## Routes (hash-based, deep-linkable, back button works)

| URL | Screen |
| --- | --- |
| `#/` | Portfolio |
| `#/sites/ATL-04` | Project detail |
| `#/sites/ATL-04/gc` | GC composite risk + org tree |
| `#/sites/ATL-04/subs/rosendin` | Sub detail |

The prototype's Tweaks panel is a **View options** pill (bottom right): owner brand swap,
project layout (Operator / Schedule-first / Tabbed) and quick-nav. Choices persist in localStorage.

All figures are illustrative placeholders — replace `src/data/data.ts` with live sources.
