
import React from 'react';
import { Printer, Download, Share2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onPrint: () => void;
  onExportPDF: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPrint, onExportPDF }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 no-print">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          OS
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900 leading-tight">Document Editor</h1>
          <p className="text-xs text-gray-500 font-medium">USCIS Petition - Draft #1</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <Share2 size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle size={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button 
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm active:scale-95"
          title="Open print dialog"
        >
          <Printer size={18} />
          <span>Print Document</span>
        </button>
        <button 
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          title="Save as PDF via print dialog"
        >
          <Download size={18} />
          <span>Export PDF</span>
        </button>
      </div>
    </header>
  );
};
