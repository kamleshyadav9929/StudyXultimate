import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  BookOpen,
  Flame,
  Volume2,
  VolumeX,
  Coffee,
  Zap,
  Award,
  BarChart2,
  Rocket,
  Settings,
  Target,
  TrendingUp
} from 'lucide-react';
import { clsx } from 'clsx';

// Timer Presets
const TIMER_PRESETS = [
  { id: 'standard', name: 'Pomodoro', focus: 25, shortBreak: 5, longBreak: 15, icon: Coffee, color: '#3b82f6' },
  { id: 'extended', name: 'Deep Work', focus: 50, shortBreak: 10, longBreak: 30, icon: Zap, color: '#8b5cf6' },
  { id: 'short', name: 'Quick', focus: 15, shortBreak: 3, longBreak: 10, icon: Rocket, color: '#f59e0b' },
  { id: 'custom', name: 'Custom', focus: 25, shortBreak: 5, longBreak: 15, icon: Settings, color: '#6b7280' }
];

// Animated Timer Ring
const TimerRing = ({ progress, size = 280, strokeWidth = 14, children, isActive, mode }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const gradientColors = {
    focus: ['#3b82f6', '#8b5cf6', '#ec4899'],
    shortBreak: ['#10b981', '#06b6d4', '#3b82f6'],
    longBreak: ['#8b5cf6', '#a855f7', '#ec4899']
  };

  const colors = gradientColors[mode] || gradientColors.focus;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow Effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ 
              background: `radial-gradient(circle, ${colors[0]}40, transparent 70%)` 
            }}
          />
        )}
      </AnimatePresence>
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800/50"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#timerGradient-${mode})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id={`timerGradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="50%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        {children}
      </div>
    </div>
  );
};

// Session Item
const SessionItem = ({ session, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all"
  >
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
        session.type === 'focus' 
          ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
          : "bg-gradient-to-br from-emerald-500 to-teal-600"
      )}
    >
      {session.type === 'focus' ? <Zap size={20} className="text-white" /> : <Coffee size={20} className="text-white" />}
    </motion.div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <p className="font-bold text-slate-800 dark:text-slate-200">
          {session.type === 'focus' ? 'Deep Focus' : 'Break Time'}
        </p>
        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded-md">
          {session.time}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: session.type === 'focus' ? '#3b82f6' : '#10b981' }} 
          />
        </div>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 min-w-[3rem] text-right">
          {session.duration}m
        </span>
      </div>
    </div>
  </motion.div>
);

// Stat Card
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -2, scale: 1.02 }}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center"
  >
    <div 
      className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2"
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
  </motion.div>
);

