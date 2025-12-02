import React, { useState } from 'react';
import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BookOpen, ListTodo, CheckSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotesSection from '../components/subjects/NotesSection';
import SyllabusSection from '../components/subjects/SyllabusSection';
import PYQSection from '../components/subjects/PYQSection';

const SubjectPage = () => {
  const { subjectCode } = useParams();
  const [searchParams] = useSearchParams();
  const { state, loading, updateSection } = useApp();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'notes');

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  if (!state.subjects[subjectCode]) {
    return <Navigate to="/" replace />;
  }

  const subject = state.subjects[subjectCode];
  
  const handleUpdateNotes = (newNotes) => {
    const updatedNotes = { ...state.notes, [subjectCode]: newNotes };
    updateSection('notes', updatedNotes);
  };

  const tabs = [
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus', icon: ListTodo },
    { id: 'pyq', label: 'PYQs', icon: CheckSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {subject.name}
            <span 
              className="text-sm font-medium px-3 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: subject.color }}
            >
              {subject.code}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your notes, syllabus, and questions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 pb-4 px-2 text-sm font-medium transition-colors relative
                ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'notes' && (
          <NotesSection 
            subjectCode={subjectCode} 
            notes={state.notes[subjectCode] || []} 
            onUpdate={handleUpdateNotes} 
          />
        )}
        {activeTab === 'syllabus' && (
          <SyllabusSection 
            subjectCode={subjectCode}
            syllabus={state.syllabus[subjectCode] || {}}
            onUpdate={(newSyllabus) => {
              const updatedSyllabus = { ...state.syllabus, [subjectCode]: newSyllabus };
              updateSection('syllabus', updatedSyllabus);
            }}
          />
        )}
        {activeTab === 'pyq' && (
          <PYQSection 
            subjectCode={subjectCode}
            questions={state.pyq[subjectCode] || []}
            onUpdate={(newQuestions) => {
              const updatedPyq = { ...state.pyq, [subjectCode]: newQuestions };
              updateSection('pyq', updatedPyq);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SubjectPage;
