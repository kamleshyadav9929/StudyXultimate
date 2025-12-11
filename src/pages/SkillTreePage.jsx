import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, MessageSquare, Brain, Database, Trophy, Star, Zap, Plus, X, 
  Edit2, Trash2, Palette, Globe, Music, Camera, Flame, Target, 
  TrendingUp, Award, Sparkles, BookOpen, Dumbbell
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

const CATEGORIES = ['All', 'Technical', 'Soft Skills', 'Creative', 'Language', 'Fitness', 'Other'];

const ICONS = {
  Star, Code, Brain, Database, Palette, Music, Camera, Globe, 
  MessageSquare, BookOpen, Dumbbell, Zap
};

const SkillTreePage = () => {
  const { state, updateSection } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Technical', icon: 'Star' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, skillId: null });
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [journalEntry, setJournalEntry] = useState({ learned: '', plan: '', status: 'InProgress' });

  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const skills = state?.skills || [];

  // Calculate stats
  const stats = useMemo(() => {
    const totalXP = skills.reduce((acc, s) => acc + ((s.level - 1) * 100 + s.progress), 0);
    const totalSkills = skills.length;
    const masteredSkills = skills.filter(s => s.level === s.maxLevel).length;
    const activeStreaks = skills.filter(s => (s.streak || 0) > 0).length;
    const longestStreak = Math.max(...skills.map(s => s.streak || 0), 0);
    return { totalXP, totalSkills, masteredSkills, activeStreaks, longestStreak };
  }, [skills]);

  const filteredSkills = selectedCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  const getIcon = (iconName) => ICONS[iconName] || Star;

  const handlePractice = (skillId) => {
    const updatedSkills = skills.map(skill => {
      if (skill.id === skillId) {
        const today = new Date();
        let newStreak = skill.streak || 0;
        
        if (skill.lastPracticed) {
          const lastDate = parseISO(skill.lastPracticed);
          const diff = differenceInCalendarDays(today, lastDate);
          
          if (diff === 1) newStreak += 1;
          else if (diff > 1) newStreak = 1;
        } else {
          newStreak = 1;
        }

        let newProgress = skill.progress + 20;
        let newLevel = skill.level;
        
        if (newProgress >= 100 && skill.level < skill.maxLevel) {
          newProgress = 0;
          newLevel += 1;
        }

        return { 
          ...skill, 
          progress: Math.min(newProgress, 100), 
          level: newLevel,
          streak: newStreak,
          lastPracticed: today.toISOString()
        };
      }
      return skill;
    });

    updateSection('skills', updatedSkills);
  };

  const handleSaveSkill = () => {
    if (!formData.name) return;

    let updatedSkills;
    if (editingSkillId) {
      updatedSkills = skills.map(s => s.id === editingSkillId ? { ...s, ...formData } : s);
    } else {
      const newSkill = {
        id: uuidv4(),
        ...formData,
        level: 1,
        maxLevel: 5,
        progress: 0,
        streak: 0,
        lastPracticed: null,
        status: 'InProgress',
        logs: []
      };
      updatedSkills = [...skills, newSkill];
    }

    updateSection('skills', updatedSkills);
    handleCloseModal();
  };

  const handleDeleteSkill = (skillId) => {
    if (window.confirm('Delete this skill?')) {
      updateSection('skills', skills.filter(s => s.id !== skillId));
    }
  };

  const handleContextMenu = (e, skillId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, skillId });
  };

  const openAddModal = () => {
    setFormData({ name: '', category: 'Technical', icon: 'Star' });
    setEditingSkillId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (skill) => {
    setFormData({ name: skill.name, category: skill.category, icon: skill.icon || 'Star' });
    setEditingSkillId(skill.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSkillId(null);
  };

  const openJournal = (skill) => {
    setSelectedSkill(skill);
    setJournalEntry({ learned: '', plan: '', status: skill.status || 'InProgress' });
    setIsJournalOpen(true);
  };

  const handleSaveJournal = () => {
    if (!selectedSkill) return;

    const updatedSkills = skills.map(skill => {
      if (skill.id === selectedSkill.id) {
        const newLog = {
          id: uuidv4(),
          date: new Date().toISOString(),
          learned: journalEntry.learned,
          plan: journalEntry.plan
        };
        return {
          ...skill,
          status: journalEntry.status,
          logs: [newLog, ...(skill.logs || [])]
        };
      }
      return skill;
    });

    updateSection('skills', updatedSkills);
    setIsJournalOpen(false);
    setSelectedSkill(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-15 animate-float-delayed" />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
          >
            <Sparkles size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Level Up</span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Skill{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Tree
                </span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Master your craft, one level at a time.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Skill
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {[
              { label: 'Total XP', value: stats.totalXP.toLocaleString(), icon: Zap, color: '#f59e0b' },
              { label: 'Skills', value: stats.totalSkills, icon: Target, color: '#3b82f6' },
              { label: 'Mastered', value: stats.masteredSkills, icon: Trophy, color: '#10b981' },
              { label: 'Active Streaks', value: stats.activeStreaks, icon: Flame, color: '#ef4444' },
              { label: 'Best Streak', value: stats.longestStreak, icon: TrendingUp, color: '#8b5cf6' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                    <stat.icon size={14} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Category Filter */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const count = cat === 'All' ? skills.length : skills.filter(s => s.category === cat).length;
          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2",
                selectedCategory === cat 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
              )}
            >
              {cat}
              {count > 0 && (
                <span className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  selectedCategory === cat ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                )}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Skills Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill, idx) => {
              const Icon = getIcon(skill.icon);
              const isMaxed = skill.level === skill.maxLevel;
              const streak = skill.streak || 0;
              const status = skill.status || 'InProgress';
              const totalXP = (skill.level - 1) * 100 + skill.progress;

              return (
                <motion.div 
                  key={skill.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  layout
                  onClick={() => openJournal(skill)}
                  onContextMenu={(e) => handleContextMenu(e, skill.id)}
                  className={clsx(
                    "group relative bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl",
                    isMaxed ? "border-amber-300 dark:border-amber-600" : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  {/* Colored Top Bar */}
                  <div 
                    className={clsx(
                      "h-1.5 w-full",
                      isMaxed ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
                    )}
                    style={{ width: isMaxed ? '100%' : `${skill.progress}%` }}
                  />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={clsx(
                          "p-3 rounded-xl shadow-lg",
                          isMaxed 
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" 
                            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        )}
                      >
                        <Icon size={24} />
                      </motion.div>
                      
                      <div className="flex items-center gap-2">
                        {streak > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            <Flame size={12} className="fill-current" />
                            <span className="text-xs font-bold">{streak}</span>
                          </div>
                        )}
                        <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <span className="text-xs font-bold">Lvl {skill.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">
                      {skill.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {skill.category}
                      </span>
                      {status !== 'InProgress' && (
                        <span className={clsx(
                          "text-xs font-bold px-2 py-0.5 rounded-lg",
                          status === 'Completed' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
                          status === 'Strong' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
                          status === 'Weak' && "bg-red-100 dark:bg-red-900/30 text-red-600"
                        )}>
                          {status}
                        </span>
                      )}
                    </div>

                    {/* XP Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{skill.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${isMaxed ? 100 : skill.progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={clsx(
                            "h-full rounded-full relative",
                            isMaxed ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{totalXP} XP</span>
                        <span>{skill.level}/{skill.maxLevel}</span>
                      </div>
                    </div>

                    {/* Practice Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); handlePractice(skill.id); }}
                      disabled={isMaxed}
                      className={clsx(
                        "w-full mt-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                        isMaxed 
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 cursor-default"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:shadow-xl"
                      )}
                    >
                      {isMaxed ? (
                        <><Trophy size={16} /> Mastered!</>
                      ) : (
                        <><Zap size={16} /> Practice (+20 XP)</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4"
              >
                <Sparkles size={36} className="text-purple-500" />
              </motion.div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {selectedCategory === 'All' ? 'No Skills Yet' : `No ${selectedCategory} Skills`}
              </h3>
              <p className="text-sm text-slate-500 mb-4">Add your first skill to start leveling up!</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium"
              >
                <Plus size={18} /> Add Skill
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 min-w-[160px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={() => {
                const skill = skills.find(s => s.id === contextMenu.skillId);
                if (skill) openEditModal(skill);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3"
            >
              <Edit2 size={16} /> Edit Skill
            </button>
            <button 
              onClick={() => handleDeleteSkill(contextMenu.skillId)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
              <Trash2 size={16} /> Delete Skill
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500 text-white">
                    {editingSkillId ? <Edit2 size={20} /> : <Plus size={20} />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingSkillId ? 'Edit Skill' : 'Add Skill'}
                  </h2>
                </div>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skill Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Guitar, React, Running"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icon</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      {Object.keys(ICONS).map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button onClick={handleCloseModal} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-medium">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSkill}
                  disabled={!formData.name}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold"
                >
                  {editingSkillId ? 'Save Changes' : 'Create Skill'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Modal */}
      <AnimatePresence>
        {isJournalOpen && selectedSkill && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedSkill.name}
                    <span className="text-sm font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Lvl {selectedSkill.level}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Track your progress and plan ahead.</p>
                </div>
                <button onClick={() => setIsJournalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Status</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['InProgress', 'Weak', 'Strong', 'Completed'].map((status) => (
                      <motion.button
                        key={status}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setJournalEntry({ ...journalEntry, status })}
                        className={clsx(
                          "py-2.5 px-3 rounded-xl font-bold text-sm transition-all",
                          journalEntry.status === status
                            ? status === 'Completed' ? "bg-emerald-500 text-white" :
                              status === 'Strong' ? "bg-blue-500 text-white" :
                              status === 'Weak' ? "bg-red-500 text-white" :
                              "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}
                      >
                        {status.replace(/([A-Z])/g, ' $1').trim()}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Journal Inputs */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Brain size={14} className="text-blue-500" /> What I Learned
                    </label>
                    <textarea
                      value={journalEntry.learned}
                      onChange={(e) => setJournalEntry({ ...journalEntry, learned: e.target.value })}
                      placeholder="Key takeaways..."
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Target size={14} className="text-amber-500" /> Next Goals
                    </label>
                    <textarea
                      value={journalEntry.plan}
                      onChange={(e) => setJournalEntry({ ...journalEntry, plan: e.target.value })}
                      placeholder="What's next?"
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* History */}
                {selectedSkill.logs?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Learning History</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedSkill.logs.map((log) => (
                        <div key={log.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-xs font-bold text-slate-400 mb-2">{format(new Date(log.date), 'MMM d, yyyy')}</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            {log.learned && <div><span className="text-blue-500 font-bold">Learned:</span> <span className="text-slate-600 dark:text-slate-300">{log.learned}</span></div>}
                            {log.plan && <div><span className="text-amber-500 font-bold">Plan:</span> <span className="text-slate-600 dark:text-slate-300">{log.plan}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsJournalOpen(false)} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-medium">
                  Close
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveJournal}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold"
                >
                  Save Entry
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SkillTreePage;
