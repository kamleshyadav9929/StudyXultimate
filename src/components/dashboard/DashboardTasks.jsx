import React from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, Clock, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const DashboardTasks = ({ tasks }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  
  // Sort by priority (High > Medium > Low) then by date
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    const dateA = a.dueDate || '9999-12-31';
    const dateB = b.dueDate || '9999-12-31';
    return dateA.localeCompare(dateB);
  });

  const topTasks = sortedTasks.slice(0, 3);

  const getDeadlineStatus = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);
    
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'future';
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Priority Tasks</h3>
        <Link to="/schedule" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {topTasks.length > 0 ? (
          topTasks.map(task => {
            const deadlineStatus = getDeadlineStatus(task.dueDate);
            return (
              <div 
                key={task.id} 
                className={clsx(
                  "p-3 rounded-xl border transition-all",
                  deadlineStatus === 'overdue' ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" :
                  deadlineStatus === 'today' ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30" :
                  "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0",
                    task.priority === 'high' ? "border-red-400 text-red-400" :
                    task.priority === 'medium' ? "border-yellow-400 text-yellow-400" :
                    "border-blue-400 text-blue-400"
                  )}>
                    <div className={clsx(
                      "w-2.5 h-2.5 rounded-full",
                      task.priority === 'high' ? "bg-red-400" :
                      task.priority === 'medium' ? "bg-yellow-400" :
                      "bg-blue-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                    {task.dueDate && (
                      <div className={clsx(
                        "flex items-center gap-1.5 mt-1 text-xs",
                        deadlineStatus === 'overdue' ? "text-red-600 dark:text-red-400 font-medium" :
                        deadlineStatus === 'today' ? "text-orange-600 dark:text-orange-400 font-medium" :
                        "text-slate-500 dark:text-slate-400"
                      )}>
                        {deadlineStatus === 'overdue' ? <AlertCircle size={12} /> :
                         deadlineStatus === 'today' ? <Clock size={12} /> :
                         <Calendar size={12} />}
                        <span>
                          {deadlineStatus === 'overdue' ? 'Overdue' :
                           deadlineStatus === 'today' ? 'Due Today' :
                           task.dueDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400 dark:text-slate-500">
            <Check size={32} className="mb-2 opacity-50" />
            <p className="text-sm">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTasks;
