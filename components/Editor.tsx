import React from 'react';
import { EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import { PAGE_WIDTH_PX, MARGIN_PX } from '../constants';

interface EditorProps {
  editor: TiptapEditor | null;
}

export const Editor: React.FC<EditorProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="relative flex flex-col items-center py-12 min-h-full w-full bg-gray-200/50 overflow-y-auto">
      <div className="relative z-10 w-full flex flex-col items-center">
        <EditorContent 
          editor={editor} 
          className="tiptap-word-processor shadow-2xl bg-white"
          style={{ width: PAGE_WIDTH_PX + 'px' }}
        />
      </div>

      <style>{`
        .tiptap-word-processor .ProseMirror {
          background-color: white !important;
          padding-left: ${MARGIN_PX}px !important;
          padding-right: ${MARGIN_PX}px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          width: ${PAGE_WIDTH_PX}px !important;
          box-sizing: border-box !important;
          outline: none !important;
          position: relative;
          min-height: 1056px;
          display: block !important;
          font-variant-ligatures: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        .ProseMirror p {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          min-height: 24px;
          box-sizing: border-box !important;
          line-height: 24px !important; 
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .page-break-container, 
        .page-header-first, 
        .page-footer-final {
           display: block !important;
           clear: both !important;
           margin: 0 !important;
           padding: 0 !important;
           width: 100% !important;
           user-select: none;
           position: relative;
           background-color: white;
           box-sizing: border-box !important;
           z-index: 50;
           overflow: visible !important;
        }

        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 32px !important;
          box-sizing: border-box !important;
        }
      `}</style>
    </div>
  );
};