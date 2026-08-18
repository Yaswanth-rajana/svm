import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2 } from 'lucide-react';

const TipTapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base focus:outline-none min-h-[200px] p-4 text-gray-300',
      },
    },
  });

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

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-white/10 bg-white/5 p-2 flex flex-wrap gap-1 rounded-t-xl">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          type="button"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          type="button"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 my-auto mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          type="button"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 my-auto mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          type="button"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('orderedList') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          type="button"
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 my-auto mx-1" />
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('link') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          type="button"
          title="Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded text-gray-400 hover:bg-white/10 transition-colors"
          type="button"
          title="Image"
        >
          <ImageIcon size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
      <MenuBar />
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
};

export default TipTapEditor;
