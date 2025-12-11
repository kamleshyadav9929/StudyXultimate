import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Coffee,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  getDay, 
  addMonths, 
  subMonths,
  isToday as checkIsToday,
  isFuture,
  isPast
} from 'date-fns';

const AttendancePage = () => {
  const { state, loading, updateSection } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(state?.subjects ? Object.keys(state.subjects)[0] : '');
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = new Date();

  if (loading || !state) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const subjectData = state.attendance[selectedSubject] || { total: 0, attended: 0, history: [] };
  const percentage = subjectData.total === 0 ? 100 : Math.round((subjectData.attended / subjectData.total) * 100);
  const subject = state.subjects[selectedSubject];
  const subjectColor = subject?.color || '#3b82f6';
  
  // Prediction Logic - Professional calculation
  const classesTo75 = percentage < 75 
    ? Math.ceil((0.75 * subjectData.total - subjectData.attended) / 0.25) 
    : 0;
  const canSkip = percentage >= 75 
    ? Math.floor((subjectData.attended - 0.75 * subjectData.total) / 0.75) 
    : 0;

  // Get today's status
  const getTodayStatus = () => {
    const dateStr = format(today, 'yyyy-MM-dd');
    const entry = subjectData.history.find(h => h.date === dateStr);
    return entry ? entry.status : null;
  };

  const todayStatus = getTodayStatus();

  const updateAttendanceData = (newHistory) => {
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

  // IMPORTANT: Only allow marking attendance for TODAY
  const handleMarkTodayAttendance = (status) => {
    const dateStr = format(today, 'yyyy-MM-dd');
    
    const existingIndex = subjectData.history.findIndex(h => h.date === dateStr);
    let newHistory = [...subjectData.history];

    if (existingIndex >= 0) {
      if (status === null) {
        newHistory.splice(existingIndex, 1);
      } else {
        newHistory[existingIndex] = { ...newHistory[existingIndex], status };
      }
    } else if (status !== null) {
      newHistory.push({ date: dateStr, status });
    }

    updateAttendanceData(newHistory);
  };

  // Calendar Logic
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const daysToDisplay = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = subjectData.history.find(h => h.date === dateStr);
    return entry ? entry.status : null;
  };

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const subjects = Object.keys(state.subjects);
    let totalClasses = 0;
    let totalAttended = 0;
    
    subjects.forEach(sub => {
      const data = state.attendance[sub] || { total: 0, attended: 0 };
      totalClasses += data.total;
      totalAttended += data.attended;
    });
    
    const overall = totalClasses === 0 ? 100 : Math.round((totalAttended / totalClasses) * 100);
    return { totalClasses, totalAttended, overall };
  }, [state]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Hero Header */}
      <motion.header 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl opacity-15 animate-float-delayed" />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
          >
            <CheckCircle2 size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
              Attendance Tracker
            </span>
          </motion.div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Track Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Attendance
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Stay above 75% to maintain eligibility. Mark attendance for today only.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Overall', value: `${overallStats.overall}%`, icon: Target, color: overallStats.overall >= 75 ? '#10b981' : '#ef4444' },
              { label: 'Classes', value: overallStats.totalClasses, icon: CalendarIcon, color: '#3b82f6' },
              { label: 'Attended', value: overallStats.totalAttended, icon: CheckCircle2, color: '#10b981' },
              { label: 'Subjects', value: Object.keys(state.subjects).length, icon: Award, color: '#8b5cf6' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                    <stat.icon size={14} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Subject Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.keys(state.subjects).map((sub) => {
          const subj = state.subjects[sub];
          const attendance = state.attendance[sub] || { total: 0, attended: 0 };
          const pct = attendance.total === 0 ? 100 : Math.round((attendance.attended / attendance.total) * 100);
          
          return (
            <motion.button
              key={sub}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSubject(sub)}
              className={clsx(
                "px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2",
                selectedSubject === sub 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              )}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: subj?.color || '#3b82f6' }}
              />
              {subj?.shortName || sub}
              <span className={clsx(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                pct >= 75 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"
              )}>
                {pct}%
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Mark Today */}
        <motion.div variants={itemVariants} className="space-y-6">
          
          {/* Main Percentage Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 opacity-10"
              style={{ 
                background: `radial-gradient(circle at center, ${subjectColor}40, transparent 70%)` 
              }}
            />
            
            <div className="relative z-10">
              <motion.span 
                key={percentage}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="block text-6xl font-black tracking-tighter"
                style={{ color: percentage >= 75 ? '#10b981' : '#ef4444' }}
              >
                {percentage}%
              </motion.span>
              <p className="text-slate-500 mt-2 font-medium">{subject?.name || selectedSubject}</p>
              
              <div className="mt-4 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full relative"
                  style={{ backgroundColor: percentage >= 75 ? '#10b981' : '#ef4444' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>{subjectData.attended} attended</span>
                <span>{subjectData.total} total</span>
              </div>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Prediction</h3>
            </div>
            
            {percentage < 75 ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400">Below 75%!</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Attend <span className="font-bold text-slate-900 dark:text-white">{classesTo75}</span> more classes consecutively to reach 75%.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">On Track!</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      You can skip <span className="font-bold text-slate-900 dark:text-white">{canSkip}</span> classes and stay above 75%.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mark Today's Attendance - ONLY TODAY ALLOWED */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Mark Today</h3>
                  <p className="text-xs text-slate-500">{format(today, 'EEEE, MMM d, yyyy')}</p>
                </div>
              </div>
              {todayStatus && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkTodayAttendance(null)}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear
                </motion.button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { status: 'present', label: 'Present', icon: CheckCircle2, color: '#10b981' },
                { status: 'absent', label: 'Absent', icon: XCircle, color: '#ef4444' },
                { status: 'holiday', label: 'No Class', icon: Coffee, color: '#f59e0b' },
              ].map((option) => (
                <motion.button
                  key={option.status}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkTodayAttendance(option.status)}
                  className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2",
                    todayStatus === option.status 
                      ? "shadow-lg" 
                      : "hover:shadow-md"
                  )}
                  style={{
                    backgroundColor: todayStatus === option.status ? `${option.color}15` : undefined,
                    borderColor: todayStatus === option.status ? option.color : 'transparent'
                  }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-xl text-white shadow-lg mb-2"
                    style={{ backgroundColor: option.color }}
                  >
                    <option.icon size={20} />
                  </motion.div>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Calendar */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${subjectColor}15` }}>
                <CalendarIcon size={18} style={{ color: subjectColor }} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Attendance History</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </motion.button>
              <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
                {format(viewMonth, 'MMMM yyyy')}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for start of month */}
            {Array.from({ length: getDay(monthStart) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {daysToDisplay.map((date, idx) => {
              const status = getDayStatus(date);
              const isToday = checkIsToday(date);
              const isFutureDate = isFuture(date);
              
              return (
                <motion.div 
                  key={date.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  className={clsx(
                    "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium relative transition-all",
                    isToday && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900",
                    isFutureDate && "opacity-30",
                    status === 'present' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
                    status === 'absent' && "bg-red-100 dark:bg-red-900/30 text-red-600",
                    status === 'holiday' && "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
                    !status && !isFutureDate && "bg-slate-50 dark:bg-slate-800/50 text-slate-400",
                    !status && isFutureDate && "bg-slate-50/50 dark:bg-slate-800/30 text-slate-300"
                  )}
                >
                  <span className={clsx(isToday && "font-bold")}>
                    {format(date, 'd')}
                  </span>
                  {status && (
                    <div className={clsx(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      status === 'present' && "bg-emerald-500",
                      status === 'absent' && "bg-red-500",
                      status === 'holiday' && "bg-amber-500"
                    )} />
                  )}
                  {isToday && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white px-1 rounded font-bold">
                      TODAY
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
            {[
              { label: 'Present', color: '#10b981' },
              { label: 'Absent', color: '#ef4444' },
              { label: 'No Class', color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AttendancePage;
