import React, { useState } from 'react';
import { Edit2, Trash2, Brain, Plus, MoreVertical } from 'lucide-react';

// Helper to convert food name to title case
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function MealFeed({ logs, onEditLog, onDeleteLog, onAnalyzeDay, onAddMeal }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 text-lg">Today's Meals</h3>
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
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">No meals logged today yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log, index) => {
            const isMenuOpen = openMenuId === log.id;
            
            return (
              <div 
                key={log.id} 
                className={`py-4 flex items-center gap-4 hover:bg-slate-50 -mx-3 px-3 rounded-xl transition-colors ${index === 0 ? 'pt-0' : ''} ${index === logs.length - 1 ? 'pb-0 border-b-0' : ''}`}
              >
                {/* Visual (Emoji Avatar) */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {log.image_url ? (
                      <img src={log.image_url} alt={log.food_item} className="w-full h-full object-cover" />
                  ) : (
                      <span className="text-2xl">🍽️</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {/* Food Title */}
                  <h4 className="font-semibold text-slate-800 text-base truncate">
                    {toTitleCase(log.food_item)}
                  </h4>
                  
                  {/* Time & Meal Type */}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {log.meal_type && <span className="capitalize"> • {log.meal_type}</span>}
                  </p>
                  
                  {/* Macros (Dot System) */}
                  {(log.protein > 0 || log.carbs > 0 || log.fats > 0) && (
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-medium">
                      {log.protein > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {log.protein}g Protein
                        </span>
                      )}
                      {log.carbs > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {log.carbs}g Carbs
                        </span>
                      )}
                      {log.fats > 0 && (
                        <span className="flex items-center gap-1 text-rose-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          {log.fats}g Fat
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Calories */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-purple-600 text-base whitespace-nowrap">{log.calories} kcal</span>
                  
                  {/* Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(isMenuOpen ? null : log.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {isMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 min-w-[120px] z-20">
                          <button 
                            onClick={() => {
                              onEditLog(log);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              onDeleteLog(log.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
