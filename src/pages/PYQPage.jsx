import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight, AlertCircle } from 'lucide-react';

const PYQPage = () => {
  const { state, loading } = useApp();

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">PYQ Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your Previous Year Questions progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(state.subjects).map((subject) => {
          const questions = state.pyq[subject.code] || [];
          const masteredCount = questions.filter(q => q.status === 'mastered').length;
          const practicedCount = questions.filter(q => q.status === 'practiced').length;
          const totalCount = questions.length;

          return (
            <Link 
              key={subject.code} 
              to={`/subject/${subject.code}?tab=pyq`}
              className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.shortName ? subject.shortName.substring(0, 2) : subject.code.substring(0, 2)}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{masteredCount}/{totalCount}</span>
                  <span className="text-xs text-slate-500">Mastered</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {subject.name}
              </h3>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all" 
                  style={{ width: `${totalCount === 0 ? 0 : (masteredCount / totalCount) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <span>Manage PYQs</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center gap-3 text-slate-500 dark:text-slate-400">
        <AlertCircle size={20} />
        <p>You can add questions manually inside each subject's PYQ tab.</p>
      </div>
    </div>
  );
};

export default PYQPage;
