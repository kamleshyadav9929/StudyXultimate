import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroTimer = ({ onSessionComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'short' | 'long'

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
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">
      <h3 className="text-lg font-semibold text-white mb-6">Focus Timer</h3>
      
      {/* Mode Toggles */}
      <div className="flex bg-slate-800 p-1 rounded-xl mb-8">
        {['focus', 'short', 'long'].map((m) => (
          <button
            key={m}
            onClick={() => setTimerMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            {m === 'focus' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-7xl font-bold text-white mb-8 font-mono tracking-wider">
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
          className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          <RotateCcw size={32} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
