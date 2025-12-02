import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SyllabusSection from '../components/subjects/SyllabusSection';
import { Search, Filter, ChevronDown } from 'lucide-react';

const SyllabusPage = () => {
  const { state, loading, updateSection } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'incomplete', 'completed'

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  const handleUpdateSyllabus = (subjectCode, newSyllabus) => {
    const updatedSyllabus = { ...state.syllabus, [subjectCode]: newSyllabus };
    updateSection('syllabus', updatedSyllabus);
  };

  // Filter subjects based on search
  const filteredSubjects = Object.keys(state.subjects).filter(code => {
    const subject = state.subjects[code];
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          subject.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Master Syllabus Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress across all subjects in one place.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
          />
        </div>
      </header>

      <div className="space-y-4">
        {filteredSubjects.map(code => {
          const subject = state.subjects[code];
          const isExpanded = expandedSubject === code;
          
          // Calculate progress for the header
          const subjectSyllabus = state.syllabus[code] || {};
          let totalTopics = 0;
          let completedTopics = 0;
          Object.values(subjectSyllabus).forEach(unit => {
            totalTopics += unit.topics.length;
            completedTopics += unit.topics.filter(t => t.status === 'completed').length;
          });
          const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

          return (
            <div key={code} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => setExpandedSubject(isExpanded ? null : code)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.shortName ? subject.shortName.substring(0, 2) : subject.code.substring(0, 2)}
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {subject.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{subject.code}</span>
                      <span>•</span>
                      <span>{progress}% Complete</span>
                    </div>
                  </div>
                </div>
                <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              
              <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <SyllabusSection 
                      subjectCode={code}
                      syllabus={state.syllabus[code] || {}}
                      onUpdate={(newSyllabus) => handleUpdateSyllabus(code, newSyllabus)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No subjects found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusPage;
