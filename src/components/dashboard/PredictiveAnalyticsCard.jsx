import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import AIService from '../../services/AIService';
import { clsx } from 'clsx';

const PredictiveAnalyticsCard = ({ state }) => {
  const prediction = useMemo(() => {
    return AIService.predictPerformance(state.attendance || {}, state.skills || []);
  }, [state.attendance, state.skills]);

  const scoreColor = prediction.score >= 80 ? 'text-emerald-500' : 
                     prediction.score >= 60 ? 'text-blue-500' : 
                     'text-amber-500';
  
  const progressColor = prediction.score >= 80 ? 'bg-emerald-500' : 
                        prediction.score >= 60 ? 'bg-blue-500' : 
                        'bg-amber-500';

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className={clsx("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-20", progressColor)} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-purple-500" size={20} />
            AI Success Score
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Predicted academic performance</p>
        </div>
        <div className={clsx("text-2xl font-black", scoreColor)}>
          {Math.round(prediction.score)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div 
          className={clsx("h-full rounded-full transition-all duration-1000 ease-out relative", progressColor)}
          style={{ width: `${prediction.score}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* Insight */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
        <div className="flex gap-3">
          <div className="mt-0.5">
            {prediction.score >= 80 ? <TrendingUp size={18} className="text-emerald-500" /> :
             prediction.score >= 60 ? <CheckCircle2 size={18} className="text-blue-500" /> :
             <AlertCircle size={18} className="text-amber-500" />}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {prediction.insight}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsCard;
