import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, Trash2, Flame, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { format, eachDayOfInterval, subDays, isSameDay, startOfDay } from 'date-fns';

const HabitTrackerPage = () => {
  const { state, updateSection } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', color: '#3B82F6' });

  const habits = state.habits || [];
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.name) return;

    const updatedHabits = [
      ...habits,
      { 
        id: Date.now().toString(), 
        name: newHabit.name, 
        color: newHabit.color, 
        history: {} 
      }
    ];

    updateSection('habits', updatedHabits);
    setNewHabit({ name: '', color: '#3B82F6' });
    setIsModalOpen(false);
  };

  const toggleHabit = (habitId) => {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    const isCompleted = habit.history[today];

    const updatedHistory = { ...habit.history };
    if (isCompleted) {
      delete updatedHistory[today];
    } else {
      updatedHistory[today] = true;
    }

    const updatedHabits = [...habits];
    updatedHabits[habitIndex] = { ...habit, history: updatedHistory };

    updateSection('habits', updatedHabits);
  };

  const handleDeleteHabit = (id) => {
    if (window.confirm('Delete this habit?')) {
      const updatedHabits = habits.filter(h => h.id !== id);
      updateSection('habits', updatedHabits);
    }
  };

  const calculateStreak = (history) => {
    let streak = 0;
    const todayDate = new Date();
    // Check yesterday first, or today if completed
    let checkDate = history[today] ? todayDate : subDays(todayDate, 1);
    
    while (history[format(checkDate, 'yyyy-MM-dd')]) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
    return streak;
  };

  // Heatmap Logic (Last 14 days)
  const heatmapDays = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date()
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Habit Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Build better routines, one day at a time.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          New Habit
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {habits.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Flame size={48} className="mx-auto mb-4 opacity-50" />
            <p>No habits tracked yet. Start small!</p>
          </div>
        ) : (
          habits.map(habit => {
            const streak = calculateStreak(habit.history);
            const isDoneToday = !!habit.history[today];

            return (
              <div key={habit.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                {/* Left: Toggle & Info */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                      isDoneToday 
                        ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-105" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <Check size={24} strokeWidth={3} />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{habit.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <Flame size={14} className={streak > 0 ? "text-orange-500" : "text-slate-400"} />
                      <span>{streak} day streak</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Heatmap */}
                <div className="flex gap-1">
                  {heatmapDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDone = !!habit.history[dateStr];
                    return (
                      <div 
                        key={dateStr}
                        className={clsx(
                          "w-3 h-8 rounded-full transition-colors",
                          isDone ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-800",
                          isSameDay(day, new Date()) && "ring-1 ring-slate-400 dark:ring-slate-500"
                        )}
                        title={dateStr}
                      />
                    );
                  })}
                </div>

                {/* Right: Actions */}
                <button 
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Habit</h2>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Habit Name</label>
                <input 
                  type="text" 
                  required
                  value={newHabit.name}
                  onChange={e => setNewHabit({...newHabit, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Read 30 mins"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTrackerPage;
