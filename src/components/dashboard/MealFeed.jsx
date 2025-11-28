import React from 'react';
import { Edit2, Trash2, Brain, Plus } from 'lucide-react';

export default function MealFeed({ logs, onEditLog, onDeleteLog, onAnalyzeDay, onAddMeal }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Today's Meals</h3>
        <div className="flex gap-2">
            {logs.length > 0 && (
            <button 
                onClick={onAnalyzeDay}
                className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-200 transition-colors active:scale-95"
            >
                <Brain className="w-3 h-3" />
                Analyze
            </button>
            )}
            <button 
                onClick={onAddMeal}
                className="text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-200 transition-colors active:scale-95"
            >
                <Plus className="w-3 h-3" />
                Add Meal
            </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">No meals logged today yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-4 group">
              {/* Image or Placeholder */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {log.image_url ? (
                    <img src={log.image_url} alt={log.food_item} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xl">🍽️</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate block w-full">{log.food_item}</p>
                        <p className="text-xs text-slate-400 truncate">
                            {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {log.meal_type && <span className="capitalize ml-2 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{log.meal_type}</span>}
                        </p>
                    </div>
                    <span className="font-bold text-indigo-600 whitespace-nowrap text-sm shrink-0">{log.calories} cal</span>
                </div>
                
                {/* Macros Badges */}
                <div className="flex gap-2 mt-1.5">
                    {log.protein > 0 && <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">P: {log.protein}g</span>}
                    {log.carbs > 0 && <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">C: {log.carbs}g</span>}
                    {log.fats > 0 && <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">F: {log.fats}g</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEditLog(log)}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => onDeleteLog(log.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
