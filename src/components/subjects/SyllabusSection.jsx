import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Target, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const SyllabusSection = ({ subjectCode, syllabus, onUpdate, subjectColor = '#3b82f6' }) => {
  const [expandedUnits, setExpandedUnits] = React.useState(() => {
    // Expand first unit by default
    const firstUnit = Object.keys(syllabus)[0];
    return firstUnit ? { [firstUnit]: true } : {};
  });

  const toggleUnit = (unitName) => {
    setExpandedUnits(prev => ({ ...prev, [unitName]: !prev[unitName] }));
  };

  const handleStatusChange = (unitName, topicId, currentStatus) => {
    const nextStatus = {
      'not-started': 'in-progress',
      'in-progress': 'completed',
      'completed': 'not-started'
    };

    const newStatus = nextStatus[currentStatus];
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus));
    const topicIndex = updatedSyllabus[unitName].topics.findIndex(t => t.id === topicId);
    
    if (topicIndex !== -1) {
      updatedSyllabus[unitName].topics[topicIndex].status = newStatus;
      onUpdate(updatedSyllabus);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'in-progress': return <Clock className="text-amber-500" size={18} />;
      default: return <Circle className="text-slate-400" size={18} />;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed': 
        return { 
          bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
          border: 'border-emerald-200 dark:border-emerald-500/30',
          text: 'text-emerald-700 dark:text-emerald-400'
        };
      case 'in-progress': 
        return { 
          bg: 'bg-amber-50 dark:bg-amber-500/10', 
          border: 'border-amber-200 dark:border-amber-500/30',
          text: 'text-amber-700 dark:text-amber-400'
        };
      default: 
        return { 
          bg: 'bg-white dark:bg-slate-800/50', 
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-600 dark:text-slate-400'
        };
    }
  };

  // Calculate overall progress
  let totalTopics = 0;
  let completedTopics = 0;
  let inProgressTopics = 0;
  Object.values(syllabus).forEach(unit => {
    totalTopics += unit.topics.length;
    completedTopics += unit.topics.filter(t => t.status === 'completed').length;
    inProgressTopics += unit.topics.filter(t => t.status === 'in-progress').length;
  });
  const overallProgress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${subjectColor}15` }}>
                <Target size={18} style={{ color: subjectColor }} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syllabus Progress</h3>
            </div>
            <p className="text-slate-500 text-sm">Track your completion status topic by topic</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: subjectColor }}>{completedTopics}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{inProgressTopics}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-400">{totalTopics - completedTopics - inProgressTopics}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-3 rounded-full relative"
              style={{ backgroundColor: subjectColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute right-0 -top-6 text-sm font-bold"
            style={{ color: subjectColor }}
          >
            {overallProgress}%
          </motion.span>
        </div>
      </motion.div>

      {/* Units List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {Object.entries(syllabus).map(([unitName, unitData], unitIndex) => {
          const unitCompleted = unitData.topics.filter(t => t.status === 'completed').length;
          const unitProgress = unitData.topics.length > 0 
            ? Math.round((unitCompleted / unitData.topics.length) * 100) 
            : 0;

          return (
            <motion.div 
              key={unitName} 
              variants={itemVariants}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
            >
              <motion.button 
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                onClick={() => toggleUnit(unitName)}
                className="w-full flex items-center justify-between p-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    animate={{ rotate: expandedUnits[unitName] ? 180 : 0 }}
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${subjectColor}15` }}
                  >
                    <ChevronDown size={18} style={{ color: subjectColor }} />
                  </motion.div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-900 dark:text-white">{unitName}</h4>
                    <p className="text-sm text-slate-500">{unitData.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 w-32">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${unitProgress}%`, backgroundColor: subjectColor }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: subjectColor }}>{unitProgress}%</span>
                  </div>
                  <span className="text-sm font-medium text-slate-500 shrink-0">
                    {unitCompleted}/{unitData.topics.length}
                  </span>
                </div>
              </motion.button>

              <AnimatePresence>
                {expandedUnits[unitName] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="p-3 space-y-2">
                      {unitData.topics.map((topic, topicIndex) => {
                        const styles = getStatusStyles(topic.status);
                        return (
                          <motion.div 
                            key={topic.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: topicIndex * 0.03 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleStatusChange(unitName, topic.id, topic.status)}
                            className={clsx(
                              "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border",
                              styles.bg,
                              styles.border,
                              "hover:shadow-md"
                            )}
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-200">{topic.name}</span>
                            <div className="flex items-center gap-3">
                              <span className={clsx("text-[10px] uppercase font-bold tracking-wider", styles.text)}>
                                {topic.status.replace('-', ' ')}
                              </span>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {getStatusIcon(topic.status)}
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {Object.keys(syllabus).length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${subjectColor}15` }}
          >
            <Sparkles size={36} style={{ color: subjectColor }} />
          </motion.div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Syllabus Data</h3>
          <p className="text-sm text-slate-500">Syllabus topics will appear here once added.</p>
        </motion.div>
      )}
    </div>
  );
};

export default SyllabusSection;
