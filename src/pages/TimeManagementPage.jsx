import React from 'react';
import { useApp } from '../context/AppContext';
import PomodoroTimer from '../components/time/PomodoroTimer';
import TodoList from '../components/time/TodoList';
import Timetable from '../components/time/Timetable';

const TimeManagementPage = () => {
  const { state, loading, updateSection } = useApp();

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  const handleSessionComplete = (minutes) => {
    // Update study stats
    const currentStats = state.dashboard.stats;
    const newStats = {
      ...currentStats,
      studyMinutesToday: currentStats.studyMinutesToday + minutes
    };
    updateSection('dashboard', { ...state.dashboard, stats: newStats });
  };

  const handleUpdateTasks = (newTasks) => {
    updateSection('tasks', newTasks);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Time Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Master your schedule and stay productive.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timer & Tasks */}
        <div className="space-y-6">
          <PomodoroTimer onSessionComplete={handleSessionComplete} />
          <div className="h-[400px]">
            <TodoList tasks={state.tasks || []} onUpdate={handleUpdateTasks} />
          </div>
        </div>

        {/* Right Column: Timetable */}
        <div className="lg:col-span-2">
          <Timetable 
            timetable={state.timetable || {}} 
            onUpdate={(newTimetable) => updateSection('timetable', newTimetable)}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeManagementPage;
