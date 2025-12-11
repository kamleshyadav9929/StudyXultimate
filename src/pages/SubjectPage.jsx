import React, { useState } from 'react';
import { useParams, Navigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ListTodo, CheckSquare, ArrowLeft, 
  GraduationCap, Clock, Target, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import NotesSection from '../components/subjects/NotesSection';
import SyllabusSection from '../components/subjects/SyllabusSection';
import PYQSection from '../components/subjects/PYQSection';

const SubjectPage = () => {
  const { subjectCode } = useParams();
  const [searchParams] = useSearchParams();
  const { state, loading, updateSection } = useApp();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'notes');

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

  if (!state.subjects[subjectCode]) {
    return <Navigate to="/" replace />;
  }

  const subject = state.subjects[subjectCode];
  
  // Calculate stats
  const getStats = () => {
    const subjectSyllabus = state.syllabus[subjectCode] || {};
    let totalTopics = 0;
    let completedTopics = 0;

    Object.values(subjectSyllabus).forEach(unit => {
      if (unit.topics) {
        totalTopics += unit.topics.length;
        completedTopics += unit.topics.filter(t => t.status === 'completed').length;
      }
    });

    const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
    const notesCount = (state.notes[subjectCode] || []).length;
    const pyqCount = (state.pyq[subjectCode] || []).length;
    const attendance = state.attendance[subjectCode] || { total: 0, attended: 0 };
    const attendancePercent = attendance.total === 0 ? 100 : Math.round((attendance.attended / attendance.total) * 100);

    return { progress, completedTopics, totalTopics, notesCount, pyqCount, attendancePercent };
  };

  const stats = getStats();
  
  const handleUpdateNotes = (newNotes) => {
    const updatedNotes = { ...state.notes, [subjectCode]: newNotes };
    updateSection('notes', updatedNotes);
  };

  const tabs = [
    { id: 'notes', label: 'Notes', icon: BookOpen, count: stats.notesCount },
    { id: 'syllabus', label: 'Syllabus', icon: ListTodo, count: stats.totalTopics },
    { id: 'pyq', label: 'PYQs', icon: CheckSquare, count: stats.pyqCount },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
        className="relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{ 
          background: `linear-gradient(135deg, ${subject.color}15, ${subject.color}05)`,
          borderColor: `${subject.color}30`
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl"
            style={{ backgroundColor: subject.color }}
          />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-slate-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Back Button + Breadcrumb */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/subjects" 
                className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:shadow-lg transition-all"
              >
                <ArrowLeft size={20} />
              </Link>
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/subjects" className="hover:text-slate-900 dark:hover:text-white transition-colors">Subjects</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">{subject.shortName || subject.code}</span>
            </div>
          </div>

          {/* Subject Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: subject.color }}
              >
                <GraduationCap size={28} className="text-white md:w-8 md:h-8" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {subject.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span 
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.code}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {subject.credits} Credits
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              {[
                { icon: Target, value: `${stats.progress}%`, label: 'Progress', color: subject.color },
                { icon: Clock, value: `${stats.attendancePercent}%`, label: 'Attendance', color: stats.attendancePercent < 75 ? '#ef4444' : '#10b981' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center min-w-[80px]"
                >
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5"
      >
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all relative",
                activeTab === tab.id 
                  ? "text-white shadow-lg" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              style={{
                backgroundColor: activeTab === tab.id ? subject.color : 'transparent'
              }}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={clsx(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]",
                  activeTab === tab.id 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        variants={itemVariants}
        className="min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <NotesSection 
                subjectCode={subjectCode} 
                notes={state.notes[subjectCode] || []} 
                onUpdate={handleUpdateNotes}
                subjectColor={subject.color}
              />
            </motion.div>
          )}
          {activeTab === 'syllabus' && (
            <motion.div
              key="syllabus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SyllabusSection 
                subjectCode={subjectCode}
                syllabus={state.syllabus[subjectCode] || {}}
                subjectColor={subject.color}
                onUpdate={(newSyllabus) => {
                  const updatedSyllabus = { ...state.syllabus, [subjectCode]: newSyllabus };
                  updateSection('syllabus', updatedSyllabus);
                }}
              />
            </motion.div>
          )}
          {activeTab === 'pyq' && (
            <motion.div
              key="pyq"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PYQSection 
                subjectCode={subjectCode}
                questions={state.pyq[subjectCode] || []}
                subjectColor={subject.color}
                onUpdate={(newQuestions) => {
                  const updatedPyq = { ...state.pyq, [subjectCode]: newQuestions };
                  updateSection('pyq', updatedPyq);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SubjectPage;
