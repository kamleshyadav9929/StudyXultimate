import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, Upload, Timer, FolderPlus, Link as LinkIcon, Activity, BrainCircuit, FileQuestion, ListTodo } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "Add Note", icon: Plus, color: "bg-blue-500", onClick: () => navigate('/subjects') },
    { label: "Attendance", icon: CheckCircle, color: "bg-emerald-500", onClick: () => navigate('/attendance') },
    { label: "PYQ Tracker", icon: FileQuestion, color: "bg-amber-500", onClick: () => navigate('/pyq') },
    { label: "Syllabus", icon: ListTodo, color: "bg-indigo-500", onClick: () => navigate('/syllabus') },
    { label: "Upload File", icon: Upload, color: "bg-purple-500", onClick: () => navigate('/files') },
    { label: "Start Timer", icon: Timer, color: "bg-orange-500", onClick: () => navigate('/schedule') },
    { label: "Add Resource", icon: LinkIcon, color: "bg-cyan-500", onClick: () => navigate('/resources') },
    { label: "Track Habit", icon: Activity, color: "bg-rose-500", onClick: () => navigate('/habits') },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {actions.map((action, index) => (
          <button 
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-2 md:p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl border border-slate-200 dark:border-slate-700/30 group hover:shadow-md ${index >= 8 ? 'hidden md:flex' : 'flex'}`}
          >
            <div className={`p-2 md:p-3 rounded-xl ${action.color} text-white mb-2 md:mb-3 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
              <action.icon size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