const TimeManagementPage = () => {
  const { state, loading, updateSection } = useApp();
  
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[0]);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [todaysSessions, setTodaysSessions] = useState([]);
  
  useEffect(() => {
    const minutes = mode === 'focus' 
      ? (selectedPreset.id === 'custom' ? customMinutes : selectedPreset.focus)
      : mode === 'shortBreak' 
        ? selectedPreset.shortBreak 
        : selectedPreset.longBreak;
    setTimeLeft(minutes * 60);
    setIsActive(false);
  }, [selectedPreset, mode, customMinutes]);

  const playSound = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQIDXo6Y');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const toggleTimer = () => {
    if (!isActive) playSound();
    setIsActive(!isActive);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      if (mode === 'focus') {
        const newSession = {
          id: Date.now(),
          type: 'focus',
          duration: selectedPreset.id === 'custom' ? customMinutes : selectedPreset.focus,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setTodaysSessions(prev => [newSession, ...prev]);
        setSessionsCompleted(prev => prev + 1);
        
        if (state) {
          const currentStats = state.dashboard?.stats || {};
          const newStats = {
            ...currentStats,
            studyMinutesToday: (currentStats.studyMinutesToday || 0) + newSession.duration
          };
          updateSection('dashboard', { ...state.dashboard, stats: newStats });
        }
        
        setMode(sessionsCompleted > 0 && (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak');
      } else {
        setMode('focus');
      }
      playSound();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, selectedPreset, customMinutes, sessionsCompleted, state, updateSection]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isStrictMode && isActive && document.hidden) {
        setIsActive(false);
        alert("⚠️ STRICT MODE: Timer paused! Get back to focus!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStrictMode, isActive]);

  const stats = useMemo(() => {
    const todayMinutes = todaysSessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + s.duration, 0);
    const storedMinutes = state?.dashboard?.stats?.studyMinutesToday || 0;
    const totalMinutes = Math.max(todayMinutes, storedMinutes);
    
    return {
      todayMinutes: totalMinutes,
      todayHours: (totalMinutes / 60).toFixed(1),
      sessionsToday: todaysSessions.filter(s => s.type === 'focus').length,
      streak: sessionsCompleted,
      goalProgress: Math.min(100, Math.round((totalMinutes / 120) * 100))
    };
  }, [todaysSessions, sessionsCompleted, state]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = mode === 'focus' 
      ? (selectedPreset.id === 'custom' ? customMinutes : selectedPreset.focus) * 60
      : mode === 'shortBreak' ? selectedPreset.shortBreak * 60 : selectedPreset.longBreak * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const resetTimer = () => {
    setIsActive(false);
    const minutes = mode === 'focus' 
      ? (selectedPreset.id === 'custom' ? customMinutes : selectedPreset.focus)
      : mode === 'shortBreak' ? selectedPreset.shortBreak : selectedPreset.longBreak;
    setTimeLeft(minutes * 60);
  };

  if (loading) {
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

  if (!state) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  const modeConfig = {
    focus: { label: 'Deep Focus', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600' },
    shortBreak: { label: 'Short Break', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
    longBreak: { label: 'Long Break', color: '#8b5cf6', gradient: 'from-purple-500 to-pink-600' }
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
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl"
            style={{ backgroundColor: modeConfig[mode].color }}
          />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
          >
            <Timer size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
              Pomodoro Timer
            </span>
          </motion.div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Focus{' '}
            <span className={clsx("bg-clip-text text-transparent bg-gradient-to-r", modeConfig[mode].gradient)}>
              Timer
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Stay productive with the Pomodoro technique. Focus, break, repeat.
          </p>

          {/* Quick Stats in Header */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Today', value: `${stats.todayHours}h`, icon: Clock, color: '#3b82f6' },
              { label: 'Sessions', value: stats.sessionsToday, icon: Zap, color: '#8b5cf6' },
              { label: 'Streak', value: stats.streak, icon: Flame, color: '#f59e0b' },
              { label: 'Goal', value: `${stats.goalProgress}%`, icon: Target, color: '#10b981' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center"
              >
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timer Panel */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center"
        >
          {/* Mode Tabs */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 mb-8">
            {[
              { id: 'focus', label: 'Focus', icon: Zap },
              { id: 'shortBreak', label: 'Short', icon: Coffee },
              { id: 'longBreak', label: 'Long', icon: BookOpen }
            ].map((m) => (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(m.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  mode === m.id
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <m.icon size={16} />
                {m.label}
              </motion.button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="mb-8">
            <TimerRing 
              progress={getProgress()} 
              size={260} 
              strokeWidth={12}
              isActive={isActive}
              mode={mode}
            >
              <motion.div 
                key={timeLeft}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <span className="block text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <motion.span 
                  className={clsx(
                    "inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white",
                    `bg-gradient-to-r ${modeConfig[mode].gradient}`
                  )}
                >
                  {modeConfig[mode].label}
                </motion.span>
              </motion.div>
            </TimerRing>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.05, rotate: -180 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <RotateCcw size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={clsx(
                "w-16 h-16 flex items-center justify-center rounded-2xl text-white shadow-xl transition-all",
                isActive 
                  ? "bg-gradient-to-br from-orange-500 to-red-600" 
                  : `bg-gradient-to-br ${modeConfig[mode].gradient}`
              )}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={clsx(
                "w-12 h-12 flex items-center justify-center rounded-xl transition-all",
                soundEnabled 
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsStrictMode(!isStrictMode)}
              className={clsx(
                "w-12 h-12 flex items-center justify-center rounded-xl transition-all",
                isStrictMode 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
              title="Strict Mode"
            >
              <AlertCircle size={20} />
            </motion.button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap justify-center gap-2">
            {TIMER_PRESETS.map(preset => (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPreset(preset)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                  selectedPreset.id === preset.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg"
                    : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                )}
              >
                <preset.icon size={14} />
                {preset.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* History Panel */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <BarChart2 size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Session History</h3>
                <p className="text-xs text-slate-500">Today's focus sessions</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
              {stats.sessionsToday} sessions
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-2">
            <AnimatePresence mode="popLayout">
              {todaysSessions.length > 0 ? (
                todaysSessions.map((session, index) => (
                  <SessionItem key={session.id} session={session} index={index} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4"
                  >
                    <Clock size={32} className="text-blue-500" />
                  </motion.div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">No Sessions Yet</h4>
                  <p className="text-sm text-slate-500">Start your first focus session!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimeManagementPage;
