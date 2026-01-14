# OpenSphere Tiptap Paginated Editor

A high-fidelity, real-time paginated rich text editor built with Tiptap and React. Designed specifically for legal professionals who require "What You See Is What You Get" (WYSIWYG) parity with US Letter (8.5" x 11") printed documents.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

---

## Key files to inspect
- extensions/Pagination.ts — core pagination logic implemented as a ProseMirror Plugin (measurement, split detection, widget decorations, and optional node-splitting).
- constants.ts — page and layout constants (inches → px mapping and safety buffer).
- components/Editor.tsx and index.html — editor styling and print rules (CSS that ensures print/export parity).
- types.ts — small types used for metrics/state.

---

## How page breaks are calculated (technical approach)

High-level flow
1. The pagination extension registers a ProseMirror plugin (extensions/Pagination.ts).
2. On editor updates (debounced), the plugin inspects the DOM representation of the document and measures rendered element heights with getBoundingClientRect().
3. It maintains a running cumulative content height for the current page. When adding the next node would exceed the printable content height, the plugin:
   - Chooses a break point: either between nodes (block-level) or attempts to find a safe split inside a long text node.
   - Records a splitCandidate for later (to avoid measuring inside the synchronous render loop).
4. The plugin injects page separators and fillers as ProseMirror Widget decorations (not modifying the document model):
   - A page fill buffer to make the current page exactly the printable height.
   - A footer area with page number (bottom margin).
   - A non-printable visual page gap shown only in the editor UI.
   - A header/top-margin for the following page.
5. For long text nodes that need splitting, the extension attempts to locate an exact character position to split at by:
   - Converting a target visual Y-position to a document position using view.posAtCoords().
   - Backtracking from the computed position (via view.coordsAtPos/coordsAtPos comparisons) to find a safe break (likely between words).
   - Dispatching a transaction to split the node at that character position (this path is guarded by isSplitting and done inside requestAnimationFrame to avoid reentrancy).
6. When exporting/printing, html2pdf.js is used to render DOM → PDF; the extension's print styles make the injected widgets behave correctly for page breaks and hide the editor-only visual gap.

Important constants (see constants.ts)
- PX_PER_INCH = 96 (CSS px per inch)
- PAGE_WIDTH_PX = 8.5 * 96 = 816
- PAGE_HEIGHT_PX = 11 * 96 = 1056
- MARGIN_PX = 1 * 96 = 96
- PRINTABLE_HEIGHT_PX = 860 (safe content height; slightly less than 864 to avoid sub-pixel rounding issues)
- PAGE_GAP_PX = 48 (visual gap between sheets in editor UI)
- LINE_HEIGHT = 24 (used to compute heuristic split offsets)

Why this approach?
- Visual fidelity: measuring the rendered DOM yields pagination decisions that match what the browser will print.
- Non-destructive: using decorations keeps the internal document JSON and node structure intact unless the plugin intentionally performs a split operation.
- Predictable page sizes: constants enforce a consistent letter-size layout and margins.

---

## Implementation details and heuristics

- DOM measurement: The plugin iterates top-level nodes and measures heights with getBoundingClientRect() to accumulate content height.
- Safe printable area: PRINTABLE_HEIGHT_PX is intentionally set smaller than full content area to reduce accidental browser page-break differences caused by subpixel/layout rounding.
- Split/Backtrack strategy: For nodes larger than the remaining space, the plugin computes a target Y position and uses posAtCoords/coordsAtPos to translate visual coordinates into a document position. It then backtracks character-by-character to find a "safe" split point (avoiding mid-word or invalid schema splits where possible).
- Decorations: Page separators are implemented with Decoration.widget elements. These create:
  - page-fill buffers to push the next content to a new printed page,
  - page footer with numbering,
  - a hidden pdf divider and top margin elements so printed output matches the editor.
- Print rules: CSS in index.html and Editor.tsx includes print-oriented rules and .no-print / .visual-page-gap classes so that visual-only spacers are hidden during print/export.
- Export: html2pdf.js is used to produce a predictable PDF output from the DOM snapshot.

---

## Trade-offs and limitations

