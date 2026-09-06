# Pencil — Multi-format canvas prototype

An interactive follow-up to the Pencil Product Designer take-home challenge.

## Prototype

- **Live demo:** [pencil-two-nu.vercel.app](https://pencil-two-nu.vercel.app/)
- **Standalone file:** [`prototype-review/pencil-canvas-v8.html`](prototype-review/pencil-canvas-v8.html)
- **Editable source:** [`prototype-review/pencil-canvas-v8.jsx`](prototype-review/pencil-canvas-v8.jsx)

Start with **Play walkthrough** in the top bar. It demonstrates the core journey:

1. Select a shared creative element.
2. Edit it once and see the change propagate.
3. Detect a format-specific composition constraint.
4. Review the contextual AI recommendation.
5. Apply and approve the local adaptation.

You can then explore the canvas manually, open **Consistency**, add or duplicate formats, unlink/relink a format, and inspect history and undo/redo.

## Product idea

The challenge asks how users could view and edit multiple formats of the same creative within one canvas. This prototype explores a model where:

- shared content propagates automatically;
- each format keeps local composition control;
- AI appears only when a format diverges from the shared creative;
- adaptations change layout without changing shared copy;
- review states are visible but remain secondary to the canvas.

State language is intentionally simple: amber means **needs review**, purple means **AI adaptation pending**, and green means **approved**.

## Scope

This is a functional product prototype, not a complete replacement for Pencil's native editor. Native per-format editing tools remain part of the model; the prototype focuses on propagation, format-specific constraints, contextual AI assistance, and approval.

## Run locally

The generated HTML is self-contained for normal use. To rebuild it after editing the JSX source:

```bash
cd prototype-review
node build.mjs
```

The interaction checks can be run with:

```bash
node interaction-checks.mjs
```

## Project map

- `prototype-review/` — working prototype, source, build script, assets and QA notes.
- `audit/` and `audit-flow-a/` — earlier flow audits and screenshots from the challenge process.
- `case-study-foundation.md` — research, framing and product rationale.

Built as an iterative exploration following the original challenge and subsequent feedback on clarity, hierarchy and tangible interaction.
