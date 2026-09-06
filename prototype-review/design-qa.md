# Design QA — Pencil multi-format canvas

## Evidence

- Source visual truth: `audit-desktop-overview.png` and `audit-adapted-pending.png` (the audited v8 states that this iteration corrects).
- Rendered implementation: `qa-overview-v9.png`, `qa-adapted-composition-v9.png`, and `qa-approved-v9.png`.
- Combined comparison: `qa-side-by-side.png`.
- Desktop CSS viewport: 1440 × 900 at device scale 1.
- Source pixels: overview 1420 × 900; adaptation 1440 × 900.
- Implementation pixels: 1440 × 900.
- Normalization: both sides were rendered into equal-width browser columns for the combined comparison. The 20 px overview-source difference is browser capture chrome and does not affect the app-content comparison.
- States compared: resting overview, focused shared-headline editing, AI adaptation pending review, and approved success.

## Full-view comparison

The overview changed intentionally from one horizontal strip into five ratio-family rows. All 18 formats are visible at once, family relationships can be scanned, and individual canvases remain recognizable. The Pencil chrome, panel proportions, typography, colors, imagery, and controls are preserved.

## Focused comparison

The adaptation state was compared separately because the headline, warning outline, contextual panel, and confirmation controls are too small to assess from the overview. The revised headline no longer collides with the logo in the inspected 16:9 canvas, the nine affected placements remain highlighted, and the AI panel stays contextual.

## Fidelity surfaces

- Fonts and typography: existing Inter UI and Georgia creative typography are preserved. The calculated headline scale maintains readable hierarchy and controlled wrapping.
- Spacing and layout rhythm: editor chrome is unchanged. Ratio rows use consistent horizontal gaps and larger vertical family separation. Focused canvases retain the original panel/canvas balance.
- Colors and visual tokens: violet remains the shared/unlinked relationship signal; amber remains human attention/review. No new competing status color was introduced; green appears only in the transient approval confirmation.
- Image quality and asset fidelity: the existing embedded campaign scene and thumbnails are preserved without added compression or altered crops.
- Copy and content: `Apply anyway` became the clearer `Keep as is`; the pending message now asks the user to review highlighted formats; confirmation is transient and removes the pending state.

## Comparison history

### Iteration 1

- [P1] The resting state said all linked while selection revealed nine existing overflows.
  - Fix: overflow now models allowed wrapping, making the default headline clean. Any genuine latent layout issue contributes to the global attention signal and appears on its canvas before selection.
  - Post-fix evidence: `qa-overview-v9.png`; selecting the default headline shows no hidden overflow.
- [P1] Adaptation used a fixed 20% reduction and could still report overflow.
  - Fix: every affected format receives a scale calculated from its own width, padding, line allowance, and measured headline.
  - Post-fix evidence: `qa-adapted-composition-v9.png`; the pending panel contains no residual overflow count.
- [P1] Approval left `Approve`, `to review`, and the pending message visible.
  - Fix: approval clears review state, exits element editing, removes highlights, and shows a short success confirmation.
  - Post-fix evidence: `qa-approved-v9.png`; automated DOM verification confirms the pending controls and count are absent.
- [P2] Eighteen formats in one strip were illegible at fit-to-screen.
  - Fix: formats are grouped into spatial rows by aspect-ratio family.
  - Post-fix evidence: `qa-side-by-side.png`.

### Iteration 2

- [P1] The first calculated fit solved width but allowed the adapted headline to collide vertically with the logo.
  - Fix: the calculated scale now includes compositional headroom rather than targeting a mathematically exact boundary.
  - Post-fix evidence: `qa-adapted-composition-v9.png`; the focused 16:9 creative preserves separation between logo and headline.

## Primary interactions tested

- Fit all formats to screen.
- Navigate from a format row to the corresponding canvas.
- Select one shared headline across 18 formats.
- Edit live and confirm that the AI stays hidden while typing.
- Pause and receive a contextual recommendation for the nine affected formats.
- Adapt the nine formats with individual calculated scales.
- Approve all nine and verify that every pending state disappears.
- Browser console checked: no errors.

## Follow-up polish

- [P3] Family labels are intentionally quiet and become small at overview scale; semantic-zoom labels could become slightly stronger below 70% zoom.
- [P3] The formats panel remains visually dense with 18 rows. Collapsing rows by family could reinforce the canvas grouping without changing the interaction model.

## Final result

final result: passed
