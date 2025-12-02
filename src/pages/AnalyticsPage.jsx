import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from 'recharts';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

const AnalyticsPage = () => {
  const { state, loading } = useApp();

  if (loading || !state) return <div className="p-6 text-white">Loading...</div>;

  // --- Data Preparation ---

  // 1. Subject Performance (Bar Chart)
  // Calculate average score per subject based on grades
  const subjectPerformanceData = Object.values(state.subjects).map(subject => {
    const grades = state.grades?.[subject.code] || {};
    const total = (Number(grades.quiz1) || 0) + (Number(grades.quiz2) || 0) + 
                  (Number(grades.midSem) || 0) + (Number(grades.endSem) || 0) + 
                  (Number(grades.labViva) || 0) + (Number(grades.internal) || 0);
    return {
      name: subject.shortName || subject.code,
      fullMark: 100,
      score: total,
      fill: subject.color
    };
  });

  // 2. Grade Trends (Line Chart)
  // Mock data for now as we don't have historical semester data, but we can simulate "Quiz 1" vs "Quiz 2" vs "Mid Sem" progression for all subjects average
  const gradeTrendData = [
    { name: 'Quiz 1', avg: 0 },
    { name: 'Quiz 2', avg: 0 },
    { name: 'Mid Sem', avg: 0 },
    { name: 'End Sem', avg: 0 },
  ];

  // Calculate averages for trends
  let q1Sum = 0, q2Sum = 0, midSum = 0, endSum = 0;
  let count = 0;
  Object.values(state.subjects).forEach(subject => {
    const grades = state.grades?.[subject.code] || {};
    if (grades.quiz1) { q1Sum += (Number(grades.quiz1)/10)*100; } // Normalize to 100
    if (grades.quiz2) { q2Sum += (Number(grades.quiz2)/10)*100; }
    if (grades.midSem) { midSum += (Number(grades.midSem)/25)*100; }
    if (grades.endSem) { endSum += (Number(grades.endSem)/50)*100; }
    count++;
  });
  
  if (count > 0) {
    gradeTrendData[0].avg = Math.round(q1Sum / count);
    gradeTrendData[1].avg = Math.round(q2Sum / count);
    gradeTrendData[2].avg = Math.round(midSum / count);
    gradeTrendData[3].avg = Math.round(endSum / count);
  }

  // 3. Study Hours Distribution (Radar Chart) - Real Data
  const studyDistributionData = Object.values(state.subjects).map(subject => {
    const attendedHours = state.attendance?.[subject.code]?.attended || 0;
    // Assuming 1 credit = 15 hours per semester (standard academic measure)
    const plannedHours = subject.credits * 15; 
    
    return {
      subject: subject.shortName || subject.code,
      A: plannedHours, // Planned
      B: attendedHours, // Actual
      fullMark: Math.max(plannedHours, attendedHours) * 1.2, // Scale chart dynamically
    };
  });

  // 4. Productivity Heatmap - Real Data Aggregation
  const generateHeatmapData = () => {
    const today = new Date();
    const data = [];
    const activityMap = new Map();

    // Helper to add activity
    const addActivity = (dateStr, weight = 1) => {
      if (!dateStr) return;
      // Normalize date string to YYYY-MM-DD
      const dateKey = new Date(dateStr).toISOString().split('T')[0];
      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + weight);
    };

    // Aggregate from Attendance
    Object.values(state.attendance || {}).forEach(record => {
      if (record.history) {
        record.history.forEach(entry => addActivity(entry.date, 1));
      }
    });

    // Aggregate from Files
    Object.values(state.files || {}).forEach(fileList => {
      fileList.forEach(file => addActivity(file.date, 2)); // Files are worth more "effort"
    });

    // Aggregate from Tasks (if they have completion dates - assuming 'date' field for now)
    (state.tasks || []).forEach(task => {
      if (task.completed) addActivity(task.date, 1.5);
    });

    // Generate last 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const intensity = Math.min(1, (activityMap.get(dateKey) || 0) / 5); // Cap at 5 activities per day for max intensity
      data.push({ date: dateKey, intensity });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Smart Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Deep insights into your academic performance and productivity.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg Score</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {subjectPerformanceData.length > 0 
                ? Math.round(subjectPerformanceData.reduce((acc, curr) => acc + curr.score, 0) / subjectPerformanceData.length)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Study Hours</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {Object.values(state.attendance || {}).reduce((acc, curr) => acc + (curr.attended || 0), 0)}h
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Target size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tasks Done</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {(state.tasks || []).filter(t => t.completed).length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Award size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Best Subject</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[140px] mt-1">
              {subjectPerformanceData.sort((a,b) => b.score - a.score)[0]?.name || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Subject Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Trends */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Balance Radar */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Study Balance (Planned vs Actual)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={studyDistributionData}>
                <PolarGrid stroke="#334155" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} tick={false} axisLine={false} />
                <Radar name="Planned" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Radar name="Actual" dataKey="B" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Heatmap (Real) */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Productivity Heatmap (Last 12 Weeks)</h3>
          <div className="grid grid-cols-7 gap-2 h-[250px] content-center">
            {heatmapData.map((day, i) => {
              const intensity = day.intensity;
              return (
                <div 
                  key={i} 
                  className={`rounded-sm w-full h-full aspect-square transition-colors hover:ring-2 ring-offset-1 ring-offset-slate-900 ring-white ${
                    intensity > 0.8 ? 'bg-emerald-500' :
                    intensity > 0.6 ? 'bg-emerald-500/70' :
                    intensity > 0.4 ? 'bg-emerald-500/40' :
                    intensity > 0.2 ? 'bg-emerald-500/20' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}
                  title={`${day.date}: ${intensity > 0 ? 'Active' : 'No activity'}`}
                />
              );
            })}
          </div>
          <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-500">
            <span>Less</span>
            <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500/20 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500/70 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
