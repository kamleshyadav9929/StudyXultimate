import React, { useState, useMemo } from 'react';
import { Plus, Check, Trash2, Calendar, AlertCircle, Clock, ArrowUpDown, Filter } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import CustomSelect from '../ui/CustomSelect';

const TodoList = ({ tasks, onUpdate }) => {
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('date'); // date, priority

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask) return;

    const task = {
      id: uuidv4(),
      title: newTask,
      dueDate: dueDate,
      priority: priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onUpdate([...tasks, task]);
    setNewTask('');
    setDueDate('');
    setPriority('medium');
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    );
    onUpdate(updatedTasks);
  };

  const deleteTask = (id) => {
    onUpdate(tasks.filter(t => t.id !== id));
  };

  const getDeadlineStatus = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);
    
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'future';
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (filter === 'pending') result = result.filter(t => t.status === 'pending');
    if (filter === 'completed') result = result.filter(t => t.status === 'completed');

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else {
        // Sort by date (overdue first, then today, then future, then no date)
        const dateA = a.dueDate || '9999-12-31';
        const dateB = b.dueDate || '9999-12-31';
        return dateA.localeCompare(dateB);
      }
    });

    return result;
  }, [tasks, filter, sortBy]);

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tasks & Deadlines</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setSortBy(prev => prev === 'date' ? 'priority' : 'date')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={`Sort by ${sortBy === 'date' ? 'Priority' : 'Date'}`}
          >
            <ArrowUpDown size={18} />
          </button>
          <button 
            onClick={() => setFilter(prev => {
              if (prev === 'all') return 'pending';
              if (prev === 'pending') return 'completed';
              return 'all';
            })}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={`Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
          >
            <Filter size={18} className={filter !== 'all' ? 'text-blue-400' : ''} />
          </button>
        </div>
      </div>
      
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/30">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <CustomSelect 
            value={priority}
            onChange={setPriority}
            options={priorityOptions}
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => {
            const deadlineStatus = getDeadlineStatus(task.dueDate);
            
            return (
              <div 
                key={task.id}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all group",
                  task.status === 'completed' 
                    ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60" 
                    : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                  deadlineStatus === 'overdue' && task.status !== 'completed' && "border-red-500/30 bg-red-50 dark:bg-red-500/5",
                  deadlineStatus === 'today' && task.status !== 'completed' && "border-orange-500/30 bg-orange-50 dark:bg-orange-500/5"
                )}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={clsx(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    task.status === 'completed'
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-400 dark:border-slate-500 hover:border-blue-400"
                  )}
                >
                  {task.status === 'completed' && <Check size={12} strokeWidth={3} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={clsx(
                      "text-sm font-medium truncate",
                      task.status === 'completed' ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-white"
                    )}>
                      {task.title}
                    </p>
                    <span className={clsx(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide",
                      task.priority === 'high' ? "bg-red-500/20 text-red-400" :
                      task.priority === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-3">
                      <p className={clsx(
                        "text-xs flex items-center gap-1",
                        deadlineStatus === 'overdue' && task.status !== 'completed' ? "text-red-500 dark:text-red-400 font-medium" :
                        deadlineStatus === 'today' && task.status !== 'completed' ? "text-orange-500 dark:text-orange-400 font-medium" :
                        "text-slate-500"
                      )}>
                        {deadlineStatus === 'overdue' ? <AlertCircle size={12} /> : 
                         deadlineStatus === 'today' ? <Clock size={12} /> : 
                         <Calendar size={12} />}
                        {deadlineStatus === 'overdue' ? 'Overdue: ' : 
                         deadlineStatus === 'today' ? 'Due Today: ' : ''}
                        {task.dueDate}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
            <Check size={48} className="mb-2 opacity-20" />
            <p className="text-sm">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