Trade-offs
- Accuracy vs. performance:
  - Measuring the DOM provides better visual/print parity than pure CSS heuristics but is more expensive for long documents.
  - The extension debounces recalculation (50ms) to reduce thrash, favoring performance during typing at the cost of slightly delayed page repositioning.
- Non-destructive decorations vs. direct layout control:
  - Using decorations preserves the document model but can be less flexible than altering the model for complex splits (e.g., tables).
- Simpler split heuristics:
  - The current backtracking approach tries to find a character split by coordinates and stepping backwards. It works reasonably for paragraphs and text blocks but is heuristic and may not always find the perfect split point (especially in the presence of inline nodes, embeds, or complex markup).

Limitations / known edge cases
- Nested and complex node splitting:
  - Table rows, nested lists, or complex block nodes are not reliably split across pages. Splitting such nodes correctly would require schema-aware node-splitting logic at the ProseMirror level.
- Embedded media (images, charts, embeds):
  - These can have variable loading and layout behavior (lazy images, externally sized media), causing measurement jitter or incorrect breaks until fully loaded/measured.
- Very long documents (50–100+ pages):
  - Measuring every node in the document on each update does not scale. The current implementation is acceptable for short-to-medium documents but will become sluggish for extremely long content.
- Fixed margins and DPI:
  - The layout uses a fixed 96 px/inch mapping and fixed 1" margins. Nonstandard DPI or custom page sizes are not handled out of the box.
- Subpixel & browser differences:
  - Differences between rendering engines and subpixel rounding can still cause small differences between the in-editor preview and final browser print; the safe buffer helps but does not eliminate all differences.
- Accessibility / selection edge cases:
  - Injected widgets and decorations are non-interactive (pointer-events: none) which may affect some selection or keyboard navigation edge cases.

---

## Performance mitigations included
- Debounced layout recalculation (small timeout) to reduce CPU usage during rapid typing.
- isSplitting guard + requestAnimationFrame to avoid re-entrant split operations and to ensure splits happen after layout stabilizes.
- A SAFE_HEIGHT (PRINTABLE_HEIGHT_PX) buffer to avoid repeated flicker from tiny layout changes.

---

## What I would improve with more time

1. Virtualized pagination
   - Only measure and render decorations for the visible pages (and a small buffer). This would scale to 100+ page documents without measuring the entire document each update.

2. Web Worker offload
   - Move heavy measurement/analysis (or at least layout diffs) to a Web Worker. Combined with an offscreen snapshot or layout hints, the main thread could remain highly responsive.

3. Schema-aware splitting
   - Implement controlled, schema-safe node-splitting operations for tables, lists, and other complex nodes (rather than heuristics based purely on coords). Create specialized split logic for table rows and list items.

4. Editable headers/footers & margin UI
   - Allow users to edit header/footer content and tweak margins with a draggable ruler. That UI would update constants and trigger re-pagination.

5. Improved media handling
   - Wait for images/iframes to load (or use intrinsic dimensions) before finalizing layout. Fallback strategies for missing or lazy media.

6. Robust split heuristics and language-awareness
   - Improve backtracking to prefer splitting on whitespace and not mid-grapheme, and add language-aware wrapping considerations for CJK, ligatures, and combining characters.

7. Tests & CI
   - Add unit/integration tests that verify page boundaries for known content snippets, including tables, images, and long paragraphs.

8. Export refinements
   - Provide an option to generate the PDF server-side for perfect parity or to vary DPI/size settings for non-letter outputs.

---

## Developer / Run notes

- The project uses Tiptap / ProseMirror and a custom Pagination extension (extensions/Pagination.ts).
- The demo is runnable via the shipped index.html (import maps are used in the demo).
- Key constants and logic are centralized in constants.ts and extensions/Pagination.ts — start there when experimenting with page sizes, margins, or split heuristics.

---

## Summary

This repository demonstrates a pragmatic, DOM-measurement-based pagination strategy:
- It emphasizes WYSIWYG parity (what you see in the editor will closely match print/PDF) by measuring rendered nodes and injecting non-destructive page widgets.
- The current implementation favors correctness and fidelity for short-to-medium documents but trades off scalability and full schema-aware splitting.
- The next steps to make this production-ready would be virtualization, web-worker offloading, and robust node-splitting for complex structures like tables and nested lists.

---

*Developed for the OpenSphere Technical Assessment.*
