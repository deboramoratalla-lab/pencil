# Pencil multi-format editor — full flow audit

## Scope

24 current prototype states: Flow A (including approved result), Flow B (including approved result), Flow C, Flow D, Consistency Audit, and Flow E.

The review covers:

- interaction and prototype routing;
- visible buttons, links, and controls;
- status vocabulary, color, and progression;
- user-facing copy;
- canvas order and internal creative content;
- selection rings, ghost outlines, safe zones, and native-CTA notes;
- frame naming, placement, background colors, and stale content;
- screenshot-visible accessibility risks.

## Overall verdict

The central product model is strong and now reads consistently in Flows B and D:

> The canvas is where users think. Propagation is where the system thinks. AI only speaks when those two diverge.

The prototype is not yet presentation-ready because the interaction graph and status progression are inconsistent. The most serious issue is that several controls look actionable but have no prototype reaction.

## Global decisions to lock

### Canvas order

Use this order everywhere:

1. YouTube
2. TikTok
3. Facebook
4. X
5. Any newly added format

The right Formats panel and Audit already use this order. Every main canvas currently uses YouTube, X, Facebook, TikTok.

### Status vocabulary

- `Applied` — shared change applied cleanly.
- `Unreviewed` — AI adaptation awaiting human approval.
- `Reviewed` — human-approved adaptation.
- `Local` — intentional format-specific version that no longer syncs.
- `Attention` — unresolved conflict.
- `Excluded` — element intentionally absent in a format.

Avoid `Review`, `Edited`, `Diverged (intentional)`, `Not present`, and compound tags.

### Status colors

- `Applied` / `Reviewed`: green, `#29A666` at 20% with `#1A6B4A` text.
- `Unreviewed`: blue-gray, `#DEE5F2` with `#3D5275` text.
- `Attention`: amber, `#FEC951` with `#6B4A05` text.
- `Local`: neutral gray. Two grays currently exist (`#E5E5E3` and `#E5E8EB`); standardize one.
- `Excluded`: neutral gray with a distinct icon or outline.

The current combinations appear readable at the captured size, but color must not be the only state indicator.

### Tag composition

- One word inside each tag.
- Explanation below the tag.
- Action below the explanation.
- Tags report state; buttons change state.

### Canvas internals

- Root frame background is consistently `#F5F5F5`.
- TikTok safe-zone overlays are consistently black at 35% opacity.
- Selection and ghost-outline components are consistently reused.
- Native CTA notes belong below the creative, not inside it.
- Apply the same treatment to the new Instagram Story creative.

## Flow-by-flow audit

### Flow A — editing shared headline

#### A0 · Resting — healthy

- Calm default with no persistent state noise.
- Clicking the YouTube headline correctly enters A1.
- Main canvas order is incorrect.

#### A1 · Headline selected — mostly healthy

- Strong preflight: YouTube, X, and TikTok are clean; Facebook is the only conflict.
- Primary recommendation (`Adapt Facebook`) is visually prioritized.
- `Apply anyway` is a clear human override.
- The preflight list order does not match the desired canvas order.
- Selection/ghost treatment communicates the linked relationship well.

#### A2B · Apply anyway — needs correction

Current tags:

- YouTube `Reviewed`
- X `Unreviewed`
- Facebook `Reviewed`
- TikTok `Unreviewed`

Correct result:

- YouTube `Applied`
- TikTok `Applied`
- Facebook `Reviewed`
- X `Applied`

Keep the warning below Facebook because accepting the overflow does not remove the risk.

#### A2A · Adapt Facebook — needs correction

Current tags:

- YouTube `Reviewed`
- X `Unreviewed`
- Facebook `Unreviewed`
- TikTok `Unreviewed`

Correct pending result:

- YouTube `Applied`
- TikTok `Applied`
- Facebook `Unreviewed`
- X `Applied`

Keep `Layout adapted by AI` and `Approve adaptation` under Facebook.

#### A2A.1 · Adaptation approved — needs correction

The approved frame exists outside the main Prototype section.

Correct final result:

- YouTube `Applied`
- TikTok `Applied`
- Facebook `Reviewed`
- X `Applied`

