import React, { useMemo } from 'react';
import { Sun, Moon, Coffee, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const DailyBriefing = ({ state }) => {
  const briefing = useMemo(() => {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    let Icon = Sun;
    
    if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
      Icon = Sun;
    } else if (hour >= 17) {
      greeting = 'Good Evening';
      Icon = Moon;
    }

    // Get today's classes
    const today = format(new Date(), 'EEEE'); // e.g., "Monday"
    const todayClasses = state.timetable[today] || [];
    const classCount = todayClasses.length;

    // Get low attendance subjects
    const lowAttendanceSubjects = Object.entries(state.attendance).filter(([_, data]) => {
      if (data.total === 0) return false;
      return (data.attended / data.total) * 100 < 75;
    });

    // Get urgent tasks (due today or tomorrow)
    const urgentTasks = state.tasks.filter(task => {
      if (task.completed) return false;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      return task.dueDate <= todayStr;
    });

    return {
      greeting,
      Icon,
      classCount,
      lowAttendanceCount: lowAttendanceSubjects.length,
      urgentTaskCount: urgentTasks.length,
      firstClass: todayClasses[0]
    };
  }, [state]);

  return (
    <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-sm backdrop-blur-md border border-white/20 dark:border-white/10">
            <briefing.Icon size={24} className="text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                {briefing.greeting}, Scholar!
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {briefing.classCount > 0 ? (
                <>
                  <span className="font-bold text-slate-900 dark:text-white">{briefing.classCount} classes</span> today
                  {briefing.firstClass && (
                    <>
                      , starting with <span className="font-bold text-blue-600 dark:text-blue-400">{state.subjects[briefing.firstClass.subject]?.name || briefing.firstClass.subject}</span> at {briefing.firstClass.time}
                    </>
                  )}
                </>
              ) : (
                "No classes today! Enjoy your free time."
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {briefing.urgentTaskCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={14} className="text-red-500 dark:text-red-400" />
              <span className="text-xs font-bold text-red-700 dark:text-red-300">{briefing.urgentTaskCount} due</span>
            </div>
          )}
          
          {briefing.lowAttendanceCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle size={14} className="text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{briefing.lowAttendanceCount} low attendance</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Attendance good</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyBriefing;
