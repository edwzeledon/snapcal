import React, { useState } from 'react';
import { Flame, Sparkles, Check, X, Beef, Wheat, Droplet, Brain } from 'lucide-react';

const CircleChart = ({ value, max, color, label, icon: Icon, onClick }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - (percent * circumference);

  return (
    <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={onClick}>
      <div className="relative w-48 h-48 lg:w-40 lg:h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-slate-100"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-6 h-6 mb-1 ${color.replace('text-', 'text-opacity-80 text-')}`} />
          <span className="text-2xl font-bold text-slate-700">{value}</span>
          <span className="text-xs text-slate-400 font-medium">/ {max}</span>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            {max - value > 0 ? `${max - value} left` : `${value - max} over`}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">{label}</span>
    </div>
  );
};

export default function DailyProgress({ caloriesToday, dailyGoal, macroGoals, todaysLogs, onUpdateGoal, onSuggestMeal, onAnalyzeDay }) {
  const remaining = dailyGoal - caloriesToday;
  const [editingGoal, setEditingGoal] = useState(null);
  const [tempGoalValue, setTempGoalValue] = useState('');

  // Calculate Macros
  const macros = todaysLogs.reduce((acc, log) => ({
    protein: acc.protein + (parseInt(log.protein) || 0),
    carbs: acc.carbs + (parseInt(log.carbs) || 0),
    fats: acc.fats + (parseInt(log.fats) || 0)
  }), { protein: 0, carbs: 0, fats: 0 });

  // Default goals if not provided
  const currentGoals = {
    calories: dailyGoal,
    protein: macroGoals?.protein || Math.round((dailyGoal * 0.3) / 4),
    carbs: macroGoals?.carbs || Math.round((dailyGoal * 0.4) / 4),
    fats: macroGoals?.fats || Math.round((dailyGoal * 0.3) / 9)
  };

  const handleStartEdit = (type, value) => {
    setEditingGoal(type);
    setTempGoalValue(value.toString());
  };

  const handleSaveGoal = () => {
    if (editingGoal === 'calories') {
      onUpdateGoal({ dailyGoal: parseInt(tempGoalValue) });
    } else {
      onUpdateGoal({ [`${editingGoal}Goal`]: parseInt(tempGoalValue) });
    }
    setEditingGoal(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50"></div>
      
      <div className="relative z-10 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daily Progress</h2>
            <p className="text-slate-500 text-sm">Tap any ring to edit your goal</p>
          </div>
          {editingGoal && (
            <div className="flex items-center gap-2 bg-white shadow-lg border border-indigo-100 p-2 rounded-xl animate-in slide-in-from-right-4">
              <span className="text-xs font-bold text-indigo-600 uppercase">{editingGoal} Goal:</span>
              <input 
                type="number" 
                value={tempGoalValue}
                onChange={e => setTempGoalValue(e.target.value)}
                className="w-20 px-2 py-1 rounded border border-indigo-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button onClick={handleSaveGoal} className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => setEditingGoal(null)} className="text-slate-400 hover:text-slate-600 p-1.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          <CircleChart 
            value={caloriesToday} 
            max={currentGoals.calories} 
            color="text-indigo-500" 
            label="Calories" 
            icon={Flame}
            onClick={() => handleStartEdit('calories', currentGoals.calories)}
          />
          <CircleChart 
            value={macros.protein} 
            max={currentGoals.protein} 
            color="text-blue-500" 
            label="Protein" 
            icon={Beef}
            onClick={() => handleStartEdit('protein', currentGoals.protein)}
          />
          <CircleChart 
            value={macros.carbs} 
            max={currentGoals.carbs} 
            color="text-amber-500" 
            label="Carbs" 
            icon={Wheat}
            onClick={() => handleStartEdit('carbs', currentGoals.carbs)}
          />
          <CircleChart 
            value={macros.fats} 
            max={currentGoals.fats} 
            color="text-rose-500" 
            label="Fats" 
            icon={Droplet}
            onClick={() => handleStartEdit('fats', currentGoals.fats)}
          />
        </div>
      </div>

      {/* AI Suggestion Buttons */}
      <div className="mt-2 pt-4 border-t border-slate-50 flex gap-3">
        <button 
          onClick={onSuggestMeal}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          {remaining > 0 ? "Chef's Suggestion" : "Diet Rescue"}
        </button>
        <button 
          onClick={onAnalyzeDay}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 active:scale-95"
        >
          <Brain className="w-4 h-4" />
          Daily Overview
        </button>
      </div>
    </div>
  );
}
