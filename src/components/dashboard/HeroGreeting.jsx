import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, CloudSun } from 'lucide-react';

const HeroGreeting = ({ userName }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  const motivationalQuotes = [
    "Every expert was once a beginner.",
    "Small progress is still progress.",
    "Your future self will thank you.",
    "Focus on progress, not perfection.",
    "The best time to start is now.",
    "Discipline is the bridge between goals and achievement.",
    "Success is the sum of small efforts.",
    "Dream big, start small, act now."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 10000); // Change quote every 10 seconds
    return () => clearInterval(quoteTimer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { greeting: 'Good Morning', icon: Sun, color: 'from-amber-400 to-orange-500' };
    if (hour >= 12 && hour < 17) return { greeting: 'Good Afternoon', icon: CloudSun, color: 'from-blue-400 to-cyan-500' };
    if (hour >= 17 && hour < 21) return { greeting: 'Good Evening', icon: CloudSun, color: 'from-purple-400 to-pink-500' };
    return { greeting: 'Good Night', icon: Moon, color: 'from-indigo-500 to-purple-600' };
  };

  const timeData = getTimeOfDay();
  const TimeIcon = timeData.icon;

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const firstName = userName?.split(' ')[0] || 'Scholar';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8"
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br ${timeData.color} rounded-full blur-3xl opacity-20 animate-float`} />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-15 animate-float-delayed" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full blur-2xl opacity-10 animate-pulse-soft" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Date Badge */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
        >
          <TimeIcon size={14} className="text-white/70" />
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
            {formattedDate}
          </span>
        </motion.div>

        {/* Main Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-3"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">
            {timeData.greeting},{' '}
            <span className={`bg-gradient-to-r ${timeData.color} bg-clip-text text-transparent`}>
              {firstName}
            </span>
            <motion.span 
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block ml-2"
            >
              👋
            </motion.span>
          </h1>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div 
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm md:text-base text-white/60 font-medium italic">
            "{motivationalQuotes[quoteIndex]}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroGreeting;
