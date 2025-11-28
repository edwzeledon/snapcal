import React from 'react';
import { PieChart } from 'lucide-react';

export default function MacroDistribution({ macros }) {
  const total = macros.protein + macros.carbs + macros.fats;
  
  const proteinPct = total > 0 ? (macros.protein / total) * 100 : 0;
  const carbsPct = total > 0 ? (macros.carbs / total) * 100 : 0;
  const fatsPct = total > 0 ? (macros.fats / total) * 100 : 0;

  // Calculate stroke dash arrays for SVG circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  const proteinDash = (proteinPct / 100) * circumference;
  const carbsDash = (carbsPct / 100) * circumference;
  const fatsDash = (fatsPct / 100) * circumference;

  const proteinOffset = 0; // Start at top (rotated -90)
  const carbsOffset = -proteinDash;
  const fatsOffset = -(proteinDash + carbsDash);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-indigo-500" />
        Macro Split
      </h3>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
            
            {/* Protein */}
            <circle 
              cx="50" cy="50" r={radius} 
              fill="transparent" stroke="#3b82f6" strokeWidth="20" 
              strokeDasharray={`${proteinDash} ${circumference}`} 
              strokeDashoffset={proteinOffset}
            />
            
            {/* Carbs */}
            <circle 
              cx="50" cy="50" r={radius} 
              fill="transparent" stroke="#f59e0b" strokeWidth="20" 
              strokeDasharray={`${carbsDash} ${circumference}`} 
              strokeDashoffset={carbsOffset}
            />
            
            {/* Fats */}
            <circle 
              cx="50" cy="50" r={radius} 
              fill="transparent" stroke="#e11d48" strokeWidth="20" 
              strokeDasharray={`${fatsDash} ${circumference}`} 
              strokeDashoffset={fatsOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
             <span className="text-xs font-bold text-slate-500">Ratio</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 w-full">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Prot</span>
                </div>
                <span className="text-sm font-bold text-slate-700">{Math.round(proteinPct)}%</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Carb</span>
                </div>
                <span className="text-sm font-bold text-slate-700">{Math.round(carbsPct)}%</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Fat</span>
                </div>
                <span className="text-sm font-bold text-slate-700">{Math.round(fatsPct)}%</span>
            </div>
        </div>
      </div>
    </div>
  );
}
