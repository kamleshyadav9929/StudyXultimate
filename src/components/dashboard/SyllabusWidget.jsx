import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

const SyllabusWidget = ({ subjects, syllabus }) => {
  // Calculate progress for each subject
  const subjectProgress = Object.keys(subjects).slice(0, 4).map(subjectCode => {
    const subjectSyllabus = syllabus[subjectCode] || {};
    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;

    Object.values(subjectSyllabus).forEach(unit => {
      if (unit.topics) {
        totalTopics += unit.topics.length;
        completedTopics += unit.topics.filter(t => t.status === 'completed').length;
        inProgressTopics += unit.topics.filter(t => t.status === 'in-progress').length;
      }
    });

    const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
    
    return {
      code: subjectCode,
      name: subjects[subjectCode]?.shortName || subjects[subjectCode]?.name || subjectCode,
      color: subjects[subjectCode]?.color || '#3b82f6',
      percentage,
      completed: completedTopics,
      inProgress: inProgressTopics,
      total: totalTopics
    };
  });

  const overallProgress = subjectProgress.length > 0
    ? Math.round(subjectProgress.reduce((acc, s) => acc + s.percentage, 0) / subjectProgress.length)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Syllabus Progress</h3>
            <p className="text-xs text-slate-500">{overallProgress}% overall completed</p>
          </div>
        </div>
        <Link 
          to="/subjects" 
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Subject Progress Bars */}
      <div className="space-y-4">
        {subjectProgress.map((subject, index) => (
          <motion.div 
            key={subject.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {subject.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {subject.completed}/{subject.total}
                </span>
                <span 
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${subject.color}20`,
                    color: subject.color 
                  }}
                >
                  {subject.percentage}%
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subject.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full relative"
                style={{ backgroundColor: subject.color }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-500">
            <CheckCircle2 size={14} />
            <span className="text-sm font-bold">
              {subjectProgress.reduce((acc, s) => acc + s.completed, 0)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Done</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            <Circle size={14} className="fill-current" />
            <span className="text-sm font-bold">
              {subjectProgress.reduce((acc, s) => acc + s.inProgress, 0)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">In Progress</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <Circle size={14} />
            <span className="text-sm font-bold">
              {subjectProgress.reduce((acc, s) => acc + (s.total - s.completed - s.inProgress), 0)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SyllabusWidget;
