import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProgressCard from '../components/dashboard/ProgressCard';
import AttendanceCard from '../components/dashboard/AttendanceCard';
import QuickActions from '../components/dashboard/QuickActions';
import DashboardTasks from '../components/dashboard/DashboardTasks';
import ExamCountdown from '../components/dashboard/ExamCountdown';
import { Clock, Calendar, Flame, BookOpen, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { state, loading } = useApp();

  const nextClass = useMemo(() => {
    if (!state?.timetable) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = state.timetable[today] || [];
    
    if (todaySchedule.length === 0) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Find the first class that hasn't ended yet (simplified logic assuming sorted)
    // For a real app, parsing "09:00 AM" to minutes is needed.
    // Here we'll just take the first one for now as a placeholder for "Next" logic
    // or implement a simple parser if needed.
    
    // Simple parser for "HH:MM AM/PM"
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    };

    // This is a basic approximation. 
    return todaySchedule[0]; 
  }, [state?.timetable]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{state.userProfile.name}</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Ready to crush your goals today?</p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl"></div>
      </header>

      {/* Exam Countdown */}
      <ExamCountdown />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/schedule" className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{state.dashboard.stats.studyMinutesToday}m</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Studied Today</p>
          </div>
        </Link>
        <Link to="/schedule" className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5 group">
          <div className="p-3 bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{state.dashboard.stats.streakDays}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Day Streak</p>
          </div>
        </Link>
        <Link to="/attendance" className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{state.dashboard.stats.attendanceOverall}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Attendance</p>
          </div>
        </Link>
        <Link to="/syllabus" className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/5 group">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{state.dashboard.stats.syllabusCompleted}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Syllabus Done</p>
          </div>
        </Link>
      </div>

      {/* Main Content - Single Column */}
      <div className="space-y-6">
        <QuickActions />

        {/* Today's Schedule */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link to="/schedule" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="space-y-3">
            {(() => {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
              const todaySchedule = state.timetable?.[today] || [];
              
              if (todaySchedule.length > 0) {
                return todaySchedule.map((item, idx) => (
                  <Link 
                    key={item.id || idx} 
                    to={`/subject/${item.subject}`}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all rounded-xl border border-slate-200 dark:border-slate-700/30 group cursor-pointer hover:shadow-md hover:border-blue-500/30"
                  >
                    <div className="w-20 text-center shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.time.split(' - ')[0]}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{item.time.split(' - ')[1]}</p>
                    </div>
                    <div className="w-1 h-10 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {state.subjects[item.subject]?.name || item.subject}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium">{item.room}</span>
                        <span>•</span>
                        <span>{item.type}</span>
                      </div>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full shadow-lg shadow-black/50 shrink-0" 
                      style={{ backgroundColor: state.subjects[item.subject]?.color || '#3b82f6' }}
                    />
                  </Link>
                ));
              } else {
                return (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No classes scheduled for today.</p>
                    <Link to="/schedule" className="text-sm text-blue-500 hover:underline mt-2 inline-block">Manage Schedule</Link>
                  </div>
                );
              }
            })()}
          </div>
        </div>

        <DashboardTasks tasks={state.tasks || []} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressCard subjects={state.subjects} syllabus={state.syllabus} />
          
          <div className="space-y-6">
            <AttendanceCard attendance={state.attendance} subjects={state.subjects} />
            
            {/* PYQ Mini Status */}
            <Link to="/pyq" className="block bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all group hover:shadow-lg hover:shadow-purple-500/5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">PYQ Status</h3>
              <div className="flex items-center justify-center p-4">
                <div className="text-center">
                  {(() => {
                    const allQuestions = Object.values(state.pyq || {}).flat();
                    const totalQuestions = allQuestions.length;
                    const masteredQuestions = allQuestions.filter(q => q.status === 'mastered').length;
                    const progress = totalQuestions > 0 ? (masteredQuestions / totalQuestions) * 100 : 0;

                    return (
                      <>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {masteredQuestions}
                          <span className="text-lg text-slate-500 dark:text-slate-500">/{totalQuestions}</span>
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Questions Solved</p>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
