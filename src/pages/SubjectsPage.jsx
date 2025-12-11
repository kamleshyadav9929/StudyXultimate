import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, ArrowRight, GraduationCap, Clock, 
  CheckCircle2, Target, Sparkles, TrendingUp
} from 'lucide-react';
import { clsx } from 'clsx';

const SubjectsPage = () => {
  const { state, loading } = useApp();

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

  const getSubjectStats = (subjectCode) => {
    const subjectSyllabus = state.syllabus[subjectCode] || {};
    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;

    Object.values(subjectSyllabus).forEach(unit => {
      if (unit.topics) {
        totalTopics += unit.topics.length;
        completedTopics += unit.topics.filter(t => t.status === 'completed').length;
        inProgressTopics += unit.topics.filter(t => t.status === 'in-progress').length;
      }
    });

    const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
    
    // Get attendance
    const attendance = state.attendance[subjectCode] || { total: 0, attended: 0 };
    const attendancePercent = attendance.total === 0 ? 100 : Math.round((attendance.attended / attendance.total) * 100);

    // Get notes count
    const notesCount = (state.notes[subjectCode] || []).length;

    // Get PYQ count
    const pyqCount = (state.pyq[subjectCode] || []).length;

    return { progress, completedTopics, totalTopics, inProgressTopics, attendancePercent, notesCount, pyqCount };
  };

  const subjects = Object.values(state.subjects);
  
  // Calculate overall stats
  const overallStats = {
    totalSubjects: subjects.length,
    averageProgress: subjects.length > 0 
      ? Math.round(subjects.reduce((acc, s) => acc + getSubjectStats(s.code).progress, 0) / subjects.length)
      : 0,
    totalNotes: subjects.reduce((acc, s) => acc + getSubjectStats(s.code).notesCount, 0),
    totalPYQs: subjects.reduce((acc, s) => acc + getSubjectStats(s.code).pyqCount, 0)
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
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
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl opacity-15 animate-float-delayed" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-10 animate-pulse-soft" />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
          >
            <GraduationCap size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
              {state.userProfile?.semester || 'Current Semester'}
            </span>
          </motion.div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            My{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Subjects
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Access notes, track syllabus progress, and practice PYQs for all your courses.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { icon: BookOpen, label: 'Subjects', value: overallStats.totalSubjects, color: 'from-blue-500 to-cyan-500' },
              { icon: TrendingUp, label: 'Avg Progress', value: `${overallStats.averageProgress}%`, color: 'from-emerald-500 to-teal-500' },
              { icon: Sparkles, label: 'Notes', value: overallStats.totalNotes, color: 'from-purple-500 to-pink-500' },
              { icon: Target, label: 'PYQs', value: overallStats.totalPYQs, color: 'from-amber-500 to-orange-500' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <div className={clsx("p-1.5 rounded-lg bg-gradient-to-br", stat.color)}>
                    <stat.icon size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Subjects Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {subjects.map((subject, index) => {
          const stats = getSubjectStats(subject.code);
          const isLowAttendance = stats.attendancePercent < 75;
          
          return (
            <motion.div
              key={subject.code}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                to={`/subject/${subject.code}`}
                className="group block relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300"
              >
                {/* Gradient Top Border */}
                <div 
                  className="h-1.5 w-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${subject.color}, ${subject.color}88)` 
                  }}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          className="p-2 rounded-xl"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <BookOpen size={18} style={{ color: subject.color }} />
                        </motion.div>
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${subject.color}15`,
                            color: subject.color 
                          }}
                        >
                          {subject.code}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {subject.name}
                      </h3>
                    </div>
                    <span className="shrink-0 ml-3 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                      {subject.credits} Cr
                    </span>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3 mb-4">
                    {/* Syllabus Progress */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-slate-500 dark:text-slate-400">Syllabus Completion</span>
                        <span className="font-bold" style={{ color: subject.color }}>{stats.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full relative"
                          style={{ backgroundColor: subject.color }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{stats.completedTopics}</p>
                      <p className="text-[10px] text-slate-400 uppercase">Done</p>
                    </div>
                    <div className={clsx(
                      "text-center p-2 rounded-lg",
                      isLowAttendance ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"
                    )}>
                      <p className={clsx(
                        "text-sm font-bold",
                        isLowAttendance ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {stats.attendancePercent}%
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">Attend.</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{stats.notesCount}</p>
                      <p className="text-[10px] text-slate-400 uppercase">Notes</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {stats.pyqCount > 0 && (
                        <span className="text-xs text-slate-400">
                          {stats.pyqCount} PYQs available
                        </span>
                      )}
                    </div>
                    <motion.div 
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"
                      whileHover={{ x: 4 }}
                    >
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </motion.div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${subject.color}10, transparent 70%)`
                  }}
                />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4"
          >
            <BookOpen size={36} className="text-blue-500" />
          </motion.div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Subjects Yet</h3>
          <p className="text-sm text-slate-500">Add your first subject to get started!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubjectsPage;
