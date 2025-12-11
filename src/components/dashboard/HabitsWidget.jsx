import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useApp } from '../../context/AppContext';

const HabitsWidget = () => {
  const { state, updateState } = useApp();
  const habits = state?.habits || {};
  const habitList = Object.values(habits).slice(0, 4); // Show max 4 habits

  const [checkedToday, setCheckedToday] = useState({});
  
  const today = new Date().toISOString().split('T')[0];
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    const allCompletedDates = new Set();
    
    Object.values(habits).forEach(habit => {
      (habit.completedDates || []).forEach(date => allCompletedDates.add(date));
    });

    const dates = Array.from(allCompletedDates).sort().reverse();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (dates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Get last 7 days for the grid
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        isToday: i === 0
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Check if habit was completed on a date
  const isHabitCompleted = (habit, date) => {
    return (habit.completedDates || []).includes(date);
  };

  // Check if any habit was completed on a date
  const hasActivityOnDate = (date) => {
    return habitList.some(habit => isHabitCompleted(habit, date));
  };

  // Toggle habit completion for today
  const toggleHabitToday = (habitId) => {
    const habit = habits[habitId];
    if (!habit) return;

    const completedDates = habit.completedDates || [];
    const isCompleted = completedDates.includes(today);
    
    const newCompletedDates = isCompleted
      ? completedDates.filter(d => d !== today)
      : [...completedDates, today];

    const newHabits = {
      ...habits,
      [habitId]: {
        ...habit,
        completedDates: newCompletedDates
      }
    };

    updateState({ ...state, habits: newHabits });
  };

  const completedToday = habitList.filter(h => isHabitCompleted(h, today)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 relative">
            <Flame size={18} className="text-orange-500" />
            {streak > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {streak}
              </motion.span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Daily Habits</h3>
            <p className="text-xs text-slate-500">{completedToday}/{habitList.length} completed today</p>
          </div>
        </div>
        <Link 
          to="/habits" 
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Week Activity Grid */}
      <div className="flex items-center justify-between mb-4 px-2">
        {last7Days.map((day, idx) => {
          const hasActivity = hasActivityOnDate(day.date);
          return (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className={clsx(
                "text-[10px] font-medium uppercase",
                day.isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
              )}>
                {day.day}
              </span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={clsx(
                  "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                  hasActivity 
                    ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/30" 
                    : "bg-slate-100 dark:bg-slate-800",
                  day.isToday && !hasActivity && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900"
                )}
              >
                {hasActivity && <Zap size={12} className="text-white" />}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Habit Checklist */}
      <div className="space-y-2">
        {habitList.length > 0 ? (
          habitList.map((habit, index) => {
            const isCompleted = isHabitCompleted(habit, today);
            return (
              <motion.button
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => toggleHabitToday(habit.id)}
                className={clsx(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  isCompleted && "bg-emerald-50 dark:bg-emerald-900/20"
                )}
              >
                <motion.div
                  animate={{ scale: isCompleted ? [1, 1.2, 1] : 1 }}
                  className={clsx(
                    "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors",
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500" 
                      : "border-slate-300 dark:border-slate-700"
                  )}
                >
                  <AnimatePresence>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                <span className={clsx(
                  "flex-1 text-sm font-medium text-left transition-colors",
                  isCompleted 
                    ? "text-emerald-700 dark:text-emerald-400 line-through" 
                    : "text-slate-700 dark:text-slate-300"
                )}>
                  {habit.name}
                </span>

                {habit.streak > 0 && (
                  <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                    <Flame size={12} />
                    {habit.streak}
                  </span>
                )}
              </motion.button>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p className="text-sm">No habits tracked yet</p>
            <Link to="/habits" className="text-xs text-blue-600 hover:underline">Add your first habit</Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HabitsWidget;
