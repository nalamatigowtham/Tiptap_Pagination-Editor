import React, { useState } from 'react';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Typography } from '@tiptap/extension-typography';
import { Pagination } from './extensions/Pagination';
import html2pdf from 'html2pdf.js';

import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Generating PDF Document...');
  const [content, setContent] = useState<string>(
    '<p>This is a live interactive document. You can click anywhere to edit text, delete sections, or paste your own content. As you type, the editor will automatically manage page breaks and numbering to ensure USCIS compliance.</p>'
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your legal document...' }),
      Highlight,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      Pagination,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  // Updated: accept element to compute its height and set better html2canvas/pagebreak options
  const getPdfOptions = (element?: HTMLElement) => ({
    margin: 0,
    filename: 'uscis-document.pdf',
    image: { type: 'jpeg' as const, quality: 1.0 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      // Use -window.scrollY so html2canvas captures the element's position correctly
      scrollY: -window.scrollY,
      // Lock to the expected US Letter width (px) and set windowHeight to element height so
      // html2canvas renders the full element (avoids vertical cropping/tiling rounding issues)
      windowWidth: 816,
      windowHeight: element ? Math.ceil(element.scrollHeight) : undefined,
    },
    jsPDF: {
      unit: 'px' as const,
      format: [816, 1056] as [number, number],
      orientation: 'portrait' as const,
      hotfixes: ['px_scaling'],
    },
    // Make html2pdf respect both css and the explicit page divider selector so page splitting
    // follows the plugin's injected .pdf-page-divider widgets.
    pagebreak: {
      mode: ['css', 'legacy'],
      before: '.pdf-page-divider',
    },
  });

  const handlePrint = async () => {
    if (!editor) return;
    setIsExporting(true);
    setLoadingText('Preparing Document for Print...');
    
    const element = document.querySelector('.tiptap-word-processor') as HTMLElement;
    if (!element) {
      setIsExporting(false);
      return;
    }

    document.body.classList.add('is-pdf-exporting');

    try {
      // Pass element into getPdfOptions so html2canvas can be sized to the element height
      const worker = html2pdf().set(getPdfOptions(element)).from(element).toPdf();
      const pdf = await worker.get('pdf');
      const blobUrl = pdf.output('bloburl');
      
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print failed:', err);
      window.print();
    } finally {
      document.body.classList.remove('is-pdf-exporting');
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!editor) return;
    setIsExporting(true);
    setLoadingText('Generating PDF Document...');
    
    const element = document.querySelector('.tiptap-word-processor') as HTMLElement;
    if (!element) {
      setIsExporting(false);
      return;
    }

    document.body.classList.add('is-pdf-exporting');

    try {
      // Pass element here as well
      await html2pdf().set(getPdfOptions(element)).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      document.body.classList.remove('is-pdf-exporting');
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
      <Header onPrint={handlePrint} onExportPDF={handleExportPDF} />
      
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="font-semibold">{loadingText}</div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Editor editor={editor} />
        <Toolbar editor={editor} />
      </div>
    </div>
  );
};
export default App;
