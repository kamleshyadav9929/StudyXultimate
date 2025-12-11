import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Target, 
  Clock, 
  AlertCircle,
  Check,
  LayoutList,
  Kanban,
  CalendarDays,
  Grid3X3,
  ArrowUpDown,
  ChevronRight,
  CheckCircle2,
  Edit3,
  X,
  TrendingUp
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

// View mode options
const VIEW_MODES = {
  LIST: 'list',
  KANBAN: 'kanban',
  MATRIX: 'matrix'
};

// Helper function to get color classes
const getColorClasses = (color, variant = 'default') => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500',
      bgLight: 'bg-blue-500/10',
      bgLighter: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-500',
      textDark: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-500/30',
      selected: 'bg-blue-500 text-white shadow-lg',
      unselected: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
    },
    purple: {
      bg: 'bg-purple-500',
      bgLight: 'bg-purple-500/10',
      bgLighter: 'bg-purple-50 dark:bg-purple-500/10',
      text: 'text-purple-500',
      textDark: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-500/30',
      selected: 'bg-purple-500 text-white shadow-lg',
      unselected: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20'
    },
    green: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-500/10',
      bgLighter: 'bg-green-50 dark:bg-green-500/10',
      text: 'text-green-500',
      textDark: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-500/30',
      selected: 'bg-green-500 text-white shadow-lg',
      unselected: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20'
    },
    red: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-500/10',
      bgLighter: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-500',
      textDark: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-500/30',
      selected: 'bg-red-500 text-white shadow-lg',
      unselected: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
    },
    orange: {
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-500/10',
      bgLighter: 'bg-orange-50 dark:bg-orange-500/10',
      text: 'text-orange-500',
      textDark: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-500/30',
      selected: 'bg-orange-500 text-white shadow-lg',
      unselected: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20'
    },
    yellow: {
      bg: 'bg-yellow-500',
      bgLight: 'bg-yellow-500/10',
      bgLighter: 'bg-yellow-50 dark:bg-yellow-500/10',
      text: 'text-yellow-500',
      textDark: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-500/30',
      selected: 'bg-yellow-500 text-white shadow-lg',
      unselected: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-500/20'
    },
    slate: {
      bg: 'bg-slate-500',
      bgLight: 'bg-slate-500/10',
      bgLighter: 'bg-slate-50 dark:bg-slate-500/10',
      text: 'text-slate-500',
      textDark: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-500/30',
      selected: 'bg-slate-500 text-white shadow-lg',
      unselected: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-500/20'
    },
    emerald: {
      bg: 'bg-emerald-500',
      bgLight: 'bg-emerald-500/10',
      bgLighter: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-500',
      textDark: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      selected: 'bg-emerald-500 text-white shadow-lg',
      unselected: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
    }
  };
  return colorMap[color] || colorMap.blue;
};

// Task categories
const CATEGORIES = [
  { id: 'study', label: 'Study', color: 'blue', icon: '📚' },
  { id: 'assignment', label: 'Assignment', color: 'purple', icon: '📝' },
  { id: 'project', label: 'Project', color: 'green', icon: '🚀' },
  { id: 'exam', label: 'Exam', color: 'red', icon: '📋' },
  { id: 'personal', label: 'Personal', color: 'orange', icon: '✨' }
];

