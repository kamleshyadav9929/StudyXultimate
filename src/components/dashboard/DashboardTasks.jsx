import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '../../context/AppContext';

const DashboardTasks = () => {
  const { state, updateState } = useApp();
  const tasks = state?.tasks || [];
  
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

  const topTasks = sortedTasks.slice(0, 5);

  const getDeadlineStatus = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);
    
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'soon';
    return 'future';
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return { border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/10', dot: 'bg-red-500' };
      case 'medium':
        return { border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', dot: 'bg-amber-500' };
      default:
        return { border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', dot: 'bg-blue-500' };
    }
  };

  const completeTask = (taskId) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: 'completed' } : t
    );
    updateState({ ...state, tasks: updatedTasks });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <ListTodo size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Priority Tasks</h3>
            <p className="text-xs text-slate-500">{pendingTasks.length} pending</p>
          </div>
        </div>
        <Link 
          to="/tasks" 
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
        >
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Tasks List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-2"
      >
        <AnimatePresence mode="popLayout">
          {topTasks.length > 0 ? (
            topTasks.map((task) => {
              const deadlineStatus = getDeadlineStatus(task.dueDate);
              const priorityStyles = getPriorityStyles(task.priority);
              
              return (
                <motion.div 
                  key={task.id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  className={clsx(
                    "group relative p-4 rounded-xl border-l-4 transition-all cursor-default",
                    "bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800",
                    "border border-slate-100 dark:border-slate-700/50",
                    priorityStyles.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => completeTask(task.id)}
                      className={clsx(
                        "shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5",
                        "transition-colors duration-200",
                        "border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500",
                        "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      )}
                    >
                      <Check size={12} className="text-transparent group-hover:text-emerald-500 transition-colors" />
                    </motion.button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "text-sm font-semibold truncate",
                        task.priority === 'high' 
                          ? "text-slate-900 dark:text-white" 
                          : "text-slate-700 dark:text-slate-300"
                      )}>
                        {task.title}
                      </p>
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Priority Badge */}
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          task.priority === 'high' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                          task.priority === 'medium' && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                          task.priority === 'low' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                          {task.priority}
                        </span>

                        {/* Due Date */}
                        {task.dueDate && (
                          <span className={clsx(
                            "flex items-center gap-1 text-[10px] font-medium",
                            deadlineStatus === 'overdue' && "text-red-500",
                            deadlineStatus === 'today' && "text-orange-500",
                            deadlineStatus === 'soon' && "text-amber-500",
                            deadlineStatus === 'future' && "text-slate-400"
                          )}>
                            {deadlineStatus === 'overdue' && <AlertCircle size={10} />}
                            {deadlineStatus === 'today' && <Clock size={10} />}
                            {deadlineStatus === 'overdue' ? 'Overdue' :
                             deadlineStatus === 'today' ? 'Today' :
                             new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-40 text-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-3"
              >
                <Check size={28} className="text-emerald-500" />
              </motion.div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending tasks</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DashboardTasks;
