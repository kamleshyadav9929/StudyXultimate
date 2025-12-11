import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { useApp } from '../../context/AppContext';

const Timetable = ({ timetable, onUpdate }) => {
  const { state } = useApp();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newClass, setNewClass] = useState({
    subject: '',
    startTime: '',
    endTime: '',
    room: '',
    type: 'Lecture'
  });

  const subjectOptions = Object.keys(state.subjects).map(code => ({
    value: code,
    label: state.subjects[code].name
  }));

  const typeOptions = [
    { value: 'Lecture', label: 'Lecture' },
    { value: 'Lab', label: 'Lab' },
    { value: 'Tutorial', label: 'Tutorial' }
  ];

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.startTime || !newClass.endTime) return;

    const updatedTimetable = { ...timetable };
    if (!updatedTimetable[selectedDay]) updatedTimetable[selectedDay] = [];

    updatedTimetable[selectedDay].push({
      id: Date.now().toString(),
      subject: newClass.subject,
      time: `${newClass.startTime} - ${newClass.endTime}`,
      room: newClass.room,
      type: newClass.type
    });

    // Sort by start time
    updatedTimetable[selectedDay].sort((a, b) => {
      const timeA = a.time.split(' - ')[0];
      const timeB = b.time.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });

    onUpdate(updatedTimetable);
    setIsModalOpen(false);
    setNewClass({ subject: '', startTime: '', endTime: '', room: '', type: 'Lecture' });
  };

  const handleDeleteClass = (day, id) => {
    const updatedTimetable = { ...timetable };
    updatedTimetable[day] = updatedTimetable[day].filter(c => c.id !== id);
    onUpdate(updatedTimetable);
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Timetable</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <div className="min-w-[800px] grid grid-cols-5 gap-4 h-full">
          {days.map(day => (
            <div key={day} className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl">
              <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-2">{day.slice(0, 3)}</h4>
              <div className="space-y-3">
                {timetable[day]?.length > 0 ? (
                  timetable[day].map((slot) => (
                    <div key={slot.id} className="group relative bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-500/50 transition-all shadow-sm dark:shadow-none">
                      <button 
                        onClick={() => handleDeleteClass(day, slot.id)}
                        className="absolute top-1 right-1 p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate" title={state.subjects[slot.subject]?.name}>
                        {state.subjects[slot.subject]?.shortName || slot.subject}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{slot.time}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-slate-500">{slot.room}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          slot.type === 'Lab' ? 'bg-purple-500/20 text-purple-400' : 
                          slot.type === 'Tutorial' ? 'bg-orange-500/20 text-orange-400' : 
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {slot.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-24 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center opacity-50">
                    <span className="text-xs text-slate-400 dark:text-slate-600">Free</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Class</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Day</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {days.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        selectedDay === day 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <CustomSelect 
                  value={newClass.subject}
                  onChange={(val) => setNewClass({...newClass, subject: val})}
                  options={subjectOptions}
                  placeholder="Select Subject"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    required
                    value={newClass.startTime}
                    onChange={e => setNewClass({...newClass, startTime: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                  <input 
                    type="time" 
                    required
                    value={newClass.endTime}
                    onChange={e => setNewClass({...newClass, endTime: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Room</label>
                  <input 
                    type="text" 
                    value={newClass.room}
                    onChange={e => setNewClass({...newClass, room: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. LH-101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                  <CustomSelect 
                    value={newClass.type}
                    onChange={(val) => setNewClass({...newClass, type: val})}
                    options={typeOptions}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors mt-2"
              >
                Add to Timetable
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
