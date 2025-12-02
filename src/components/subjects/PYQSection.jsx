import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, HelpCircle, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

const PYQSection = ({ subjectCode, questions, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ 
    question: '', 
    year: '', 
    marks: '', 
    difficulty: 'medium',
    tags: '' 
  });

  const handleAddQuestion = () => {
    if (!newQuestion.question) return;

    const question = {
      id: uuidv4(),
      question: newQuestion.question,
      year: newQuestion.year,
      marks: newQuestion.marks,
      difficulty: newQuestion.difficulty,
      tags: newQuestion.tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'not-done'
    };

    onUpdate([...questions, question]);
    setNewQuestion({ question: '', year: '', marks: '', difficulty: 'medium', tags: '' });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    onUpdate(questions.filter(q => q.id !== id));
  };

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = {
      'not-done': 'practiced',
      'practiced': 'mastered',
      'mastered': 'not-done'
    };

    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, status: nextStatus[currentStatus] } : q
    );
    onUpdate(updatedQuestions);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'mastered': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'practiced': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      default: return 'bg-slate-800/50 border-slate-700 text-slate-400';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'hard': return 'text-red-400 bg-red-500/10';
      case 'medium': return 'text-orange-400 bg-orange-500/10';
      case 'easy': return 'text-green-400 bg-green-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Previous Year Questions</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <textarea
            placeholder="Question text..."
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Year (e.g. 2023)"
              value={newQuestion.year}
              onChange={(e) => setNewQuestion({ ...newQuestion, year: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Marks"
              value={newQuestion.marks}
              onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <select
              value={newQuestion.difficulty}
              onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input
              type="text"
              placeholder="Tags"
              value={newQuestion.tags}
              onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddQuestion}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Save Question
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q) => (
            <div 
              key={q.id} 
              className={clsx(
                "p-4 rounded-xl border transition-all hover:brightness-110",
                getStatusColor(q.status)
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={clsx("text-xs font-bold px-2 py-0.5 rounded uppercase", getDifficultyColor(q.difficulty))}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{q.year} • {q.marks} Marks</span>
                    {(q.tags || []).map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                  <p className="font-medium text-white/90">{q.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(q.id, q.status)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Toggle Status"
                  >
                    {q.status === 'mastered' ? <CheckCircle2 className="text-emerald-400" size={20} /> :
                     q.status === 'practiced' ? <HelpCircle className="text-yellow-400" size={20} /> :
                     <Circle className="text-slate-500" size={20} />}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <HelpCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p>No questions added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQSection;
