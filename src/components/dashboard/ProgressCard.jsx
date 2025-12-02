import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ProgressCard = ({ subjects, syllabus }) => {
  // Calculate overall progress for each subject
  const data = Object.keys(subjects).map(subjectCode => {
    const subjectSyllabus = syllabus[subjectCode] || {};
    let totalTopics = 0;
    let completedTopics = 0;

    Object.values(subjectSyllabus).forEach(unit => {
      if (unit.topics) {
        totalTopics += unit.topics.length;
        completedTopics += unit.topics.filter(t => t.status === 'completed').length;
      }
    });

    const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
    
    return {
      name: subjects[subjectCode]?.shortName || subjects[subjectCode]?.name || subjectCode,
      value: percentage,
      color: subjects[subjectCode]?.color
    };
  });

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">Syllabus Progress</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <Link key={item.name} to={`/subject/${item.name}?tab=syllabus`} className="block space-y-2 group cursor-pointer">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{item.name}</span>
              <span className="text-slate-400">{item.value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProgressCard;
