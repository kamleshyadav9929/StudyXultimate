import React from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const JournalHistoryPage = () => {
  const { state } = useApp();
  const entries = state.journal || [];

  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8 pb-8">
      <header className="flex items-center gap-4">
        <Link to="/" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Journal History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Reflect on your past days.</p>
        </div>
      </header>

      <div className="space-y-6">
        {sortedEntries.length > 0 ? (
          sortedEntries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                  <Calendar size={20} />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {format(parseISO(entry.date), 'MMMM d, yyyy')}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
                  {format(parseISO(entry.date), 'EEEE')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Learned</h4>
                  <p className="text-slate-900 dark:text-slate-200 text-sm leading-relaxed">{entry.learned || "—"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Wasted Time</h4>
                  <p className="text-slate-900 dark:text-slate-200 text-sm leading-relaxed">{entry.wasted || "—"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Tomorrow's Goal</h4>
                  <p className="text-slate-900 dark:text-slate-200 text-sm leading-relaxed font-medium text-purple-600 dark:text-purple-400">{entry.goal || "—"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No entries yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Start your journaling habit today!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalHistoryPage;
