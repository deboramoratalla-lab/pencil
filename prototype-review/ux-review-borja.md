# Pencil prototype review

## Central proposal

Edit shared content once, see it across formats, and review only the layouts that need attention. Local copy remains local until the user explicitly relinks it.

This is a working product hypothesis, not a finding from user research. Borja's feedback supports making the interactions tangible and the narrative concise; it does not validate this particular syncing model.

## Suggested demonstration — about 90 seconds

1. Show the overview of 18 formats. Say: “I want to change the message without checking eighteen separate files.”
2. Select a headline and edit it. Show the linked headlines updating. Avoid explaining the audit or every status.
3. Introduce longer copy. Pause, then use the contextual adaptation suggestion. Point out that the copy remains shared while text size changes locally.
4. Review the result and approve it. For text that cannot fit at the minimum size, show that the system keeps the issue open.
5. If asked about exceptions, unlink one format, change its copy and edit the shared headline again. The local version is preserved.

Keep format management and the consistency audit for questions. Their purpose is navigation and inspection, not an additional central proposal.

## Corrections implemented

- Shared edits no longer erase local overrides.
- Selecting a local element loads the local value. Unlink is available directly for the selected format.
- Undo/redo supports edits, relinking, adaptation, adding/removing formats and the main adaptation approval.
- Header zoom reflects actual canvas scale, with zoom presets and Fit all formats.
- Wheel scrolling pans; Ctrl/Command + wheel zooms. Dragging no longer selects an element accidentally on mouse release.
- Audit counts distinguish linked and excluded placements. Adding a format does not create reviews for absent elements.
- Audit review controls and canvas alerts navigate to affected formats. Sidebar review actions open the result rather than approving from a tiny thumbnail.
- Suggestions wait for a typing pause. Adaptation uses word wrapping and a minimum type scale; unresolved overflow remains visible and cannot be approved through the main adaptation action.
- Pending reviews can be reopened after leaving the adaptation panel.
- Empty platform accordions removed. Duplicate additions prevented.
- Removed the timed introductory pill/ring. Global features not implemented in this prototype are disabled with scope tooltips.

## Verification

`node prototype-review/interaction-checks.mjs` passes checks for propagation, local overrides, relinking, undo/redo, delayed suggestions, successful adaptation approval, unresolved overflow, audit exclusions, format addition and removal cleanup.

These are component event/state checks with approximate text measurement, not browser or usability tests. The HTML build also passes.

## Outstanding verification and limits

- Live browser testing remains blocked: the local server is stopped and starting a listener from this environment returns EPERM. Open `serve-prototype.command`, then verify actual typography, wrapping, canvas navigation, pointer gestures and layout at the presentation window size.
- AI adaptation is a deterministic local simulation of headline resizing. It does not call an AI model or assess image composition, brand meaning, every element's collisions or platform compliance.
- Save, export and version history are outside this prototype. Do not describe it as a production editor or claim it is bug-free.
- The presentation itself still needs a timed rehearsal. A simpler prototype alone does not guarantee concise answers; lead with the decision and demonstrate the evidence before explaining alternatives.