Move this frame into the main section and update the case-study annotation so it is not omitted from the flow.

### Flow B — moving the logo

#### B0 · Resting — visually healthy, prototype incomplete

- No reaction starts Flow B.

#### B1 · Logo selected — conceptually strong, prototype incomplete

- The linked logos illuminate across formats.
- Replace `Also in 3 other formats — shift-click to add them` with `Shared across 4 formats`.
- Shift-click implies manual multi-selection and weakens the automatic propagation model.
- No reaction advances to B2.

#### B2 · AI scope recommendation — strong design, dead controls

- Recommendation correctly distinguishes X, Facebook, and TikTok.
- `Apply to 2 formats` and `Keep local` have no prototype reactions.
- The result copy is useful, but explanatory case-study text at the top of the product frame should be moved outside the UI.

#### B3 · Applied, Facebook pending — mostly healthy

Current:

- YouTube has no tag.
- X `Applied`.
- Facebook `Unreviewed` with explanation and approval action.
- TikTok `Local` with explanation.

Add `Applied` to YouTube for symmetry and explicit completion.

`Approve adaptation` correctly leads to B4.

#### B4 · Facebook approved — healthy

- YouTube `Applied`.
- X `Applied`.
- Facebook `Reviewed`.
- TikTok `Local`.
- The floating decision panel is correctly gone.
- This approved frame also sits outside the main Prototype section.
- Move explanatory case-study copy outside the product frame.

### Flow C — adding fineprint

#### C0 · Resting — visually healthy, prototype incomplete

- No reaction opens the Copy panel or begins C1.

#### C1 · Copy panel — visually healthy, dead controls

- All visible `Add…` controls have no reactions.
- `Add Fineprint` should lead to the hover/selection state.
- Other controls can remain out of scope, but should not appear fully interactive without either reactions or a clearly documented prototype boundary.

#### C1 hover — useful supporting state, dead control

- The hover treatment is visible and clear.
- The frame is slightly misaligned on the Figma board relative to the rest of the row.
- No click reaction leads to C2.

#### C2 · Live propagation — strong concept, missing relationship feedback

- Fineprint appears live in YouTube, X, and Facebook.
- TikTok correctly remains unchanged.
- Only the source fineprint is selected.
- Add ghost outlines to the X and Facebook fineprint so propagation is visible, not inferred.

#### C3 · One exception — incomplete resolution

Current states are semantically correct:

- YouTube `Applied`.
- X `Unreviewed`.
- Facebook `Unreviewed`.
- TikTok `Attention`.

Missing actions:

- X and Facebook need approval, either individually or via `Approve 2 adaptations`.
- `Recommended · Adapt layout` is plain text but reads like an action. Make `Adapt layout` a button.
- Add a resolved state after adapting TikTok and approving the two placements.

The current screen is a review checkpoint, not a completed final state.

### Flow D — unlinking TikTok headline

#### D0 · Resting — visually healthy, prototype incomplete

- No reaction selects the TikTok headline or enters D1.

#### D1 · Scope reveal — healthy

- `Synced with 3 other formats` is precise.
- `Edit all formats` correctly routes to Flow A.
- `Unlink TikTok` correctly routes to D2.
- Consequence copy is visible before the destructive relationship change.

#### D2 · Local result — healthy, Audit entry broken

- `Local`, its explanation, and `Resume syncing` are coherent.
- `Resume syncing` correctly returns to the shared state.
- The visible `Open` control for Consistency view has no reaction.

### Consistency Audit — structurally promising, currently contradictory

- Good density, spacing, format thumbnails, and row hierarchy.
- TikTok headline changes from `Local` in D2 to `Unreviewed` in the Audit.
- `Diverged (intentional)` should be `Local`.
- `Not present` should be `Excluded`.
- Background presentation differences should not be flagged if this view audits shared creative semantics only.
- `Linked` is repeated excessively; repeated healthy states should use a compact indicator and legend.
- `Brand colours` is counted in the summary but clipped below the visible panel.
- Cells have no reactions, so they are not navigation affordances.
- The Formats-panel control still says `Open` while the Audit is open.
- The background canvas is stale: it restores old poster-frame tags and does not preserve D2's local TikTok headline.
- Both close controls correctly return to D2, but the sidebar `Open` control acting as a close action is mislabeled.

