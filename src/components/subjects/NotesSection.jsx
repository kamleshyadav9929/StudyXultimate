import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileText, Trash2, Tag, Calendar, X, Eye, Edit3 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { clsx } from 'clsx';
import 'katex/dist/katex.min.css';

const NotesSection = ({ subjectCode, notes, onUpdate, subjectColor = '#3b82f6' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [isPreview, setIsPreview] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);

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
    if (expandedNote === noteId) setExpandedNote(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
          style={{ backgroundColor: subjectColor }}
        >
          <Plus size={20} />
          Add Note
        </motion.button>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Note</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-lg font-medium"
            />
            
            {/* Write/Preview Toggle */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
              <button 
                onClick={() => setIsPreview(false)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  !isPreview ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
                )}
              >
                <Edit3 size={14} /> Write
              </button>
              <button 
                onClick={() => setIsPreview(true)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  isPreview ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
                )}
              >
                <Eye size={14} /> Preview
              </button>
            </div>
            
            {isPreview ? (
              <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white min-h-[200px] prose dark:prose-invert prose-sm max-w-none overflow-y-auto">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {newNote.content || '*Start writing to see preview...*'}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                placeholder="Write your note here... (Supports Markdown & LaTeX Math)"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={8}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono text-sm"
              />
            )}
            
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNote}
                disabled={!newNote.title.trim() || !newNote.content.trim()}
                className="text-white px-6 py-2.5 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ backgroundColor: subjectColor }}
              >
                Save Note
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <motion.div 
              key={note.id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all"
            >
              {/* Colored Top Border */}
              <div className="h-1" style={{ backgroundColor: subjectColor }} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 flex-1">{note.title}</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteNote(note.id)}
                    className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
                
                <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 mb-4 prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {note.content}
                  </ReactMarkdown>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${subjectColor}15`,
                          color: subjectColor 
                        }}
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{note.tags.length - 3}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar size={10} />
                    {note.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${subjectColor}15` }}
            >
              <FileText size={36} style={{ color: subjectColor }} />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Notes Yet</h3>
            <p className="text-sm text-slate-500 mb-4">Create your first note to get started!</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium"
              style={{ backgroundColor: subjectColor }}
            >
              <Plus size={18} /> Add Note
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default NotesSection;
