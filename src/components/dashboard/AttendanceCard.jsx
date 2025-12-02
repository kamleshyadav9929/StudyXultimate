import React from 'react';
import { Link } from 'react-router-dom';

const AttendanceCard = ({ attendance, subjects }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">Attendance</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(attendance).map(subjectCode => {
          const { total, attended } = attendance[subjectCode];
          const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);
          const color = subjects[subjectCode]?.color || '#cbd5e1';
          const isLow = percentage < 75;

          return (
            <Link key={subjectCode} to="/attendance" className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{subjects[subjectCode]?.shortName || subjectCode}</span>
                <span className={`text-xs font-bold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {attended}/{total} classes
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceCard;
