import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Dashboard Components
import HeroGreeting from '../components/dashboard/HeroGreeting';
import StatsOverview from '../components/dashboard/StatsOverview';
import QuickActions from '../components/dashboard/QuickActions';
import DashboardTasks from '../components/dashboard/DashboardTasks';
import SyllabusWidget from '../components/dashboard/SyllabusWidget';
import HabitsWidget from '../components/dashboard/HabitsWidget';
import GoalsWidget from '../components/dashboard/GoalsWidget';

const Dashboard = () => {
  const { state, loading } = useApp();

  // Calculate overall stats
  const stats = useMemo(() => {
    if (!state) return null;
    
    // Calculate syllabus progress
    let totalTopics = 0;
    let completedTopics = 0;
    Object.values(state.syllabus || {}).forEach(subject => {
      Object.values(subject).forEach(unit => {
        if (unit.topics) {
          totalTopics += unit.topics.length;
          completedTopics += unit.topics.filter(t => t.status === 'completed').length;
        }
      });
    });
    const syllabusProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Calculate overall attendance
    let totalClasses = 0;
    let attendedClasses = 0;
    Object.values(state.attendance || {}).forEach(subject => {
      totalClasses += subject.total || 0;
      attendedClasses += subject.attended || 0;
    });
    const attendanceOverall = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    // Count pending tasks
    const pendingTasks = (state.tasks || []).filter(t => t.status === 'pending').length;

    return {
      dashboard: {
        ...state.dashboard?.stats,
        attendanceOverall,
        syllabusCompleted: syllabusProgress
      },
      syllabusProgress,
      pendingTasks
    };
  }, [state]);

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

  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = state.timetable?.[today] || [];

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
      className="space-y-4 md:space-y-6 pb-8"
    >
      {/* Hero + Quick Actions Section */}
      <motion.div variants={itemVariants}>
        <HeroGreeting userName={state.userProfile?.name} />
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <StatsOverview 
          stats={stats?.dashboard}
          syllabusProgress={stats?.syllabusProgress}
          tasksCount={stats?.pendingTasks}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      {/* Main Content Grid - Bento Layout */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {/* Left Column - Timeline */}
        <div className="lg:col-span-1">
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
                  <p className="text-xs text-slate-500">{todaySchedule.length} classes scheduled</p>
                </div>
              </div>
              <Link 
                to="/schedule" 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Timeline Items */}
            <div className="relative">
              {/* Vertical Line */}
              {todaySchedule.length > 0 && (
                <div className="absolute top-3 bottom-3 left-[11px] w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-30" />
              )}

              <div className="space-y-3">
                {todaySchedule.length > 0 ? (
                  todaySchedule.slice(0, 5).map((item, idx) => {
                    const subjectData = state.subjects[item.subject];
                    const subjectColor = subjectData?.color || '#3b82f6';
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="relative pl-8 group"
                      >
                        {/* Timeline Dot */}
                        <motion.div
                          whileHover={{ scale: 1.3 }}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md z-10 flex items-center justify-center"
                          style={{ backgroundColor: subjectColor }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white/50" />
                        </motion.div>

                        {/* Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all group-hover:shadow-md">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[150px]">
                              {subjectData?.shortName || subjectData?.name || item.subject}
                            </span>
                            <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">
                              {item.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}
                            >
                              {item.type || 'Lecture'}
                            </span>
                            <span>Room {item.room}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-3"
                    >
                      <Activity size={28} className="text-blue-500" />
                    </motion.div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No classes today</p>
                    <p className="text-xs text-slate-400 mt-1">Enjoy your free time!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Column - Tasks */}
        <div className="lg:col-span-1">
          <DashboardTasks />
        </div>

        {/* Right Column - Goals */}
        <div className="lg:col-span-1">
          <GoalsWidget goals={state.goals || []} />
        </div>
      </motion.div>

      {/* Bottom Row - Syllabus & Habits */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
      >
        <SyllabusWidget subjects={state.subjects} syllabus={state.syllabus || {}} />
        <HabitsWidget />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
