import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, Target, Clock, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const GoalsPage = () => {
  const { state, updateSection } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', date: '', type: 'exam' });

  const goals = state.goals || [];

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.date) return;

    const goal = {
      id: uuidv4(),
      name: newGoal.name,
      date: new Date(newGoal.date).toISOString(),
      type: newGoal.type
    };

    updateSection('goals', [...goals, goal]);
    setNewGoal({ name: '', date: '', type: 'exam' });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    updateSection('goals', goals.filter(g => g.id !== id));
  };

  const getDaysLeft = (dateString) => {
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Goals & Deadlines</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your exams, submissions, and milestones.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </header>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Goal Name (e.g. DBMS Exam)"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={newGoal.date}
              onChange={(e) => setNewGoal({ ...newGoal, date: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <select
              value={newGoal.type}
              onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddGoal}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length > 0 ? (
          goals.sort((a, b) => new Date(a.date) - new Date(b.date)).map((goal) => {
            const daysLeft = getDaysLeft(goal.date);
            const isUrgent = daysLeft <= 5 && daysLeft >= 0;
            const isPast = daysLeft < 0;

            return (
              <div 
                key={goal.id} 
                className={`
                  relative p-6 rounded-2xl border transition-all hover:shadow-lg
                  ${isUrgent 
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' 
                    : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${isUrgent ? 'bg-red-500 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                    <Target size={24} />
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{goal.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(goal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>

                <div className="flex items-center gap-2">
                  {isPast ? (
                    <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
                      Past Due
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${isUrgent ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                      <Clock size={14} />
                      {daysLeft} Days Left
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm capitalize">
                    {goal.type}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Target size={48} className="mx-auto mb-3 opacity-20" />
            <p>No goals set yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
