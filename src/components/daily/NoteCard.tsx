import React from "react";
import { Save, Trash2 } from "lucide-react";

interface NoteCardProps {
  id?: string;
  title?: string;
  initialContent?: string;
  onSave: (title: string, content: string, id?: string) => void;
  onDelete?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  id,
  title = "",
  initialContent = "",
  onSave,
  onDelete,
}) => {
  const [currentTitle, setCurrentTitle] = React.useState(title);
  const [content, setContent] = React.useState(initialContent);

  const handleBlur = () => {
    // Only save on blur if we have content or a title, and it is different (ideal, but for now just callback)
    if (content.trim() || currentTitle.trim()) {
      onSave(currentTitle, content, id);
    }
  };

  return (
    <div className="bg-[#121212] text-white p-6 rounded-3xl shadow-lg border border-white/10 h-full flex flex-col group relative">
      {/* Delete Action (only if ID exists) */}
      {id && onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2 size={14} />
        </button>
      )}

      <input
        type="text"
        placeholder="Note Title"
        className="text-xl font-bold mb-2 bg-transparent border-none placeholder-zinc-700 focus:outline-none w-full text-white"
        value={currentTitle}
        onChange={(e) => setCurrentTitle(e.target.value)}
        onBlur={handleBlur}
      />
      <textarea
        className="w-full flex-1 resize-none bg-transparent border-none focus:outline-none text-zinc-400 focus:text-zinc-200 leading-relaxed custom-scrollbar placeholder-zinc-800"
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
      />
      <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider flex items-center gap-1">
          <Save size={10} /> {id ? "Saved" : "Auto-save"}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;
