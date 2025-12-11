import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, HelpCircle, Tag, X, Filter, Award } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

const PYQSection = ({ subjectCode, questions, onUpdate, subjectColor = '#3b82f6' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all'); // all, not-done, practiced, mastered
  const [newQuestion, setNewQuestion] = useState({ 
    question: '', 
    year: '', 
    marks: '', 
    module: '',
    status: 'not-started'
  });

  const handleAddQuestion = () => {
    if (!newQuestion.question) return;

    const question = {
      id: uuidv4(),
      question: newQuestion.question,
      year: newQuestion.year,
      marks: parseInt(newQuestion.marks) || 0,
      module: newQuestion.module,
      status: 'not-started'
    };

    onUpdate([...questions, question]);
    setNewQuestion({ question: '', year: '', marks: '', module: '' });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    onUpdate(questions.filter(q => q.id !== id));
  };

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = {
      'not-started': 'practiced',
      'practiced': 'mastered',
      'mastered': 'not-started'
    };

    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, status: nextStatus[currentStatus] || 'practiced' } : q
    );
    onUpdate(updatedQuestions);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'mastered': 
        return { 
          bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
          border: 'border-emerald-200 dark:border-emerald-500/30',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
        };
      case 'practiced': 
        return { 
          bg: 'bg-amber-50 dark:bg-amber-500/10', 
          border: 'border-amber-200 dark:border-amber-500/30',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
        };
      default: 
        return { 
          bg: 'bg-white dark:bg-slate-800/50', 
          border: 'border-slate-200 dark:border-slate-700',
          badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'mastered': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'practiced': return <HelpCircle className="text-amber-500" size={20} />;
      default: return <Circle className="text-slate-400" size={20} />;
    }
  };

  // Count by status
  const stats = {
    total: questions.length,
    mastered: questions.filter(q => q.status === 'mastered').length,
    practiced: questions.filter(q => q.status === 'practiced').length,
    notDone: questions.filter(q => q.status === 'not-started' || !q.status).length
  };

  const filteredQuestions = filter === 'all' 
    ? questions 
    : questions.filter(q => {
        if (filter === 'not-done') return q.status === 'not-started' || !q.status;
        return q.status === filter;
      });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${subjectColor}15` }}>
              <Award size={20} style={{ color: subjectColor }} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Previous Year Questions</h3>
              <p className="text-sm text-slate-500">{stats.total} questions • {stats.mastered} mastered</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: subjectColor }}
          >
            <Plus size={18} />
            Add Question
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'not-done', label: 'Not Done', count: stats.notDone },
            { id: 'practiced', label: 'Practiced', count: stats.practiced },
            { id: 'mastered', label: 'Mastered', count: stats.mastered },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                filter === tab.id 
                  ? "text-white shadow-lg" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
              style={{ backgroundColor: filter === tab.id ? subjectColor : undefined }}
            >
              {tab.label}
              <span className={clsx(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]",
                filter === tab.id ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Question</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              placeholder="Question text..."
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Year (e.g. End Sem 2024)"
                value={newQuestion.year}
                onChange={(e) => setNewQuestion({ ...newQuestion, year: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <input
                type="number"
                placeholder="Marks"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <input
                type="text"
                placeholder="Module (e.g. Module I)"
                value={newQuestion.module}
                onChange={(e) => setNewQuestion({ ...newQuestion, module: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddQuestion}
                disabled={!newQuestion.question.trim()}
                className="text-white px-6 py-2.5 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ backgroundColor: subjectColor }}
              >
                Save Question
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, index) => {
            const styles = getStatusStyles(q.status);
            return (
              <motion.div 
                key={q.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className={clsx(
                  "group p-5 rounded-2xl border transition-all hover:shadow-lg",
                  styles.bg,
                  styles.border
                )}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meta info */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={clsx("text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider", styles.badge)}>
                        {q.status?.replace('-', ' ') || 'Not Done'}
                      </span>
                      {q.year && (
                        <span className="text-xs text-slate-500 font-medium">{q.year}</span>
                      )}
                      {q.marks && (
                        <span 
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${subjectColor}15`, color: subjectColor }}
                        >
                          {q.marks} Marks
                        </span>
                      )}
                      {q.module && (
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {q.module}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-800 dark:text-white/90 leading-relaxed">{q.question}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleStatus(q.id, q.status)}
                      className="p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Toggle Status"
                    >
                      {getStatusIcon(q.status)}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(q.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
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
              <HelpCircle size={36} style={{ color: subjectColor }} />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Questions Yet' : `No ${filter.replace('-', ' ')} Questions`}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {filter === 'all' ? 'Add your first PYQ to get started!' : 'Try changing the filter'}
            </p>
            {filter === 'all' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium"
                style={{ backgroundColor: subjectColor }}
              >
                <Plus size={18} /> Add Question
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PYQSection;
