import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, BookOpen, CheckCircle2, Target, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const ExamModePage = () => {
  const { state, loading } = useApp();
  const [activePlan, setActivePlan] = useState(null); // 3, 7, or 15 days

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  // Logic to find weak areas (incomplete topics + unmastered PYQs)
  const weakAreas = Object.entries(state.syllabus).flatMap(([subjectCode, units]) => {
    const incompleteTopics = Object.entries(units).flatMap(([unitName, unitData]) => 
      unitData.topics.filter(t => t.status !== 'completed').map(t => ({
        subject: subjectCode,
        unit: unitName,
        topic: t.name,
        type: 'topic'
      }))
    );
    return incompleteTopics;
  });

  const unmasteredPYQs = Object.entries(state.pyq).flatMap(([subjectCode, questions]) => 
    questions.filter(q => q.status !== 'mastered').map(q => ({
      subject: subjectCode,
      question: q.question,
      year: q.year,
      type: 'pyq'
    }))
  );

  const generatePlan = (days) => {
    setActivePlan(days);
    
    const totalItems = weakAreas.length + unmasteredPYQs.length;
    const itemsPerDay = Math.ceil(totalItems / days);
    
    const plan = [];
    let topicIndex = 0;
    let pyqIndex = 0;

    for (let i = 1; i <= days; i++) {
      const dayPlan = {
        day: i,
        topics: [],
        pyqs: []
      };

      // Distribute topics
      let dailyTopicCount = 0;
      while (dailyTopicCount < Math.ceil(weakAreas.length / days) && topicIndex < weakAreas.length) {
        dayPlan.topics.push(weakAreas[topicIndex]);
        topicIndex++;
        dailyTopicCount++;
      }

      // Distribute PYQs
      let dailyPyqCount = 0;
      while (dailyPyqCount < Math.ceil(unmasteredPYQs.length / days) && pyqIndex < unmasteredPYQs.length) {
        dayPlan.pyqs.push(unmasteredPYQs[pyqIndex]);
        pyqIndex++;
        dailyPyqCount++;
      }

      plan.push(dayPlan);
    }
    
    setGeneratedSchedule(plan);
  };

  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20">
        <div className="inline-flex p-4 bg-red-500/10 rounded-full text-red-500 dark:text-red-400 mb-4">
          <Target size={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Exam Preparation Mode</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Activate focused revision strategies. We've analyzed your syllabus and PYQs to create the perfect study plan.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Weak Areas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-orange-400" />
              Priority Focus Areas
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Incomplete Topics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {weakAreas.length > 0 ? (
                    weakAreas.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{item.topic}</p>
                          <p className="text-xs text-slate-500">{item.subject} • {item.unit}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No incomplete topics found! Great job.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Unmastered PYQs</h4>
                <div className="space-y-2">
                  {unmasteredPYQs.length > 0 ? (
                    unmasteredPYQs.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <p className="font-medium text-slate-900 dark:text-white text-sm mb-1">{item.question}</p>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">{item.subject}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">{item.year}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">All PYQs mastered!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Revision Plan */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="text-blue-400" />
              Revision Strategy
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[3, 7, 15].map(days => (
                <button
                  key={days}
                  onClick={() => generatePlan(days)}
                  className={clsx(
                    "py-3 rounded-xl font-bold text-sm transition-all border",
                    activePlan === days 
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {days} Days
                </button>
              ))}
            </div>

            {generatedSchedule ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {generatedSchedule.map((day) => (
                  <div key={day.day} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">Day {day.day} Target</h4>
                    
                    {day.topics.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Topics</p>
                        <ul className="space-y-1">
                          {day.topics.map((t, i) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                              <span>{t.topic} <span className="text-slate-500 text-xs">({t.subject})</span></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {day.pyqs.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">PYQs</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Practice {day.pyqs.length} questions from {day.pyqs.map(p => p.subject).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                        </p>
                      </div>
                    )}

                    {day.topics.length === 0 && day.pyqs.length === 0 && (
                      <p className="text-sm text-emerald-400">Free Day / Revision!</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Select a duration to generate your personalized revision plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamModePage;
