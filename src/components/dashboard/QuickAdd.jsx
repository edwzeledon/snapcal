import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';

export default function QuickAdd({ onAddLog }) {
  const [quickCalories, setQuickCalories] = useState('');
  const [quickName, setQuickName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quickCalories) return;

    onAddLog({
      foodItem: quickName || 'Quick Add',
      calories: parseInt(quickCalories),
      protein: 0,
      carbs: 0,
      fats: 0,
      mealType: 'snack',
      method: 'manual'
    });

    setQuickCalories('');
    setQuickName('');
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Quick Add
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="What did you eat? (optional)"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          className="w-full text-sm px-3 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400"
        />
        <div className="flex gap-2">
            <input
            type="number"
            placeholder="Calories"
            value={quickCalories}
            onChange={(e) => setQuickCalories(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400"
            />
            <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </form>
    </div>
  );
}
