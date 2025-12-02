import React, { useState } from 'react';
import { Plus, MoreHorizontal, CheckCircle2, Circle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

const ProjectBoard = ({ project, onUpdate }) => {
  const [newTask, setNewTask] = useState('');
  const [activeColumn, setActiveColumn] = useState('todo'); // 'todo' | 'in-progress' | 'done'

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' }
  ];

  const handleAddTask = (columnId) => {
    if (!newTask) return;

    const task = {
      id: uuidv4(),
      text: newTask,
      status: columnId
    };

    onUpdate({
      ...project,
      tasks: [...project.tasks, task]
    });
    setNewTask('');
    setActiveColumn(null);
  };

  const moveTask = (taskId, newStatus) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    onUpdate({ ...project, tasks: updatedTasks });
  };

  const getTasksByStatus = (status) => project.tasks.filter(t => t.status === status);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <p className="text-slate-400 text-sm">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">
            {Math.round((project.tasks.filter(t => t.status === 'done').length / (project.tasks.length || 1)) * 100)}% Complete
          </span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(project.tasks.filter(t => t.status === 'done').length / (project.tasks.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
            {/* Column Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <h3 className="font-semibold text-white">{col.title}</h3>
                <span className="px-2 py-0.5 bg-slate-800 rounded-full text-xs text-slate-400">
                  {getTasksByStatus(col.id).length}
                </span>
              </div>
              <button className="text-slate-500 hover:text-white">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {getTasksByStatus(col.id).map(task => (
                <div 
                  key={task.id} 
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500/50 transition-colors group"
                >
                  <p className="text-sm text-white mb-3">{task.text}</p>
                  
                  {/* Quick Move Actions */}
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {col.id !== 'todo' && (
                      <button 
                        onClick={() => moveTask(task.id, 'todo')}
                        className="p-1 hover:bg-slate-700 rounded text-xs text-slate-400"
                        title="Move to To Do"
                      >
                        To Do
                      </button>
                    )}
                    {col.id !== 'in-progress' && (
                      <button 
                        onClick={() => moveTask(task.id, 'in-progress')}
                        className="p-1 hover:bg-slate-700 rounded text-xs text-blue-400"
                        title="Move to In Progress"
                      >
                        In Prog
                      </button>
                    )}
                    {col.id !== 'done' && (
                      <button 
                        onClick={() => moveTask(task.id, 'done')}
                        className="p-1 hover:bg-slate-700 rounded text-xs text-emerald-400"
                        title="Move to Done"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Task Input */}
              {activeColumn === col.id ? (
                <div className="bg-slate-800 p-3 rounded-lg border border-blue-500/50">
                  <textarea
                    autoFocus
                    placeholder="Enter task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddTask(col.id);
                      }
                    }}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none mb-2"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setActiveColumn(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleAddTask(col.id)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveColumn(col.id);
                    setNewTask('');
                  }}
                  className="w-full py-2 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg border border-dashed border-slate-700 hover:border-slate-600 transition-all"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectBoard;
