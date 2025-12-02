import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, TrendingUp, Coffee } from 'lucide-react';
import { clsx } from 'clsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, startOfDay } from 'date-fns';

const AttendancePage = () => {
  const { state, loading, updateSection } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(state?.subjects ? Object.keys(state.subjects)[0] : '');
  const [currentDate, setCurrentDate] = useState(new Date());

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  const subjectData = state.attendance[selectedSubject] || { total: 0, attended: 0, history: [] };
  const percentage = subjectData.total === 0 ? 0 : Math.round((subjectData.attended / subjectData.total) * 100);
  
  // Prediction Logic
  const classesTo75 = Math.ceil((0.75 * subjectData.total - subjectData.attended) / 0.25);
  const canSkip = Math.floor((subjectData.attended - 0.75 * subjectData.total) / 0.75);

  const updateAttendanceData = (newHistory) => {
    // Recalculate totals based on history, excluding holidays
    let newTotal = 0;
    let newAttended = 0;

    newHistory.forEach(entry => {
      if (entry.status !== 'holiday') {
        newTotal++;
        if (entry.status === 'present') {
          newAttended++;
        }
      }
    });

    const updatedAttendance = {
      ...state.attendance,
      [selectedSubject]: {
        total: newTotal,
        attended: newAttended,
        history: newHistory
      }
    };

    updateSection('attendance', updatedAttendance);
  };

  const handleMarkAttendance = (status, date = new Date()) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if entry exists
    const existingIndex = subjectData.history.findIndex(h => h.date === dateStr);
    let newHistory = [...subjectData.history];

    if (existingIndex >= 0) {
      if (status === null) {
        // Remove entry
        newHistory.splice(existingIndex, 1);
      } else {
        // Update entry
        newHistory[existingIndex] = { ...newHistory[existingIndex], status };
      }
    } else if (status !== null) {
      // Add new entry
      newHistory.push({ date: dateStr, status });
    }

    updateAttendanceData(newHistory);
  };

  const toggleDayStatus = (date) => {
    const currentStatus = getDayStatus(date);
    let nextStatus = null;

    if (currentStatus === null) nextStatus = 'present';
    else if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'holiday';
    else if (currentStatus === 'holiday') nextStatus = null;

    handleMarkAttendance(nextStatus, date);
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Always show full month
  const calendarStart = monthStart;
  
  const daysToDisplay = eachDayOfInterval({ start: calendarStart, end: monthEnd });

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = subjectData.history.find(h => h.date === dateStr);
    return entry ? entry.status : null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Attendance Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your presence and meet the 75% criteria.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
          {Object.keys(state.subjects).map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                selectedSubject === sub 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {state.subjects[sub]?.shortName || state.subjects[sub]?.name || sub}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="space-y-6">
          {/* Main Percentage Card */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
            <div className="relative z-10 text-center">
              <span className="text-6xl font-bold text-slate-900 dark:text-white tracking-tighter">{percentage}%</span>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Current Attendance</p>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mt-6">
              <div 
                className={clsx(
                  "h-4 rounded-full transition-all duration-1000",
                  percentage >= 75 ? "bg-emerald-500" : "bg-red-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Prediction Card */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-400" />
              Prediction
            </h3>
            <div className="space-y-4">
              {percentage < 75 ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-400 font-bold">Attendance Low!</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      You need to attend <span className="font-bold text-slate-900 dark:text-white">{classesTo75 > 0 ? classesTo75 : 0}</span> more classes to reach 75%.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-emerald-400 font-bold">On Track!</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      You can safely skip <span className="font-bold text-slate-900 dark:text-white">{canSkip > 0 ? canSkip : 0}</span> classes and stay above 75%.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mark Attendance */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mark Today</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleMarkAttendance('present')}
                className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors group"
              >
                <div className="p-1.5 bg-emerald-500 text-white rounded-full mb-1.5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">Present</span>
              </button>
              <button
                onClick={() => handleMarkAttendance('absent')}
                className="flex flex-col items-center justify-center p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors group"
              >
                <div className="p-1.5 bg-red-500 text-white rounded-full mb-1.5 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                  <XCircle size={20} />
                </div>
                <span className="text-red-400 text-sm font-medium">Absent</span>
              </button>
              <button
                onClick={() => handleMarkAttendance('holiday')}
                className="flex flex-col items-center justify-center p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-colors group"
              >
                <div className="p-1.5 bg-amber-500 text-white rounded-full mb-1.5 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Coffee size={20} />
                </div>
                <span className="text-amber-400 text-sm font-medium">Holiday</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-purple-400" />
              Attendance History
            </h3>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{format(currentDate, 'MMMM yyyy')}</span>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for start of month/period */}
            {Array.from({ length: getDay(calendarStart) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {daysToDisplay.map(date => {
              const status = getDayStatus(date);
              return (
                <button 
                  key={date.toString()} 
                  onClick={() => toggleDayStatus(date)}
                  className={clsx(
                    "aspect-square rounded-lg flex items-center justify-center text-sm font-medium border relative group transition-all hover:scale-105",
                    status === 'present' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" :
                    status === 'absent' ? "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400" :
                    status === 'holiday' ? "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400" :
                    "bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800",
                    isSameDay(date, new Date()) && "ring-2 ring-blue-500"
                  )}
                >
                  {format(date, 'd')}
                  {status && (
                    <div className={clsx(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      status === 'present' ? "bg-emerald-500" : 
                      status === 'absent' ? "bg-red-500" :
                      "bg-amber-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
