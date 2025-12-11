import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

const GoalsWidget = ({ goals = [] }) => {
  const [timeLeft, setTimeLeft] = useState({});

  // Filter and sort goals by deadline
  const upcomingGoals = React.useMemo(() => {
    return goals
      .filter(goal => {
        const diff = new Date(goal.date) - new Date();
        return diff > -86400000; // Show goals from yesterday onwards
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [goals]);

  useEffect(() => {
    const calculateTimeLeft = (date) => {
      const now = new Date();
      const target = new Date(date);
      const difference = target - now;
      
      if (difference <= 0) return { expired: true };
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        expired: false
      };
    };

    const updateTimers = () => {
      const newTimeLeft = {};
      upcomingGoals.forEach(goal => {
        newTimeLeft[goal.id] = calculateTimeLeft(goal.date);
      });
      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const timer = setInterval(updateTimers, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [upcomingGoals]);

  const getUrgencyColor = (time) => {
    if (!time || time.expired) return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500', border: 'border-slate-200 dark:border-slate-700' };
    if (time.days <= 1) return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
    if (time.days <= 3) return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    if (time.days <= 7) return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' };
    return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
  };

  const formatTimeLeft = (time) => {
    if (!time || time.expired) return 'Expired';
    if (time.days > 0) return `${time.days}d ${time.hours}h`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
    return `${time.minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Target size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
            <p className="text-xs text-slate-500">{upcomingGoals.length} active goals</p>
          </div>
        </div>
        <Link 
          to="/goals" 
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <AnimatePresence>
          {upcomingGoals.length > 0 ? (
            upcomingGoals.map((goal, index) => {
              const time = timeLeft[goal.id];
              const urgency = getUrgencyColor(time);
              const isUrgent = time && !time.expired && time.days <= 1;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={clsx(
                    "relative p-4 rounded-xl border transition-all",
                    urgency.bg,
                    urgency.border,
                    isUrgent && "animate-pulse-soft"
                  )}
                >
                  {/* Urgent Indicator */}
                  {isUrgent && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -top-1 -right-1"
                    >
                      <AlertTriangle size={16} className="text-red-500 fill-red-100" />
                    </motion.div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {goal.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">
                          {new Date(goal.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: new Date(goal.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold",
                      urgency.text,
                      isUrgent ? "bg-red-100 dark:bg-red-900/40" : "bg-white/50 dark:bg-slate-800/50"
                    )}>
                      <Clock size={14} />
                      {formatTimeLeft(time)}
                    </div>
                  </div>

                  {/* Progress indicator if available */}
                  {goal.progress !== undefined && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-white/50 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={clsx(
                            "h-full rounded-full",
                            time?.days <= 1 ? "bg-red-500" : time?.days <= 3 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Target size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-400">No upcoming deadlines</p>
              <Link to="/goals" className="text-xs text-purple-600 hover:underline mt-1 inline-block">
                Set a new goal
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GoalsWidget;
