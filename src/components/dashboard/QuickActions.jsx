import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, CheckCircle, Upload, Timer, Link as LinkIcon, Activity, 
  FileQuestion, ListTodo, Book, Settings, Target, BarChart2,
  Sparkles, GraduationCap
} from 'lucide-react';
import { clsx } from 'clsx';

const QuickActions = () => {
  const navigate = useNavigate();
  const [ripple, setRipple] = useState({ x: 0, y: 0, show: false, id: null });

  const actions = [
    { id: 'add', label: "Add Note", icon: Plus, gradient: "from-blue-500 to-blue-600", onClick: () => navigate('/subjects') },
    { id: 'attendance', label: "Attendance", icon: CheckCircle, gradient: "from-emerald-500 to-teal-600", onClick: () => navigate('/attendance') },
    { id: 'pyq', label: "PYQs", icon: FileQuestion, gradient: "from-amber-500 to-orange-600", onClick: () => navigate('/subjects') },
    { id: 'syllabus', label: "Syllabus", icon: ListTodo, gradient: "from-purple-500 to-violet-600", onClick: () => navigate('/subjects') },
    { id: 'goals', label: "Goals", icon: Target, gradient: "from-rose-500 to-pink-600", onClick: () => navigate('/goals') },
    { id: 'ai', label: "AI Chat", icon: Sparkles, gradient: "from-indigo-500 to-purple-600", onClick: () => navigate('/ai') },
    { id: 'upload', label: "Files", icon: Upload, gradient: "from-pink-500 to-rose-600", onClick: () => navigate('/files') },
    { id: 'timer', label: "Schedule", icon: Timer, gradient: "from-orange-500 to-red-600", onClick: () => navigate('/schedule') },
    { id: 'resources', label: "Resources", icon: LinkIcon, gradient: "from-cyan-500 to-blue-600", onClick: () => navigate('/resources') },
    { id: 'habits', label: "Habits", icon: Activity, gradient: "from-lime-500 to-green-600", onClick: () => navigate('/habits') },
    { id: 'skills', label: "Skills", icon: GraduationCap, gradient: "from-fuchsia-500 to-pink-600", onClick: () => navigate('/skills') },
    { id: 'settings', label: "Settings", icon: Settings, gradient: "from-slate-500 to-slate-600", onClick: () => navigate('/settings') },
  ];

  const handleClick = (e, action) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipple({ x, y, show: true, id: action.id });
    setTimeout(() => setRipple({ x: 0, y: 0, show: false, id: null }), 500);
    
    action.onClick();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
        {actions.map((action) => (
          <motion.button 
            key={action.id}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              y: -4,
              transition: { type: "spring", stiffness: 400, damping: 17 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleClick(e, action)}
            className={clsx(
              "relative overflow-hidden group flex flex-col items-center justify-center",
              "p-3 md:p-4 rounded-2xl transition-shadow duration-300",
              "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800",
              "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            )}
          >
            {/* Ripple Effect */}
            {ripple.show && ripple.id === action.id && (
              <motion.span
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={clsx(
                  "absolute w-10 h-10 rounded-full bg-gradient-to-r",
                  action.gradient
                )}
                style={{ left: ripple.x - 20, top: ripple.y - 20 }}
              />
            )}

            {/* Icon Container */}
            <motion.div 
              className={clsx(
                "relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2",
                "bg-gradient-to-br shadow-lg",
                action.gradient
              )}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <action.icon size={20} className="text-white md:w-6 md:h-6" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </div>
            </motion.div>
            
            {/* Label */}
            <span className="text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate w-full text-center">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
