
import React, { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  AlignJustify,
  Heading1, 
  Heading2, 
  Undo, 
  Redo,
  Table as TableIcon,
  Highlighter,
  Link as LinkIcon,
  CheckSquare,
  Minus
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  children, 
  active = false, 
  onClick, 
  disabled = false,
  title,
  variant = 'default'
}) => {
  let baseClass = "p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 ";
  
  if (variant === 'primary') {
    baseClass += "bg-blue-600 text-white hover:bg-blue-700 px-3";
  } else if (variant === 'secondary') {
    baseClass += "border border-gray-300 text-gray-700 hover:bg-gray-50 px-3";
  } else {
    baseClass += active ? 'bg-blue-100 text-blue-700 font-bold shadow-inner' : 'text-gray-600 hover:bg-gray-100';
  }

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={baseClass}
    >
      {children}
    </button>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const addTable = useCallback(() => {
    // Fix: Cast to any to access insertTable command if types are not properly merged in the current environment
    (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5">
      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={18} />
        </ToolbarButton>
      </div>
      
      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton 
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
      </div>

      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton 
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive('highlight')}
          // Fix: Cast to any to access toggleHighlight command if types are not properly merged in the current environment
          onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}
          title="Highlight"
        >
          <Highlighter size={18} />
        </ToolbarButton>
      </div>

      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton 
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
        >
          <AlignJustify size={18} />
        </ToolbarButton>
      </div>

      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton 
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton 
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task List"
        >
          <CheckSquare size={18} />
        </ToolbarButton>
      </div>

      <div className="flex items-center">
        <ToolbarButton 
          onClick={setLink}
          active={editor.isActive('link')}
          title="Insert Link"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={addTable}
          active={editor.isActive('table')}
          title="Insert Table (3x3)"
        >
          <TableIcon size={18} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={18} />
        </ToolbarButton>
      </div>
      
      <div className="ml-auto flex items-center gap-3">
        <div className="h-4 w-px bg-gray-200" />
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
          US LETTER • Standard
        </div>
      </div>
    </div>
  );
};
