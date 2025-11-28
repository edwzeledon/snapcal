'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, TrendingUp, Brain, Trash2, Loader2, X, Edit2, Check, Beef, Wheat, Droplet } from 'lucide-react';
import { callGeminiText, deleteLog } from '@/lib/api';

const MacroCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className={`flex-1 ${bgColor} p-3 rounded-2xl flex flex-col items-center justify-center gap-1 min-w-[100px]`}>
    <div className={`p-1.5 bg-white rounded-lg ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <span className={`text-sm font-bold ${color}`}>{value}g</span>
    <span className="text-[10px] uppercase font-semibold text-slate-400">{label}</span>
  </div>
);

export default function Dashboard({ caloriesToday, dailyGoal, percentComplete, weeklyData, todaysLogs, user, onLogDeleted, onUpdateGoal, onEditLog }) {
  const remaining = dailyGoal - caloriesToday;
  const [aiModal, setAiModal] = useState({ open: false, type: '', content: '', loading: false });
  const [editGoal, setEditGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());

  // Calculate Macros
  const macros = todaysLogs.reduce((acc, log) => ({
    protein: acc.protein + (parseInt(log.protein) || 0),
    carbs: acc.carbs + (parseInt(log.carbs) || 0),
    fats: acc.fats + (parseInt(log.fats) || 0)
  }), { protein: 0, carbs: 0, fats: 0 });

  const handleSaveGoal = () => {
    onUpdateGoal(tempGoal);
    setEditGoal(false);
  };

  const handleDeleteLog = async (logId) => {
    if(!user) return;
    try {
      await deleteLog(logId, user.id);
      if (onLogDeleted) onLogDeleted();
    } catch (e) {
      console.error("Error deleting", e);
    }
  };

  const handleSuggestMeal = async () => {
    setAiModal({ open: true, type: 'suggestion', content: '', loading: true });
    try {
      const history = todaysLogs.map(l => `${l.food_item} (${l.calories} cal)`).join(', ');
      const prompt = `
        I am a user tracking my calories. 
        My daily goal is ${dailyGoal} calories. 
        So far today I have eaten: ${history || 'nothing yet'}. 
        I have ${remaining} calories remaining in my budget. 
        
        Please suggest ONE specific, tasty, and healthy meal or snack option that fits perfectly into my remaining calorie budget. 
        Do not suggest something that exceeds the limit significantly.
        If I have very few calories left (less than 100), suggest a tea or very light snack.
        
        Keep the response friendly and formatted like this:
        "🍽️ [Meal Name] ([Approx Calories] cal)
        
        [Short appetizing description of why this is good for me right now]"
      `;
      const result = await callGeminiText(prompt);
      setAiModal(prev => ({ ...prev, content: result, loading: false }));
    } catch (error) {
      setAiModal(prev => ({ ...prev, content: "Sorry, I couldn't cook up a suggestion right now.", loading: false }));
    }
  };

  const handleAnalyzeDay = async () => {
    setAiModal({ open: true, type: 'analysis', content: '', loading: true });
    try {
      const history = todaysLogs.map(l => `${l.food_item} (${l.calories} cal)`).join(', ');
      const prompt = `
        Act as a friendly, encouraging nutritionist coach.
        Analyze my food log for today: ${history || 'nothing logged yet'}.
        My goal is ${dailyGoal} calories and I have consumed ${caloriesToday}.
        
        Provide a 2-3 sentence summary. 
        1. Give me positive reinforcement.
        2. Give me one specific nutritional tip based on what I ate (e.g., "Great protein, but watch the sugar" or "Good job staying under, try to eat more fiber").
        Use emojis. Be concise.
      `;
      const result = await callGeminiText(prompt);
      setAiModal(prev => ({ ...prev, content: result, loading: false }));
    } catch (error) {
      setAiModal(prev => ({ ...prev, content: "Sorry, I couldn't analyze your data right now.", loading: false }));
    }
  };

  return (
    <div className="p-6 md:p-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      
      {/* Daily Progress Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50"></div>
        
        <div className="flex justify-between items-end relative z-10 mb-2">
          <div>
            <div className="text-slate-500 font-medium mb-1 flex items-center gap-2">
              Calories Today
              {editGoal ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={tempGoal}
                    onChange={e => setTempGoal(e.target.value)}
                    className="w-20 px-2 py-0.5 rounded border border-indigo-200 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button onClick={handleSaveGoal} className="bg-indigo-600 text-white p-1 rounded-md">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setTempGoal(dailyGoal.toString()); setEditGoal(true); }} className="text-slate-300 hover:text-indigo-600 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
              {caloriesToday}
              <span className="text-lg text-slate-400 font-normal ml-2">/ {dailyGoal}</span>
            </h2>
          </div>
          <div className="text-right">
             <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
               <Flame className="w-3 h-3 fill-current" />
               {remaining > 0 ? `${remaining} Left` : `${Math.abs(remaining)} Over`}
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div 
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
              remaining < 0 ? 'bg-red-500' : 'bg-linear-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Macros Row */}
        <div className="flex gap-3 relative z-10">
          <MacroCard 
            icon={Beef} 
            label="Protein" 
            value={macros.protein} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />
          <MacroCard 
            icon={Wheat} 
            label="Carbs" 
            value={macros.carbs} 
            color="text-amber-600" 
            bgColor="bg-amber-50" 
          />
          <MacroCard 
            icon={Droplet} 
            label="Fats" 
            value={macros.fats} 
            color="text-rose-600" 
            bgColor="bg-rose-50" 
          />
        </div>

        {/* AI Suggestion Button */}
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-center">
          <button 
            onClick={handleSuggestMeal}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 active:scale-95 w-full justify-center"
          >
            <Sparkles className="w-4 h-4" />
            {remaining > 0 ? "Chef's Suggestion" : "Diet Rescue"}
          </button>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Weekly Trend
          </h3>
        </div>
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyData.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full relative h-full flex items-end bg-slate-50 rounded-lg overflow-hidden">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    day.height > 100 ? 'bg-red-400' : 'bg-indigo-400 group-hover:bg-indigo-500'
                  }`}
                  style={{ height: `${Math.max(day.height, 5)}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-400">{day.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Log Brief */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-slate-800">Today's Meals</h3>
          {todaysLogs.length > 0 && (
            <button 
              onClick={handleAnalyzeDay}
              className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-200 transition-colors active:scale-95"
            >
              <Brain className="w-3 h-3" />
              Analyze Day ✨
            </button>
          )}
        </div>

        {todaysLogs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No meals logged today yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysLogs.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{log.food_item}</p>
                  <p className="text-xs text-slate-400 flex flex-wrap gap-2">
                    <span>{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {(log.protein || log.carbs || log.fats) && (
                      <>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-slate-500 text-[10px] flex gap-1">
                          {log.protein > 0 && <span className="text-blue-600 font-medium">P:{log.protein}</span>}
                          {log.carbs > 0 && <span className="text-amber-600 font-medium">C:{log.carbs}</span>}
                          {log.fats > 0 && <span className="text-rose-600 font-medium">F:{log.fats}</span>}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-indigo-600 whitespace-nowrap">{log.calories} cal</span>
                  
                  <button 
                    onClick={() => onEditLog(log)}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Modal */}
      {aiModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4 pb-24 sm:pb-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setAiModal({ ...aiModal, open: false })} />
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 pointer-events-auto transform transition-all animate-in slide-in-from-bottom-10 relative">
            <button 
              onClick={() => setAiModal({ ...aiModal, open: false })}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                aiModal.type === 'suggestion' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {aiModal.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : aiModal.type === 'suggestion' ? (
                  <Sparkles className="w-6 h-6" />
                ) : (
                  <Brain className="w-6 h-6" />
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {aiModal.loading ? 'Thinking...' : aiModal.type === 'suggestion' ? "Chef Gemini Suggests" : "Daily Insights"}
              </h3>
              
              <div className="text-slate-600 text-sm leading-relaxed w-full">
                {aiModal.loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-2 bg-slate-100 rounded w-3/4 mx-auto"></div>
                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                    <div className="h-2 bg-slate-100 rounded w-5/6 mx-auto"></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
                    {aiModal.content}
                  </div>
                )}
              </div>

              {!aiModal.loading && (
                <button 
                  onClick={() => setAiModal({ ...aiModal, open: false })}
                  className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
