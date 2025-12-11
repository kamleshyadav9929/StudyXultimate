import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

const StoicJournal = ({ isOpen, onClose }) => {
  const { state, updateSection } = useApp();
  const [entry, setEntry] = useState({
    learned: '',
    wasted: '',
    goal: ''
  });

  // Load today's entry if it exists
  useEffect(() => {
    if (isOpen && state.journal) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const existingEntry = state.journal.find(e => e.date === todayStr);
      if (existingEntry) {
        setEntry({
          learned: existingEntry.learned,
          wasted: existingEntry.wasted,
          goal: existingEntry.goal
        });
      } else {
        setEntry({ learned: '', wasted: '', goal: '' });
      }
    }
  }, [isOpen, state.journal]);

  const handleSave = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newEntry = {
      id: Date.now().toString(),
      date: todayStr,
      ...entry
    };

    // Remove existing entry for today if any, then add new one
    const updatedJournal = state.journal.filter(e => e.date !== todayStr);
    updateSection('journal', [...updatedJournal, newEntry]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Stoic Journal</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              1. What did I learn today?
            </label>
            <textarea
              value={entry.learned}
              onChange={(e) => setEntry({ ...entry, learned: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 min-h-[80px] resize-none"
              placeholder="A new concept, a life lesson..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              2. Where did I waste time?
            </label>
            <textarea
              value={entry.wasted}
              onChange={(e) => setEntry({ ...entry, wasted: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 min-h-[80px] resize-none"
              placeholder="Social media, overthinking..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              3. What is the #1 goal for tomorrow?
            </label>
            <input
              type="text"
              value={entry.goal}
              onChange={(e) => setEntry({ ...entry, goal: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              placeholder="One big thing..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-purple-500/20"
          >
            <Save size={18} />
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoicJournal;
