import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const ExamCountdown = () => {
  const { state } = useApp();
  const [timeLeft, setTimeLeft] = useState({});

  const goals = state.goals || [];
  
  // Filter for urgent goals (<= 5 days and not past due)
  const urgentGoals = React.useMemo(() => {
    return goals.filter(goal => {
      const diff = new Date(goal.date) - new Date();
      const days = diff / (1000 * 60 * 60 * 24);
      return days <= 5 && days > -1; // Show items due in next 5 days, or just passed today
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [goals]);

  useEffect(() => {
    const calculateTimeLeft = (date) => {
      const difference = +new Date(date) - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }
      return null;
    };

    const updateTimers = () => {
      const newTimeLeft = {};
      urgentGoals.forEach(goal => {
        newTimeLeft[goal.id] = calculateTimeLeft(goal.date);
      });
      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const timer = setInterval(updateTimers, 1000);

    return () => clearInterval(timer);
  }, [urgentGoals]);

  if (urgentGoals.length === 0) return null;

  return (
    <div className="space-y-4">
      {urgentGoals.map(goal => {
        const time = timeLeft[goal.id];
        if (!time) return null;

        return (
          <div key={goal.id} className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden animate-in slide-in-from-top-2">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner animate-pulse shrink-0">
                  <AlertTriangle size={24} className="text-white md:w-8 md:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider shrink-0">Urgent</span>
                    <h3 className="text-lg md:text-xl font-bold text-white truncate">{goal.name}</h3>
                  </div>
                  <p className="text-red-100 text-xs md:text-sm font-medium truncate">
                    Due: {new Date(goal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 text-center w-full md:w-auto justify-center">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2 md:p-3 min-w-[60px] md:min-w-[70px]">
                  <span className="block text-xl md:text-2xl font-bold font-mono">{time.days}</span>
                  <span className="text-[10px] md:text-xs text-red-200 uppercase tracking-wider">Days</span>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2 md:p-3 min-w-[60px] md:min-w-[70px]">
                  <span className="block text-xl md:text-2xl font-bold font-mono">{time.hours}</span>
                  <span className="text-[10px] md:text-xs text-red-200 uppercase tracking-wider">Hrs</span>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2 md:p-3 min-w-[60px] md:min-w-[70px]">
                  <span className="block text-xl md:text-2xl font-bold font-mono">{time.minutes}</span>
                  <span className="text-[10px] md:text-xs text-red-200 uppercase tracking-wider">Mins</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExamCountdown;
