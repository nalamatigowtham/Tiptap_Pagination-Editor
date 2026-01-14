import React from 'react';
import { FileText, Users, Settings, History, MessageSquare, Info } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className = "" 
}) => {
  const NavItem = ({ icon: Icon, label, active = false }: any) => (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon size={20} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-6 ${className} overflow-y-auto`}>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Main</p>
        <NavItem icon={FileText} label="Drafting" active />
        <NavItem icon={History} label="Version History" />
        <NavItem icon={MessageSquare} label="Comments" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Collaborators</p>
        <NavItem icon={Users} label="Firm Team" />
        <NavItem icon={Info} label="Legal Guidelines" />
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h4 className="text-xs font-bold text-gray-700 mb-1">Standard Layout</h4>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Automatic US Letter pagination with standard 1-inch margins and centered footer numbering.
          </p>
        </div>
        <div className="mt-4">
          <NavItem icon={Settings} label="Editor Settings" />
        </div>
      </div>
    </aside>
  );
};
