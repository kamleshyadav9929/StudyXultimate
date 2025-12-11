import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, BookOpen, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      setDisplayValue(Math.round(startValue + difference * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
};

const StatCard = ({ icon: Icon, label, value, suffix = '', color, delay = 0, trend }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "relative overflow-hidden rounded-2xl p-4 md:p-5 cursor-pointer",
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
        "hover-lift group transition-all duration-300"
      )}
    >
      {/* Gradient Background on Hover */}
      <div 
        className={clsx(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          `bg-gradient-to-br ${color} blur-xl`
        )} 
        style={{ opacity: isHovered ? 0.1 : 0 }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
            "bg-gradient-to-br shadow-lg",
            color
          )}>
            <Icon size={20} className="text-white" />
          </div>
          
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              <AnimatedNumber value={value} />
            </span>
            {suffix && (
              <span className="text-sm font-medium text-slate-400">
                {suffix}
              </span>
            )}
          </div>
        </div>

        {trend !== undefined && (
          <div className={clsx(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            trend >= 0 
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          )}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Decorative Element */}
      <motion.div 
        animate={{ scale: isHovered ? 1.2 : 1 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10",
          `bg-gradient-to-br ${color}`
        )}
      />
    </motion.div>
  );
};

const StatsOverview = ({ stats, syllabusProgress, tasksCount }) => {
  const statsData = [
    {
      icon: Flame,
      label: 'Study Streak',
      value: stats?.streakDays || 0,
      suffix: 'days',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: CheckCircle2,
      label: 'Attendance',
      value: stats?.attendanceOverall || 0,
      suffix: '%',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: BookOpen,
      label: 'Syllabus Done',
      value: syllabusProgress || 0,
      suffix: '%',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Target,
      label: 'Pending Tasks',
      value: tasksCount || 0,
      suffix: '',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.label}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default StatsOverview;
