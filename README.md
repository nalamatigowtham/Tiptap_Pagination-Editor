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

## 🛠 Technical Approach

### 1. Real-Time Content Measurement
The core pagination logic resides in a custom Tiptap Extension (`extensions/Pagination.ts`). Instead of relying solely on CSS `break-after`, this extension uses a **ProseMirror Plugin** to calculate page boundaries dynamically:

- **DOM Inspection**: The plugin iterates through the document's top-level nodes and uses `getBoundingClientRect()` to measure the rendered height of each element.
- **Cumulative Calculation**: It maintains a running total of content height. When the height exceeds the `PRINTABLE_HEIGHT_PX` (calculated as 11 inches minus 2 inches of margin at 96 DPI), a page break is triggered.
- **Decoration Widgets**: Page breaks are injected as ProseMirror **Widget Decorations**. This ensures that the page gaps, headers, and footers are visual artifacts only and do not pollute the actual document JSON/HTML data.

### 2. Physical Layout Simulation
The editor uses a specific CSS-to-Inches mapping to ensure print parity:
- **US Letter Constants**: Defined in `constants.ts` (8.5" x 11" at 96px/inch).
- **Injected Spacers**: The pagination widget injects a multi-part spacer consisting of:
  - A **Buffer**: Fills any remaining white space on the current page.
  - A **Footer**: Contains centered page numbering.
  - A **Visual Gap**: A grey "non-printable" area that provides the visual affordance of separate sheets.
  - A **Header**: Provides the top margin for the subsequent page.

### 3. High-Fidelity Print & PDF
To ensure that "Print Document" and "Export PDF" match the editor perfectly:
- **html2pdf.js Integration**: Both actions use `html2pdf.js` to capture the DOM state.
- **Blob Stream Printing**: The print function generates a PDF blob and opens it in a dedicated window, bypassing browser-specific print rendering inconsistencies.

## ⚖️ Trade-offs & Limitations

### Trade-offs
- **Performance vs. Accuracy**: Measuring the DOM on every document update can be computationally expensive for very long documents (50+ pages). To mitigate this, calculations are debounced by 50ms.
- **Block-Level Pagination**: The current implementation moves entire nodes (paragraphs, headings) to the next page if they don't fit. While this prevents "widows and orphans," it can create large white spaces for exceptionally long paragraphs.

### Limitations
- **Nested Splitting**: Splitting a single table row or a complex nested list across two pages requires significantly more complex logic involving node-splitting at the ProseMirror schema level, which was out of scope for this prototype.
- **Dynamic Margins**: Margins are currently fixed at 1 inch.

## 🔮 Future Improvements

If given more time, I would implement:
1. **Virtual Pagination**: Only calculating and rendering decorations for the current viewport and surrounding pages to support 100+ page documents with zero lag.
2. **Editable Headers/Footers**: Using separate Tiptap instances within the header/footer widgets to allow users to customize their letterheads and signatures directly.
3. **Table Row Splitting**: Implementing a specialized table extension that can calculate row heights and inject breaks *inside* table bodies.
4. **Web Worker Offloading**: Moving the height calculation logic to a Web Worker to keep the main UI thread completely free for typing.
5. **Draggable Margins**: Adding a visual ruler to allow users to drag and adjust margins, updating the constants and re-triggering the pagination flow.

---
*Developed for the OpenSphere Technical Assessment.*