Required interaction:

- Every cell closes the Audit and focuses the corresponding format and element.
- While open, the sidebar control should read `Close` or show an active state.

### Flow E — adding Instagram Story

#### E0 · Add formats — needs correction

- The chosen Instagram path is reachable.
- Remove inherited `Unreviewed · poster frame` tags.
- `AI Auto-Resize` is visibly off.

#### E1 · Platform hover — needs correction

- Hover progression is clear.
- Remove inherited poster-frame tags.
- AI Auto-Resize remains off.

#### E2 · Instagram expanded — partially interactive

- Instagram Story is connected to the next state.
- Other visible Instagram format rows have no reactions.
- For a focused prototype this is acceptable only if those options are visually de-emphasized or the boundary is documented.
- Remove inherited poster-frame tags.

#### E3 · Story hover — mostly healthy

- Add button is clear and connected.
- Remove inherited poster-frame tags.
- AI Auto-Resize is still off.

#### E4 · Format added — contradictory and incomplete

- The result says `Unreviewed · AI-generated` while AI Auto-Resize was off throughout the selection flow.
- Either turn AI Auto-Resize on before adding, or create a manual-fit result when it is off.
- Replace the compound tag with:
  - `Unreviewed`
  - `Layout generated by AI`
  - `Approve adaptation`
- Add a final `Reviewed` state.
- Remove inherited poster-frame tags from X and Facebook.
- Move the Instagram native-CTA note below the creative.
- Correct the layer name `Format label — X Single Image Ad`, which contains the Instagram label.

## Prototype interaction audit

### Working core transitions

- A0 → A1.
- A1 → A2A / A2B.
- A2A → A2A.1.
- B3 → B4.
- D1 → Flow A / D2.
- D2 `Resume syncing` → D0.
- E0 → E1 → E2 → E3 → E4.
- Audit close → D2.

### Visible controls with missing reactions

- Most `Consistency view · Open` controls.
- B0 and B1 entry/advance.
- B2 `Apply to 2 formats`.
- B2 `Keep local`.
- C0 entry.
- All C1 Copy-panel buttons.
- C1 hover → C2.
- C3 approval and TikTok adaptation.
- D0 → D1.
- D2 → Audit.
- Every Audit matrix cell.
- E2's non-Story Instagram rows.
- E4 approval.

## Accessibility risks visible in screenshots

- Several secondary descriptions are very small and low contrast.
- Status depends heavily on color; retain text/icon redundancy.
- Some text links have much smaller targets than nearby buttons (`Resume syncing`).
- Audit cells need full-cell hit areas and visible keyboard focus.
- Hover-only states in Flows C and E need keyboard equivalents.
- Native CTA notes wrap to three lines at narrow widths; verify reflow at zoom.
- Motion and propagation waves need a reduced-motion alternative.

Screenshot review cannot verify actual tab order, focus management, screen-reader labels, or WCAG contrast for every composited image state.

## Recommended correction order

### P0 — before presenting

1. Fix canvas order globally.
2. Repair Flow A statuses.
3. Wire the broken primary path controls in B, C, D, Audit, and E.
4. Remove inherited poster-frame tags from Audit and Flow E.
5. Make Audit reflect D2's `Local` state.
6. Resolve AI Auto-Resize off versus AI-generated output.

### P1 — complete the logic

1. Add C3 approval/adaptation actions and final state.
2. Add E4 approval and final state.
3. Make every Audit cell navigate.
4. Add `Applied` to YouTube in B3.
5. Move A2A.1 and B4 into the main Prototype section.

### P2 — presentation polish

1. Move case-study explanatory copy outside product frames.
2. Standardize the Local gray.
3. Add ghost outlines to C2 propagated fineprint.
4. Fix board alignment and stale layer names.
5. Increase small secondary-copy readability.

## Evidence

All accepted frame captures are in `screenshots/`. Contact sheets:

- `screenshots/contact-A.png`
- `screenshots/contact-B.png`
- `screenshots/contact-C.png`
- `screenshots/contact-D.png`
- `screenshots/contact-E.png`

