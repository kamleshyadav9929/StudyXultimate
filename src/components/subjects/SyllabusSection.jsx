import React from 'react';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

const SyllabusSection = ({ subjectCode, syllabus, onUpdate }) => {
  const [expandedUnits, setExpandedUnits] = React.useState({});

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
    
    // Deep clone to avoid mutation
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus));
    const topicIndex = updatedSyllabus[unitName].topics.findIndex(t => t.id === topicId);
    
    if (topicIndex !== -1) {
      updatedSyllabus[unitName].topics[topicIndex].status = newStatus;
      onUpdate(updatedSyllabus);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'in-progress': return <Clock className="text-yellow-500" size={20} />;
      default: return <Circle className="text-slate-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'in-progress': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      default: return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400';
    }
  };

  // Calculate overall progress
  let totalTopics = 0;
  let completedTopics = 0;
  Object.values(syllabus).forEach(unit => {
    totalTopics += unit.topics.length;
    completedTopics += unit.topics.filter(t => t.status === 'completed').length;
  });
  const overallProgress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {/* Progress Header */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Syllabus Progress</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Track your completion status topic by topic</p>
          </div>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {Object.entries(syllabus).map(([unitName, unitData]) => (
          <div key={unitName} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button 
              onClick={() => toggleUnit(unitName)}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  {expandedUnits[unitName] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{unitName}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{unitData.title}</p>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {unitData.topics.filter(t => t.status === 'completed').length}/{unitData.topics.length} Done
              </div>
            </button>

            {expandedUnits[unitName] && (
              <div className="border-t border-slate-200 dark:border-slate-800 p-2">
                {unitData.topics.map((topic) => (
                  <div 
                    key={topic.id}
                    onClick={() => handleStatusChange(unitName, topic.id, topic.status)}
                    className={clsx(
                      "flex items-center justify-between p-3 m-1 rounded-xl cursor-pointer transition-all border",
                      getStatusColor(topic.status),
                      "hover:brightness-110"
                    )}
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">{topic.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                        {topic.status.replace('-', ' ')}
                      </span>
                      {getStatusIcon(topic.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusSection;
