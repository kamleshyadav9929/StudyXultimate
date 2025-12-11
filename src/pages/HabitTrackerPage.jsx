import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, Trash2, Flame, Calendar as CalendarIcon, Trophy, Zap, TrendingUp, X } from 'lucide-react';
import { clsx } from 'clsx';
import { format, eachDayOfInterval, subDays, isSameDay, startOfDay } from 'date-fns';

const HabitTrackerPage = () => {
  const { state, updateSection } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', color: '#3B82F6', icon: 'zap' });

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
    setNewHabit({ name: '', color: '#3B82F6', icon: 'zap' });
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Premium Header */}
      <header className="relative bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 overflow-hidden shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-orange-500/20 rounded-full blur-[60px] md:blur-[100px] -mr-10 md:-mr-20 -mt-10 md:-mt-20 pointer-events-none mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[150px] md:w-[300px] h-[150px] md:h-[300px] bg-red-500/20 rounded-full blur-[50px] md:blur-[80px] -ml-5 md:-ml-10 -mb-5 md:-mb-10 pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-200 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 md:mb-4">
              <Flame size={12} className="animate-pulse" />
              Momentum Builder
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Habit Tracker</h1>
            <p className="text-orange-100/80 text-sm md:text-lg font-medium max-w-lg leading-relaxed">
              Consistency is key. Keep your fire burning! 🔥
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto group px-6 py-3 bg-white text-slate-900 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} className="text-orange-500 group-hover:rotate-90 transition-transform duration-300" />
            New Habit
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {habits.length === 0 ? (
          <div className="py-12 md:py-20 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 md:mb-6">
               <Flame size={32} className="text-slate-300 dark:text-slate-600 md:hidden" />
               <Flame size={48} className="text-slate-300 dark:text-slate-600 hidden md:block" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">No habits yet</h3>
            <p className="max-w-xs mx-auto text-sm md:text-base">Start small. Add a habit you want to build today.</p>
          </div>
        ) : (
          habits.map(habit => {
            const streak = calculateStreak(habit.history);
            const isDoneToday = !!habit.history[today];
            
            // Gamification: Streak Levels
            const streakLevel = streak > 21 ? 'legendary' : streak > 7 ? 'fire' : 'spark';
            const flameColor = streakLevel === 'legendary' ? 'text-purple-500' : streakLevel === 'fire' ? 'text-orange-500' : 'text-slate-400';
            const flameSize = streakLevel === 'legendary' ? 32 : streakLevel === 'fire' ? 24 : 20;

            return (
              <div key={habit.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all duration-300">
                <div className="flex flex-col xl:flex-row xl:items-center gap-4 md:gap-8">
                  
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-4 md:gap-6 flex-1">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={clsx(
                        "w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg group-hover:scale-105 active:scale-95 relative overflow-hidden shrink-0",
                        isDoneToday 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <div className={clsx("absolute inset-0 bg-white/20 transition-transform duration-500", isDoneToday ? "translate-y-full" : "translate-y-0")} />
                      <Check size={24} strokeWidth={4} className={clsx("transition-transform duration-300 md:hidden", isDoneToday ? "scale-100" : "scale-75 opacity-50")} />
                      <Check size={36} strokeWidth={4} className={clsx("transition-transform duration-300 hidden md:block", isDoneToday ? "scale-100" : "scale-75 opacity-50")} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white truncate">{habit.name}</h3>
                        {streak > 3 && (
                          <div className={clsx("px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide border", 
                            streakLevel === 'legendary' ? "bg-purple-100 text-purple-600 border-purple-200" : "bg-orange-100 text-orange-600 border-orange-200"
                          )}>
                             {streakLevel}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                        <Flame size={16} className={clsx("transition-all duration-500 md:w-5 md:h-5", flameColor, streak > 0 && "animate-pulse")} fill={streak > 0 ? "currentColor" : "none"} />
                        <span className={clsx("text-base md:text-lg", streak > 0 && "text-slate-900 dark:text-white font-bold")}>{streak}</span>
                        <span className="text-xs md:text-sm opacity-80">day streak</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Heatmap & Actions */}
                  <div className="flex flex-row items-center justify-between xl:justify-end gap-4 md:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50">
                    <div className="flex gap-1.5 md:gap-2 p-2 md:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-x-auto no-scrollbar max-w-[220px] md:max-w-none">
                      {heatmapDays.map((day, idx) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isDone = !!habit.history[dateStr];
                        return (
                          <div 
                            key={dateStr}
                            className="group/day relative flex flex-col items-center gap-1 shrink-0"
                          >
                             <div 
                              className={clsx(
                                "w-2.5 h-8 md:w-4 md:h-12 rounded-full transition-all duration-500",
                                isDone 
                                  ? "bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30" 
                                  : "bg-slate-200 dark:bg-slate-700",
                                isSameDay(day, new Date()) && !isDone && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 animate-pulse"
                              )}
                            />
                            {/* Tooltip */}
                            <div className="hidden md:block absolute bottom-full mb-2 opacity-0 group-hover/day:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                              {format(day, 'MMM d')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      title="Delete Habit"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="flex justify-between items-center mb-6 md:mb-8">
               <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                   <Zap size={24} />
                 </div>
                 New Habit
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X size={24} className="text-slate-400" />
               </button>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Name your goal</label>
                <input 
                  type="text" 
                  required
                  value={newHabit.name}
                  onChange={e => setNewHabit({...newHabit, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 font-['Inter']"
                  placeholder="e.g. Read 30 mins, Drink Water..."
                  autoFocus
                />
              </div>

               {/* Pre-defined Suggestions (Optional polish) */}
               <div className="flex flex-wrap gap-2">
                 {['Drink Water', 'Exercise', 'Read', 'Meditate'].map(suggestion => (
                   <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNewHabit({...newHabit, name: suggestion})}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                   >
                     {suggestion}
                   </button>
                 ))}
               </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
