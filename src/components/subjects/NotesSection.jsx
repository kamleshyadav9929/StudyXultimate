import React, { useState } from 'react';
import { Search, Plus, FileText, Trash2, Tag, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'; // Ensure you have this CSS or add it via CDN in index.html if needed

const NotesSection = ({ subjectCode, notes, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [isPreview, setIsPreview] = useState(false);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    let noteId;
    try {
      noteId = uuidv4();
    } catch (error) {
      console.error("UUID generation failed, using fallback", error);
      noteId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    const note = {
      id: noteId,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t),
      date: new Date().toISOString().split('T')[0]
    };

    onUpdate([...notes, note]);
    setNewNote({ title: '', content: '', tags: '' });
    setIsAdding(false);
  };

  const handleDeleteNote = (noteId) => {
    onUpdate(notes.filter(n => n.id !== noteId));
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium"
        >
          <Plus size={20} />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <input
            type="text"
            placeholder="Note Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1 rounded-lg text-sm ${!isPreview ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
            >
              Write
            </button>
            <button 
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1 rounded-lg text-sm ${isPreview ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
            >
              Preview
            </button>
          </div>
          
          {isPreview ? (
            <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white min-h-[150px] prose dark:prose-invert prose-sm max-w-none overflow-y-auto">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {newNote.content || '*No content*'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              placeholder="Write your note here... (Supports Markdown & LaTeX Math)"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={6}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
            />
          )}
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newNote.tags}
            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={!newNote.title.trim() || !newNote.content.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">{note.title}</h3>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 mb-4 prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {note.content}
                </ReactMarkdown>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-blue-600 dark:text-blue-400">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  {note.date}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>No notes found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
