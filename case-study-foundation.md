# Pencil multi-format editor — Case study foundation

## 1. Challenge

Design a better way for marketers to view and edit several ad formats together and understand how changes propagate between them.

The challenge is not simply to place more canvases on screen. The experience must remain predictable when formats have different aspect ratios, layout constraints and intentional local differences.

## 2. What the brief explicitly asks for

- View multiple formats together.
- Edit across formats.
- Understand how changes propagate.
- Reduce switching between formats.
- Preserve consistency without removing intentional local adaptations.
- Use AI to reduce uncertainty while keeping the marketer in control.

## 3. Research approach

This case study is based on:

1. A product walkthrough of the Pencil workspace, workflows and Ads Editor.
2. Review of Pencil's public product documentation and Help Center.
3. A task analysis of the current multi-format editing flow.
4. A review of adjacent interaction patterns for propagation, linked state and progressive disclosure.

This is product and desk research, not primary user research. No usability interviews or behavioral analytics were available. Observations, interpretations and hypotheses are labelled separately.

## 4. Product facts

- The Ads Editor is Pencil's hands-on environment for composing and refining a creative.
- Formats are accessed and edited through the formats panel.
- `Edit all formats` determines whether a change applies across formats or only to one.
- AI Auto-Resize can create editable, layered versions of one creative in several target formats.
- Auto-Resize may require manual repositioning, especially across drastic aspect-ratio changes.
- Feed Variations map structured columns such as headline, image or CTA to creative layers.
- Pencil is consolidating generation, AI editing and manual refinement inside one unified editor.

## 5. Observations from the current experience

### O1 — Scope is controlled, but not continuously visible

The user can choose between editing all formats and editing one format, but the consequence of that choice is primarily represented by a control rather than by the canvases themselves.

### O2 — Format switching hides comparison

When only one format is inspected at a time, consistency has to be remembered or checked through repeated navigation.

### O3 — Propagation and adaptation are different operations

A shared content change and a format-specific layout adjustment solve different problems. Treating them as the same action risks either breaking consistency or removing necessary local control.

### O4 — Multi-format output is inherently imperfect

Pencil's own Auto-Resize documentation notes that some outputs need manual refinement. The product therefore needs to communicate not just that propagation happened, but where it remains uncertain.

### O5 — The editor is becoming the centre of the workflow

Pencil is moving generation and post-generation tools into the Ads Editor. Any new multi-format interaction should preserve creative flow instead of introducing a separate management environment.

## 6. Assumptions that require validation

- Marketers mentally model a campaign as one creative expressed through formats.
- Users prefer simultaneous multi-canvas editing to focused sequential editing.
- Most cross-format changes should propagate by default.
- Users understand the difference between shared content and local presentation.
- Conflicts can be detected early enough to provide useful inline guidance.
- A visual propagation cue improves confidence without becoming distracting.

The first assumption is structural. If marketers primarily think in independent platform assets, the proposed interaction model would need to change significantly.

## 7. Insights

### Insight 1 — The hard problem is confidence, not canvas count

Seeing four canvases is useful only if users can predict what an edit will affect and verify the outcome without checking every format manually.

### Insight 2 — Propagation needs local feedback

The consequence should appear where it happens. A TikTok constraint belongs on the TikTok canvas, not only in a global panel.

### Insight 3 — Consistency and sameness are not equivalent

A coherent creative can preserve the same message while adapting its presentation to a format. Shared semantics and local layout must be allowed to coexist.

### Insight 4 — Silence is a valid system response

When propagation succeeds, the system should remain quiet and let the canvases demonstrate the result. Assistance becomes valuable only when system constraints and user intent diverge.

### Insight 5 — Audit and editing have different information needs

Editing requires focus and immediate feedback. Auditing requires a compact cross-format overview. The audit layer should therefore be optional and secondary.

## 8. Problem reframe

### Initial framing

How might we let marketers edit several canvases at the same time?

### Reframed problem

How might we help marketers confidently make one creative change across multiple formats, while preserving intentional local adaptations and revealing only the exceptions that need a decision?

## 9. Design principles

1. The canvas is the primary editing surface.
2. Scope is visible before commitment.
3. Consequences appear on the affected format.
4. Successful propagation is quiet.
5. Shared content and local presentation remain distinct.
6. Divergence is explicit, reversible and reviewable.
7. AI recommends; the marketer decides.
8. Structural audit is compact and on demand.

## 10. Success criteria

A successful concept should let a user:

- Identify which formats an edit will affect before committing it.
- Understand the result without opening every format individually.
- Locate the only format needing attention within five seconds.
- Resolve a layout conflict without unintentionally detaching shared content.
- Distinguish an intentional absence from an error.
- Undo a cross-format edit using a predictable action boundary.

## 11. Next stage

Explore and compare at least three interaction models before selecting a direction:

1. Canvas-first live propagation.
2. Preview-before-apply.
3. Focused editing with a compact relationship navigator.

Each concept should be assessed against predictability, creative flow, scalability, implementation complexity and compatibility with Pencil's current editor.

## Sources

- Pencil take-home challenge brief.
- Pencil Help Center: “How do I create and edit templates in the Ads editor?”
- Pencil Help Center: “How can I use AI Auto-Resize to resize one creative into every format I need?”
- Pencil Help Center: “How do I Create Feed Variations?”
- Pencil Help Center: “When should you use Chat, Workflows or Sheets?”
- Pencil: “Editor Unification: From Idea to Ad in One Place.”