// Priority levels
const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: 'red', weight: 4 },
  { id: 'high', label: 'High', color: 'orange', weight: 3 },
  { id: 'medium', label: 'Medium', color: 'yellow', weight: 2 },
  { id: 'low', label: 'Low', color: 'blue', weight: 1 }
];

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, colorType, trend }) => {
  const iconBgClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500'
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-all hover:shadow-lg hover:scale-[1.02]">
      <div className="relative">
        <div className={clsx("inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3", iconBgClasses[colorType] || iconBgClasses.blue)}>
          <Icon size={24} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
          {trend && (
            <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 100, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(progress)}%</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">Done</span>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onToggle, onDelete, onEdit, compact = false }) => {
  const getDeadlineStatus = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 2) return 'soon';
    return 'future';
  };

  const deadlineStatus = getDeadlineStatus(task.dueDate);
  const category = CATEGORIES.find(c => c.id === task.category);
  const priority = PRIORITIES.find(p => p.id === task.priority);
  const isCompleted = task.status === 'completed';

  const categoryColors = getColorClasses(category?.color || 'blue');
  const priorityColors = getColorClasses(priority?.color || 'yellow');

  return (
    <div 
      className={clsx(
        "group relative p-4 rounded-xl border transition-all duration-200",
        isCompleted 
          ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60" 
          : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-blue-500/30 hover:shadow-lg",
        deadlineStatus === 'overdue' && !isCompleted && "border-red-500/50 bg-red-50/50 dark:bg-red-500/5",
        deadlineStatus === 'today' && !isCompleted && "border-orange-500/50 bg-orange-50/50 dark:bg-orange-500/5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={clsx(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400"
          )}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={clsx(
              "font-semibold transition-all",
              isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-white"
            )}>
              {task.title}
            </h4>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(task)}
                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={() => onDelete(task.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {task.description && !compact && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {/* Category */}
            {category && (
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", categoryColors.bgLight, categoryColors.textDark)}>
                {category.icon} {category.label}
              </span>
            )}

            {/* Priority */}
            {priority && (
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", priorityColors.bgLight, priorityColors.textDark)}>
                {priority.label}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span className={clsx(
                "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1",
                deadlineStatus === 'overdue' && !isCompleted ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                deadlineStatus === 'today' && !isCompleted ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                deadlineStatus === 'soon' && !isCompleted ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}>
                {deadlineStatus === 'overdue' ? <AlertCircle size={10} /> : 
                 deadlineStatus === 'today' ? <Clock size={10} /> : 
                 <Calendar size={10} />}
                {deadlineStatus === 'overdue' ? 'Overdue' : 
                 deadlineStatus === 'today' ? 'Today' : 
                 new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Goal Card Component
const GoalCard = ({ goal, onDelete, daysLeft, isUrgent, isPast }) => (
  <div 
    className={clsx(
      "relative p-5 rounded-2xl border transition-all hover:shadow-lg group overflow-hidden",
      isUrgent 
        ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 border-red-200 dark:border-red-500/30' 
        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
    )}
  >
    {/* Decorative gradient */}
    <div className={clsx("absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-20", isUrgent ? 'bg-red-500' : 'bg-blue-500')} />
    
    <div className="relative">
      <div className="flex justify-between items-start mb-4">
        <div className={clsx(
          "p-3 rounded-xl",
          isUrgent ? 'bg-red-500 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        )}>
          <Target size={24} />
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{goal.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <Calendar size={14} />
        {new Date(goal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {isPast ? (
          <span className="px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
            Past Due
          </span>
        ) : (
          <span className={clsx(
            "px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5",
            isUrgent ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
          )}>
            <Clock size={14} />
            {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
          </span>
        )}
        <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm capitalize font-medium">
          {goal.type}
        </span>
      </div>
    </div>
  </div>
);

// Add Task Modal
const AddTaskModal = ({ isOpen, onClose, onSave, editingTask }) => {
  const [form, setForm] = useState(editingTask || {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'study',
    status: 'pending'
  });

  React.useEffect(() => {
    if (editingTask) {
      setForm(editingTask);
    } else {
      setForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: 'study',
        status: 'pending'
      });
    }
  }, [editingTask, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    
    onSave({
      ...form,
      id: editingTask?.id || uuidv4(),
      createdAt: editingTask?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const colors = getColorClasses(cat.color);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={clsx(
                      "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      form.category === cat.id ? colors.selected : colors.unselected
                    )}
                  >
                    {cat.icon} {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Goal Modal
const AddGoalModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', date: '', type: 'exam' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    
    onSave({
      id: uuidv4(),
      name: form.name,
      date: new Date(form.date).toISOString(),
      type: form.type
    });
    setForm({ name: '', date: '', type: 'exam' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Goal</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Goal Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., DBMS Final Exam"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="exam">📋 Exam</option>
              <option value="assignment">📝 Assignment</option>
              <option value="project">🚀 Project</option>
              <option value="other">✨ Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ title, tasks, onToggle, onDelete, onEdit, colorType }) => {
  const columnStyles = {
    slate: 'text-slate-600 dark:text-slate-400',
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400'
  };
  
  const dotStyles = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="flex-1 min-w-[280px] bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={clsx("font-semibold flex items-center gap-2", columnStyles[colorType])}>
          <span className={clsx("w-3 h-3 rounded-full", dotStyles[colorType])}></span>
          {title}
        </h3>
        <span className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded-full text-slate-500 dark:text-slate-400 font-medium">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggle={onToggle} 
            onDelete={onDelete} 
            onEdit={onEdit}
            compact 
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

// Priority Matrix Component
const PriorityMatrix = ({ tasks, onToggle, onDelete, onEdit }) => {
  const getTasksForQuadrant = (urgent, important) => {
    return tasks.filter(t => {
      const isUrgent = t.priority === 'urgent' || t.priority === 'high';
      const isImportant = t.category === 'exam' || t.category === 'assignment' || t.category === 'project';
      
      if (urgent && important) return isUrgent && isImportant;
      if (urgent && !important) return isUrgent && !isImportant;
      if (!urgent && important) return !isUrgent && isImportant;
      return !isUrgent && !isImportant;
    });
  };

  const quadrants = [
    { urgent: true, important: true, title: 'Do First', subtitle: 'Urgent & Important', colorClass: 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5', titleClass: 'text-red-700 dark:text-red-400', icon: '🔥' },
    { urgent: false, important: true, title: 'Schedule', subtitle: 'Important, Not Urgent', colorClass: 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5', titleClass: 'text-blue-700 dark:text-blue-400', icon: '📅' },
    { urgent: true, important: false, title: 'Delegate', subtitle: 'Urgent, Not Important', colorClass: 'border-yellow-200 dark:border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5', titleClass: 'text-yellow-700 dark:text-yellow-400', icon: '⚡' },
    { urgent: false, important: false, title: 'Eliminate', subtitle: 'Not Urgent or Important', colorClass: 'border-slate-200 dark:border-slate-500/30 bg-slate-50/50 dark:bg-slate-500/5', titleClass: 'text-slate-700 dark:text-slate-400', icon: '🗑️' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((q, i) => (
        <div 
          key={i} 
          className={clsx("p-5 rounded-2xl border-2 min-h-[200px]", q.colorClass)}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{q.icon}</span>
            <div>
              <h4 className={clsx("font-bold", q.titleClass)}>{q.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{q.subtitle}</p>
            </div>
          </div>
          <div className="space-y-2">
            {getTasksForQuadrant(q.urgent, q.important).map(task => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} compact />
            ))}
            {getTasksForQuadrant(q.urgent, q.important).length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No tasks</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ tasks, goals }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getItemsForDate = (date) => {
    if (!date) return { tasks: [], goals: [] };
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const dayGoals = goals.filter(g => g.date && g.date.split('T')[0] === dateStr);
    
    return { tasks: dayTasks, goals: dayGoals };
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="rotate-180 text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const items = getItemsForDate(date);
          
          return (
            <div 
              key={i} 
              className={clsx(
                "min-h-[80px] p-2 rounded-xl transition-colors",
                date ? "hover:bg-slate-50 dark:hover:bg-slate-800/50" : "",
                isToday(date) && "bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500"
              )}
            >
              {date && (
                <>
                  <span className={clsx(
                    "text-sm font-medium",
                    isToday(date) ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {items.tasks.slice(0, 2).map(task => (
                      <div 
                        key={task.id} 
                        className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                    {items.goals.map(goal => (
                      <div 
                        key={goal.id} 
                        className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 truncate"
                      >
                        🎯 {goal.name}
                      </div>
                    ))}
                    {items.tasks.length > 2 && (
                      <span className="text-xs text-slate-400">+{items.tasks.length - 2} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Component
const TasksDeadlinesPage = () => {
  const { state, updateSection } = useApp();
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [activeTab, setActiveTab] = useState('tasks');

  const tasks = state.tasks || [];
  const goals = state.goals || [];

  // Stats calculations
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date(new Date().toDateString());
    }).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, pending, overdue, progress };
  }, [tasks]);

  // Task handlers
  const handleSaveTask = (task) => {
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      const updated = [...tasks];
      updated[existingIndex] = task;
      updateSection('tasks', updated);
    } else {
      updateSection('tasks', [...tasks, task]);
    }
    setEditingTask(null);
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    );
    updateSection('tasks', updated);
  };

  const handleDeleteTask = (id) => {
    updateSection('tasks', tasks.filter(t => t.id !== id));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowAddTask(true);
  };

  // Goal handlers
  const handleSaveGoal = (goal) => {
    updateSection('goals', [...goals, goal]);
  };

  const handleDeleteGoal = (id) => {
    updateSection('goals', goals.filter(g => g.id !== id));
  };

  const getDaysLeft = (dateString) => {
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    if (filter === 'pending') result = result.filter(t => t.status === 'pending');
    if (filter === 'completed') result = result.filter(t => t.status === 'completed');
    if (filter === 'overdue') result = result.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date(new Date().toDateString());
    });
    if (filter === 'today') result = result.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate === new Date().toISOString().split('T')[0];
    });

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      } else {
        const dateA = a.dueDate || '9999-12-31';
        const dateB = b.dueDate || '9999-12-31';
        return dateA.localeCompare(dateB);
      }
    });

    return result;
  }, [tasks, filter, sortBy]);

  // Sorted goals
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [goals]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <Target size={28} />
            </span>
            Tasks & Deadlines
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Stay organized and never miss a deadline. Track your tasks, assignments, and goals all in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl transition-colors font-medium"
          >
            <Target size={18} />
            Add Goal
          </button>
          <button
            onClick={() => { setEditingTask(null); setShowAddTask(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-blue-500/25"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={LayoutList} label="Total Tasks" value={stats.total} colorType="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} colorType="emerald" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} colorType="yellow" />
        <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} colorType="red" />
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-center">
          <ProgressRing progress={stats.progress} />
        </div>
      </div>

      {/* Tabs & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
              activeTab === 'tasks' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <LayoutList size={16} />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
              activeTab === 'goals' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <Target size={16} />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
              activeTab === 'calendar' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <CalendarDays size={16} />
            Calendar
          </button>
        </div>

        {/* View Mode & Filters (only for tasks tab) */}
        {activeTab === 'tasks' && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {[
                { mode: VIEW_MODES.LIST, icon: LayoutList, label: 'List' },
                { mode: VIEW_MODES.KANBAN, icon: Kanban, label: 'Kanban' },
                { mode: VIEW_MODES.MATRIX, icon: Grid3X3, label: 'Matrix' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    "p-2 rounded-lg transition-all",
                    viewMode === mode 
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title={label}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="today">Due Today</option>
              <option value="overdue">Overdue</option>
            </select>

            {/* Sort */}
            <button
              onClick={() => setSortBy(prev => prev === 'date' ? 'priority' : 'date')}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowUpDown size={14} />
              {sortBy === 'date' ? 'Date' : 'Priority'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <>
            {viewMode === VIEW_MODES.LIST && (
              <div className="space-y-3">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                    <CheckCircle2 size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium">No tasks found</p>
                    <p className="text-sm mt-1">Add a new task to get started!</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === VIEW_MODES.KANBAN && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                <KanbanColumn 
                  title="To Do" 
                  tasks={tasks.filter(t => t.status === 'pending' && !t.dueDate)}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  colorType="slate"
                />
                <KanbanColumn 
                  title="In Progress" 
                  tasks={tasks.filter(t => t.status === 'pending' && t.dueDate)}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  colorType="blue"
                />
                <KanbanColumn 
                  title="Completed" 
                  tasks={tasks.filter(t => t.status === 'completed')}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  colorType="emerald"
                />
              </div>
            )}

            {viewMode === VIEW_MODES.MATRIX && (
              <PriorityMatrix 
                tasks={tasks.filter(t => t.status === 'pending')}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            )}
          </>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGoals.length > 0 ? (
              sortedGoals.map(goal => {
                const daysLeft = getDaysLeft(goal.date);
                const isUrgent = daysLeft <= 5 && daysLeft >= 0;
                const isPast = daysLeft < 0;

                return (
                  <GoalCard 
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDeleteGoal}
                    daysLeft={daysLeft}
                    isUrgent={isUrgent}
                    isPast={isPast}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Target size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">No goals set yet</p>
                <p className="text-sm mt-1">Add a goal to track important deadlines!</p>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <CalendarView tasks={tasks} goals={goals} />
        )}
      </div>

      {/* Modals */}
      <AddTaskModal 
        isOpen={showAddTask}
        onClose={() => { setShowAddTask(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      <AddGoalModal 
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
};

export default TasksDeadlinesPage;
