# Pencil — Multi-format canvas prototype

An interactive follow-up to the Pencil Product Designer take-home challenge.

## Prototype

- **Live demo:** [prototype-review-kappa.vercel.app/pencil-canvas-v9.html](https://prototype-review-kappa.vercel.app/pencil-canvas-v9.html)
- **Standalone file:** [`prototype-review/pencil-canvas-v9.html`](prototype-review/pencil-canvas-v9.html)
- **Editable source:** [`prototype-review/pencil-canvas-v9.jsx`](prototype-review/pencil-canvas-v9.jsx)

Start with **Play walkthrough** in the top bar. It demonstrates the core journey:

1. Select a shared creative element.
2. Edit it once and see the change propagate.
3. Detect a format-specific composition constraint.
4. Distinguish safe auto-fitting from a genuine composition conflict.
5. Review the contextual AI recommendation.
6. Apply and approve the local adaptation.

You can then explore the canvas manually, open **Consistency**, add or duplicate formats, unlink/relink a format, add fine print, and inspect history and undo/redo.

## Product idea

The challenge asks how users could view and edit multiple formats of the same creative within one canvas. This prototype explores a model where:

- shared content propagates automatically;
- each format keeps local composition control;
- AI appears only when a format has a genuine composition conflict;
- adaptations change layout without changing shared copy;
- changes can propagate globally, by aspect-ratio group, or locally;
- CTA and fine print respect bottom anchoring and format safe areas;
- review states are visible but remain secondary to the canvas.

State language is intentionally simple: amber means **needs review**, purple means **AI adaptation pending**, and green means **approved**.

## Scope

This is a functional product prototype, not a complete replacement for Pencil's native editor. Native per-format editing tools remain part of the model; the prototype focuses on propagation, format-specific constraints, contextual AI assistance, and approval.

## Run locally

The generated HTML is self-contained for normal use. To rebuild it after editing the JSX source:

```bash
cd prototype-review
node build-v9.mjs
```

The interaction checks can be run with:

```bash
node interaction-checks.mjs
```

## Project map

- `prototype-review/` — working prototype, source, build script, assets and QA notes.
- `docs/audit/` and `docs/audit-flow-a/` — earlier flow audits and screenshots from the challenge process.
- `case-study-foundation.md` — research, framing and product rationale.

Built as an iterative exploration following the original challenge and subsequent feedback on clarity, hierarchy and tangible interaction. The supporting audits are kept under `docs/` so the working prototype remains the primary entry point.
