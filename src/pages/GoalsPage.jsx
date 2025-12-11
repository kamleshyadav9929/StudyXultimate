import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, Target, Clock, AlertCircle, Trophy, Flag, MoreHorizontal, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

const GoalsPage = () => {
  const { state, updateSection } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', date: '', type: 'exam', startDate: new Date().toISOString() });

  const goals = state.goals || [];

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.date) return;

    const goal = {
      id: uuidv4(),
      name: newGoal.name,
      date: new Date(newGoal.date).toISOString(),
      startDate: new Date().toISOString(), // Track creation time for progress
      type: newGoal.type
    };

    updateSection('goals', [...goals, goal]);
    setNewGoal({ name: '', date: '', type: 'exam', startDate: new Date().toISOString() });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    updateSection('goals', goals.filter(g => g.id !== id));
  };

  const getDaysLeft = (dateString) => {
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const getProgress = (startDate, endDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return ((now - start) / (end - start)) * 100;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <header className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl text-white">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none mix-blend-screen animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-bold uppercase tracking-wider mb-4">
              <Trophy size={12} className="text-yellow-300" />
              Goal Crusher Mode
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Goals & Deadlines</h1>
            <p className="text-blue-100/90 text-lg font-medium max-w-lg">
              "The trouble is, you think you have time." — Jack Kornfield
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="group px-6 py-3 bg-white text-blue-900 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} className="text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
            Add Goal
          </button>
        </div>
      </header>

      {/* Adding Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                   <Target size={24} />
                 </div>
                 Add New Goal
               </h2>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Goal Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Calculus Midterm"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-['Inter']"
                    autoFocus
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Deadline</label>
                    <input
                      type="date"
                      value={newGoal.date}
                      onChange={(e) => setNewGoal({ ...newGoal, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                    <div className="relative">
                      <select
                        value={newGoal.type}
                        onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="project">Project</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            <div className="flex gap-4 pt-8">
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                  onClick={handleAddGoal}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Goal
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length > 0 ? (
          goals.sort((a, b) => new Date(a.date) - new Date(b.date)).map((goal) => {
            const daysLeft = getDaysLeft(goal.date);
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;
            const isPast = daysLeft < 0;
            const progress = getProgress(goal.startDate || new Date().toISOString(), goal.date);
            
            // Urgency Colors
            const themeColor = isPast ? 'slate' : isUrgent ? 'red' : daysLeft <= 7 ? 'amber' : 'blue';
            
            const cardStyles = {
              slate: "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
              red: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30 shadow-red-500/10",
              amber: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30 shadow-amber-500/10",
              blue: "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-blue-500/5"
            };

            const badgeStyles = {
              slate: "bg-slate-200 text-slate-600",
              red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 animate-pulse",
              amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
              blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            };

            return (
              <div 
                key={goal.id} 
                className={clsx(
                  "group relative p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                  cardStyles[themeColor]
                )}
              > 
                {/* Background Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1.5 bg-slate-200 dark:bg-slate-800 w-full">
                   <div 
                     className={clsx("h-full transition-all duration-1000", 
                        themeColor === 'red' ? 'bg-red-500' : themeColor === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                     )} 
                     style={{ width: `${Math.min(100, progress)}%` }} 
                   />
                </div>

                <div className="flex justify-between items-start mb-6">
                   <div className={clsx("p-3 rounded-2xl", badgeStyles[themeColor].split(' ')[0])}>
                     <Target size={24} className={badgeStyles[themeColor].split(' ')[1]} />
                   </div>
                   <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{goal.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar size={14} />
                    {new Date(goal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", badgeStyles[themeColor])}>
                     {isPast ? "Past Due" : `${daysLeft} days left`}
                   </div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{goal.type}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
               <Flag size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-medium">No goals set yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
