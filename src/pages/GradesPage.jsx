import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Save, Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const GradesPage = () => {
  const { state, loading, updateSection } = useApp();
  const [grades, setGrades] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (state?.grades) {
      setGrades(state.grades);
    }
  }, [state]);

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  const handleScoreChange = (subjectCode, examType, value) => {
    // Find max marks for this field
    let max = 100;
    if (examType === 'quiz1' || examType === 'quiz2') max = 10;
    if (examType === 'midSem') max = 25;
    if (examType === 'endSem') max = 50;
    if (examType === 'labViva' || examType === 'internal') max = 5;

    const numValue = value === '' ? '' : Math.min(max, Math.max(0, Number(value)));
    
    setGrades(prev => ({
      ...prev,
      [subjectCode]: {
        ...(prev[subjectCode] || {}),
        [examType]: numValue
      }
    }));
    setHasChanges(true);
  };

  const saveGrades = () => {
    updateSection('grades', grades);
    setHasChanges(false);
  };

  const calculateTotal = (subjectGrades) => {
    if (!subjectGrades) return 0;
    const { quiz1, quiz2, midSem, endSem, labViva, internal } = subjectGrades;
    
    const q1 = Number(quiz1) || 0;
    const q2 = Number(quiz2) || 0;
    const mid = Number(midSem) || 0;
    const end = Number(endSem) || 0;
    const lab = Number(labViva) || 0;
    const int = Number(internal) || 0;
    
    return q1 + q2 + mid + end + lab + int;
  };

  const getGradeColor = (total) => {
    if (total >= 90) return 'text-emerald-500';
    if (total >= 75) return 'text-blue-500';
    if (total >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isLabSubject = (subject) => {
    return subject.name.toLowerCase().includes('lab') || subject.shortName.toLowerCase().includes('lab');
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Performance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your scores and analyze your progress.</p>
        </div>
        {hasChanges && (
          <button
            onClick={saveGrades}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 animate-in fade-in slide-in-from-right-4"
          >
            <Save size={20} />
            Save Changes
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {Object.values(state.subjects).map((subject) => {
          const subjectGrades = grades[subject.code] || {};
          const total = calculateTotal(subjectGrades);
          const isLab = isLabSubject(subject);

          const examFields = [
            { id: 'quiz1', label: 'Quiz 1', max: 10 },
            { id: 'quiz2', label: 'Quiz 2', max: 10 },
            { id: 'midSem', label: 'Mid Sem', max: 25 },
            { id: 'endSem', label: 'End Sem', max: 50 },
          ];

          if (isLab) {
            examFields.push({ id: 'labViva', label: 'Lab Viva', max: 5 });
          } else {
            examFields.push({ id: 'internal', label: 'Internal', max: 5 });
          }

          return (
            <div key={subject.code} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.shortName ? subject.shortName.substring(0, 2) : subject.code.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{subject.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subject.code} • {subject.credits} Credits</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Score</p>
                    <p className={clsx("text-2xl font-bold", getGradeColor(total))}>{total}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Grade (Est)</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {total >= 90 ? 'O' : total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B+' : total >= 50 ? 'B' : 'F'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {examFields.map((exam) => (
                  <div key={exam.id} className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {exam.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={exam.max}
                        placeholder={`/ ${exam.max}`}
                        value={subjectGrades[exam.id] || ''}
                        onChange={(e) => handleScoreChange(subject.code, exam.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        / {exam.max}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GradesPage;
