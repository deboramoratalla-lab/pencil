# Consistency view audit

## Scope

Entry from Flow D's intentional TikTok headline unlinking into the on-demand Consistency view.

## Steps

1. **Flow D result — needs minor refinement**
   - TikTok headline is clearly marked `Local`.
   - The explanation and `Resume syncing` recovery action are visible.
   - The Formats-panel entry still says `Open`, which is appropriate before entering the audit.

2. **Consistency view — needs structural revision**
   - Strong compact matrix, clear format columns, and good use of whitespace.
   - The audit contradicts its source state: TikTok headline changes from `Local` to `Unreviewed`.
   - `Diverged (intentional)` contradicts the agreed model. Intentional differences should be `Local`; `Diverged` should be reserved for unexpected inconsistency.
   - The summary counts include a fifth row (`Brand colours`) that is clipped below the visible modal.
   - `Linked` is repeated across nearly every cell, reducing scan speed.
   - Cells have no prototype reactions, so they do not yet act as navigation affordances.
   - The Formats-panel control still says `Open` while the audit is open.
   - Small low-contrast detail text and color-dependent status encoding create accessibility risks.

## Recommended state vocabulary

- `Synced`: shared and aligned.
- `Unreviewed`: AI adaptation awaiting human confirmation.
- `Local`: intentionally unlinked or format-specific.
- `Excluded`: element intentionally absent for that format.
- `Attention`: unresolved conflict.

## Recommended interaction model

- Make every cell a full-row-height click target.
- Clicking a cell closes the audit and focuses the corresponding canvas and element.
- Show text labels primarily for exceptions; represent repeated `Synced` states with a compact icon and legend.
- Default the summary to exceptions: `1 Unreviewed`, `1 Local`, `1 Excluded`.
- Keep all rows visible or provide an explicit scroll affordance.
- Change the Formats-panel control to `Close` while the audit is open.

## Evidence limits

This review uses current Figma screenshots and prototype reaction metadata. Keyboard focus, hover treatment, screen-reader naming, responsive behavior, and actual scroll behavior still require an interactive implementation test.
