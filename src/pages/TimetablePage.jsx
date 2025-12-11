import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  X, 
  Clock, 
  MapPin, 
  BookOpen,
  ChevronRight,
  GraduationCap,
  FlaskConical,
  Users,
  MoreVertical,
  Edit2,
  Coffee,
  Sparkles
} from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';
import { clsx } from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Class type icons and colors
const CLASS_TYPES = {
  Lecture: { icon: GraduationCap, color: '#3b82f6', bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
  Lab: { icon: FlaskConical, color: '#8b5cf6', bg: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600' },
  Tutorial: { icon: Users, color: '#f59e0b', bg: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600' }
};

// Class Card Component
const ClassCard = ({ slot, subject, onDelete, onEdit, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const typeConfig = CLASS_TYPES[slot.type] || CLASS_TYPES.Lecture;
  const TypeIcon = typeConfig.icon;
  const subjectColor = subject?.color || typeConfig.color;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all"
    >
      {/* Colored Top Border */}
      <div 
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${subjectColor}, ${subjectColor}88)` }}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Time Column */}
          <div className="shrink-0 text-center">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: subjectColor }}
            >
              <TypeIcon size={24} className="text-white" />
            </motion.div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-wider">
              {slot.type}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                  {subject?.name || slot.subject}
                </h4>
                <p 
                  className="text-xs font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: `${subjectColor}15`, color: subjectColor }}
                >
                  {subject?.shortName || slot.subject}
                </p>
              </div>

              {/* Menu Button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <MoreVertical size={18} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-10 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 min-w-[120px] overflow-hidden"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span className="font-mono font-medium">{slot.time}</span>
              </div>
              {slot.room && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin size={14} />
                  <span className="font-medium">{slot.room}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TimetablePage = () => {
  const { state, loading, updateSection } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const todayIndex = new Date().getDay() === 0 ? 0 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(DAYS[Math.min(todayIndex, 5)]);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({
    subject: '',
    startTime: '',
    endTime: '',
    room: '',
    type: 'Lecture'
  });

  const timetable = state?.timetable || {};
  const subjects = state?.subjects || {};
  const todayName = DAYS[Math.min(todayIndex, 5)];

  const subjectOptions = Object.keys(subjects).map(code => ({
    value: code,
    label: subjects[code].name
  }));

  const typeOptions = [
    { value: 'Lecture', label: 'Lecture' },
    { value: 'Lab', label: 'Lab' },
    { value: 'Tutorial', label: 'Tutorial' }
  ];

  // Calculate stats
  const stats = useMemo(() => {
    let totalClasses = 0;
    let totalHours = 0;
    DAYS.forEach(day => {
      const classes = timetable[day] || [];
      totalClasses += classes.length;
      classes.forEach(c => {
        const [start, end] = c.time.split(' - ');
        if (start && end) {
          const [sh, sm] = start.split(':').map(Number);
          const [eh, em] = end.split(':').map(Number);
          totalHours += (eh * 60 + em - sh * 60 - sm) / 60;
        }
      });
    });
    return { totalClasses, totalHours: Math.round(totalHours) };
  }, [timetable]);

  if (loading) {
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

  if (!state) return null;

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.startTime || !newClass.endTime) return;

    const updatedTimetable = { ...timetable };
    if (!updatedTimetable[selectedDay]) updatedTimetable[selectedDay] = [];

    if (editingClass) {
      const index = updatedTimetable[selectedDay].findIndex(c => c.id === editingClass.id);
      if (index !== -1) {
        updatedTimetable[selectedDay][index] = {
          ...editingClass,
          subject: newClass.subject,
          time: `${newClass.startTime} - ${newClass.endTime}`,
          room: newClass.room,
          type: newClass.type
        };
      }
    } else {
      updatedTimetable[selectedDay].push({
        id: Date.now().toString(),
        subject: newClass.subject,
        time: `${newClass.startTime} - ${newClass.endTime}`,
        room: newClass.room,
        type: newClass.type
      });
    }

    updatedTimetable[selectedDay].sort((a, b) => a.time.localeCompare(b.time));
    updateSection('timetable', updatedTimetable);
    closeModal();
  };

  const handleDeleteClass = (day, id) => {
    const updatedTimetable = { ...timetable };
    updatedTimetable[day] = updatedTimetable[day].filter(c => c.id !== id);
    updateSection('timetable', updatedTimetable);
  };

  const openEditModal = (day, classItem) => {
    setSelectedDay(day);
    setEditingClass(classItem);
    const [startTime, endTime] = classItem.time.split(' - ');
    setNewClass({
      subject: classItem.subject,
      startTime,
      endTime,
      room: classItem.room || '',
      type: classItem.type
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setNewClass({ subject: '', startTime: '', endTime: '', room: '', type: 'Lecture' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
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
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-15 animate-float-delayed" />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
          >
            <Calendar size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
              Weekly Schedule
            </span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Your{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Timetable
                </span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Manage your weekly class schedule with ease.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              Add Class
            </motion.button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Classes Today', value: (timetable[todayName] || []).length, color: 'from-blue-500 to-cyan-500' },
              { label: 'Total Classes', value: stats.totalClasses, color: 'from-emerald-500 to-teal-500' },
              { label: 'Hours/Week', value: stats.totalHours, color: 'from-purple-500 to-pink-500' },
              { label: 'Subjects', value: Object.keys(subjects).length, color: 'from-amber-500 to-orange-500' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
              >
                <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Day Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DAYS.map((day) => (
          <motion.button
            key={day}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedDay(day)}
            className={clsx(
              "px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all relative",
              selectedDay === day 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            {day}
            {day === todayName && (
              <span className="ml-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
            {(timetable[day] || []).length > 0 && selectedDay !== day && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {(timetable[day] || []).length}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Classes List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {(timetable[selectedDay] || []).length > 0 ? (
            (timetable[selectedDay] || [])
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((slot, index) => (
                <ClassCard
                  key={slot.id}
                  slot={slot}
                  subject={subjects[slot.subject]}
                  onDelete={() => handleDeleteClass(selectedDay, slot.id)}
                  onEdit={() => openEditModal(selectedDay, slot)}
                  index={index}
                />
              ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4"
              >
                <Coffee size={36} className="text-blue-500" />
              </motion.div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Free Day!</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto px-4">
                No classes scheduled for {selectedDay}. Use this time to catch up on assignments or relax.
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Add a class
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                    {editingClass ? <Edit2 size={20} /> : <Plus size={20} />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingClass ? 'Edit Class' : 'Add Class'}
                  </h2>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddClass} className="space-y-5">
                {/* Day Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Day</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all font-bold",
                          selectedDay === day 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                  <CustomSelect 
                    value={newClass.subject}
                    onChange={(val) => setNewClass({...newClass, subject: val})}
                    options={subjectOptions}
                    placeholder="Select Subject"
                  />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        value={newClass.startTime}
                        onChange={e => setNewClass({...newClass, startTime: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        value={newClass.endTime}
                        onChange={e => setNewClass({...newClass, endTime: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Room & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={newClass.room}
                        onChange={e => setNewClass({...newClass, room: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                        placeholder="e.g. LH-101"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                    <CustomSelect 
                      value={newClass.type}
                      onChange={(val) => setNewClass({...newClass, type: val})}
                      options={typeOptions}
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg mt-4"
                >
                  {editingClass ? 'Update Class' : 'Add to Timetable'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimetablePage;
