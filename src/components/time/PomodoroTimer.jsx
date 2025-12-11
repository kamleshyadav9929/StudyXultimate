import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroTimer = ({ onSessionComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'short' | 'long'
  const [isStrictMode, setIsStrictMode] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        onSessionComplete(25); // Log 25 minutes
        // Play notification sound here if needed
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onSessionComplete]);

  // Strict Mode Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isStrictMode && isActive && document.hidden) {
        setIsActive(false);
        alert("⚠️ STRICT MODE: Timer paused! You left the app. Get back to focus!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStrictMode, isActive]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const setTimerMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'focus') setTimeLeft(25 * 60);
    else if (newMode === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center relative overflow-hidden">
      {/* Strict Mode Toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={`text-xs font-medium ${isStrictMode ? 'text-red-500' : 'text-slate-400'}`}>
          Strict Mode
        </span>
        <button 
          onClick={() => setIsStrictMode(!isStrictMode)}
          className={`w-8 h-4 rounded-full transition-colors relative ${isStrictMode ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isStrictMode ? 'left-4.5' : 'left-0.5'}`} />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Focus Timer</h3>
      
      {/* Mode Toggles */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
        {['focus', 'short', 'long'].map((m) => (
          <button
            key={m}
            onClick={() => setTimerMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {m === 'focus' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-7xl font-bold text-slate-900 dark:text-white mb-8 font-mono tracking-wider">
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`p-4 rounded-full text-white transition-all transform hover:scale-105 ${
            isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <RotateCcw size={32} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
