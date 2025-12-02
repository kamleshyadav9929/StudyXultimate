import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, MoreVertical, GraduationCap } from 'lucide-react';

const SubjectsPage = () => {
  const { state, loading } = useApp();

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  const getProgress = (subjectCode) => {
    const subjectSyllabus = state.syllabus[subjectCode] || {};
    let totalTopics = 0;
    let completedTopics = 0;

    Object.values(subjectSyllabus).forEach(unit => {
      if (unit.topics) {
        totalTopics += unit.topics.length;
        completedTopics += unit.topics.filter(t => t.status === 'completed').length;
      }
    });

    return totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Subjects</h1>
          <p className="text-slate-400 text-lg">Access notes, syllabus, and PYQs for all your courses.</p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(state.subjects).map((subject) => {
          const progress = getProgress(subject.code);
          
          return (
            <Link 
              key={subject.code} 
              to={`/subject/${subject.code}`}
              className="group relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Top Color Bar */}
              <div 
                className="h-2 w-full"
                style={{ backgroundColor: subject.color }}
              />

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {subject.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                      {subject.code}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 ml-2">
                    {subject.credits} Cr
                  </span>
                </div>

                {/* Progress Section */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Completion</span>
                    <span className="text-slate-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${progress}%`, 
                        backgroundColor: subject.color 
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsPage;
