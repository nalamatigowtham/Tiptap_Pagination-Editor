import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { MARGIN_PX, PRINTABLE_HEIGHT_PX, PAGE_GAP_PX } from '../constants';

const SAFE_HEIGHT = PRINTABLE_HEIGHT_PX;
const LINE_HEIGHT = 24;

export const Pagination = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('pagination');
    let timeout: any = null;
    let isSplitting = false;

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() { return DecorationSet.empty; },
          apply(tr, set) {
            const meta = tr.getMeta(pluginKey);
            if (meta instanceof DecorationSet) return meta;
            return set.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) { return pluginKey.getState(state); },
        },
        view(editorView) {
          const updatePagination = (view: EditorView) => {
            if (view.isDestroyed || isSplitting) return;

            const doc = view.state.doc;
            const decorations: Decoration[] = [];
            
            let currentPageContentHeight = 0; 
            let pageCount = 1;
            let splitCandidate: { pos: number; node: any; relativeTargetY: number } | null = null;

            const createBreakWidget = (pIndex: number, currentContentH: number) => {
              const container = document.createElement('div');
              container.className = 'page-break-widget-root';
              container.style.cssText = 'width: 100%; background: transparent; pointer-events: none; display: block; margin: 0; padding: 0; line-height: 0;';
              
              const fill = Math.max(0, 864 - currentContentH);
              
              container.innerHTML = `
                <div class="current-page-end" style="display: block; width: 100%; background: white; margin: 0; padding: 0;">
                  <!-- Fill content area to exactly 864px -->
                  <div class="page-fill-buffer" style="height: ${fill}px; width: 100%; background: white;"></div>
                  
                  <!-- Bottom Margin (Footer) -->
                  <div class="page-footer-section" style="height: ${MARGIN_PX}px; width: 100%; background: white; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                    <span style="font-size: 11px; color: #94a3b8; font-family: sans-serif; font-weight: 500;">Page ${pIndex}</span>
                  </div>
                </div>

                <!-- Visual spacer for Editor only -->
                <div class="visual-page-gap no-print" data-html2canvas-ignore="true" style="height: ${PAGE_GAP_PX}px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; position: relative; width: 100%;">
                  <div style="width: 100%; height: 1px; background: #e2e8f0; position: absolute;"></div>
                  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 9999px; padding: 2px 10px; font-size: 8px; color: #cbd5e1; font-weight: 800; z-index: 1;">PAGE ${pIndex} END</div>
                </div>

                <!-- The Actual PDF Break Point -->
                <div class="pdf-page-divider" style="height: 0; width: 100%; visibility: hidden; pointer-events: none; margin: 0; padding: 0; clear: both;"></div>

                <!-- Top Margin of Next Page -->
                <div class="next-page-start" style="display: block; width: 100%; background: white; height: ${MARGIN_PX}px; border-bottom: 1px solid #f1f5f9; box-sizing: border-box; margin: 0; padding: 0;"></div>
              `;

              return container;
            };

            // First Page Header (Top Margin)
            const startHeader = document.createElement('div');
            startHeader.className = 'page-header-first';
            startHeader.style.cssText = `height: ${MARGIN_PX}px; width: 100%; background: white; border-bottom: 1px solid #f1f5f9; display: block; margin: 0; padding: 0; box-sizing: border-box;`;
            decorations.push(Decoration.widget(0, startHeader, { side: -1000 }));

            doc.forEach((node, offset) => {
              const domNode = view.nodeDOM(offset) as HTMLElement;
              if (!domNode) return;
              let nodeHeight = domNode.offsetHeight || 0;

              if (currentPageContentHeight + nodeHeight > SAFE_HEIGHT) {
                // Large paragraph splitting logic
                if (currentPageContentHeight === 0 || nodeHeight > SAFE_HEIGHT) {
                   if (node.type.name === 'paragraph' && !splitCandidate) {
                      const remainingSpace = SAFE_HEIGHT - currentPageContentHeight;
                      const linesAllowed = Math.floor(remainingSpace / LINE_HEIGHT);
                      const targetY = (linesAllowed > 0 ? linesAllowed : 1) * LINE_HEIGHT;
                      splitCandidate = { pos: offset, node, relativeTargetY: targetY - 2 };
                   }
                } 
                
                decorations.push(Decoration.widget(offset, createBreakWidget(pageCount, currentPageContentHeight), { side: -1 }));
                
                pageCount++;
                currentPageContentHeight = 0; 
              }
              currentPageContentHeight += nodeHeight;
            });

            // Final Page Footer
            const finalFill = Math.max(0, 864 - currentPageContentHeight);
            const finalFooter = document.createElement('div');
            finalFooter.className = 'page-footer-final-wrap';
            finalFooter.style.cssText = 'width: 100%; background: white; pointer-events: none; display: block; margin: 0; padding: 0;';
            finalFooter.innerHTML = `
              <div class="page-fill-buffer" style="height: ${finalFill}px; width: 100%; background: white;"></div>
              <div class="page-footer-section" style="height: ${MARGIN_PX}px; width: 100%; background: white; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                <span style="font-size: 11px; color: #94a3b8; font-family: sans-serif; font-weight: 500;">Page ${pageCount}</span>
              </div>
            `;
            decorations.push(Decoration.widget(doc.content.size, finalFooter, { side: 1000 }));

            if (!view.isDestroyed) {
              const nextSet = DecorationSet.create(doc, decorations);
              view.dispatch(view.state.tr.setMeta(pluginKey, nextSet).setMeta('addToHistory', false));
            }

            if (splitCandidate && !isSplitting) {
              const cand = splitCandidate;
              isSplitting = true;
              requestAnimationFrame(() => {
                if (view.isDestroyed) { isSplitting = false; return; }
                try {
                  const domNode = view.nodeDOM(cand.pos) as HTMLElement;
                  if (!domNode) return;
                  const rect = domNode.getBoundingClientRect();
                  const targetViewportY = rect.top + cand.relativeTargetY;
                  const coords = view.posAtCoords({ left: rect.left + (rect.width / 2), top: targetViewportY });
                  
                  if (coords && coords.pos > cand.pos && coords.pos < cand.pos + cand.node.nodeSize - 1) {
                    let splitPos = coords.pos;
                    const charCoords = view.coordsAtPos(splitPos);
                    while (splitPos > cand.pos + 1) {
                      const prevCoords = view.coordsAtPos(splitPos - 1);
                      if (prevCoords.top < charCoords.top - 5) break; 
                      splitPos--;
                    }
                    if (splitPos > cand.pos && splitPos < cand.pos + cand.node.nodeSize - 1) {
                      const tr = view.state.tr.split(splitPos);
                      tr.setMeta('force-pagination', true);
                      tr.setMeta('addToHistory', false);
                      view.dispatch(tr);
                    }
                  }
                } catch (e) { 
                  console.error('Split failed', e); 
                } finally { 
                  setTimeout(() => { isSplitting = false; }, 40); 
                }
              });
            }
          };

          const scheduleUpdate = (view: EditorView) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => updatePagination(view), 80);
          };

          scheduleUpdate(editorView);
          return {
            update: (view, prevState) => {
              if (prevState && prevState.doc.eq(view.state.doc) && !view.state.tr.getMeta('force-pagination')) return;
              scheduleUpdate(view);
            },
            destroy: () => { if (timeout) clearTimeout(timeout); }
          };
        }
      }),
    ];
  },
});
