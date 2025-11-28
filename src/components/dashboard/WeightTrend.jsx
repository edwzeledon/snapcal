import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';

export default function WeightTrend({ currentWeight, onUpdateWeight, history = [] }) {
  const [inputWeight, setInputWeight] = useState('');

  useEffect(() => {
    if (currentWeight) {
        setInputWeight(currentWeight.toString());
    }
  }, [currentWeight]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputWeight) return;
    onUpdateWeight(parseFloat(inputWeight));
  };

  // Simple SVG Line Chart
  const renderChart = () => {
    if (history.length < 2) return <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Not enough data</div>;

    const weights = history.map(h => h.weight).filter(w => w !== null);
    if (weights.length === 0) return <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No weight data</div>;

    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const range = maxW - minW;
    
    const points = history.map((h, i) => {
        if (!h.weight) return null;
        const x = (i / (history.length - 1)) * 100;
        const y = 100 - ((h.weight - minW) / range) * 100;
        return `${x},${y}`;
    }).filter(p => p !== null).join(' ');

    return (
      <div className="h-32 w-full relative mt-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
           <polyline
             fill="none"
             stroke="#6366f1"
             strokeWidth="2"
             points={points}
             vectorEffect="non-scaling-stroke"
           />
           {/* Dots */}
           {history.map((h, i) => {
               if (!h.weight) return null;
               const x = (i / (history.length - 1)) * 100;
               const y = 100 - ((h.weight - minW) / range) * 100;
               return (
                   <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
               );
           })}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-500" />
          Weight Trend
        </h3>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input 
                type="number" 
                step="0.1"
                value={inputWeight}
                onChange={e => setInputWeight(e.target.value)}
                placeholder="kg"
                className="w-16 px-2 py-1 rounded border border-slate-200 text-sm"
            />
            <button type="submit" className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg">Save</button>
        </form>
      </div>
      
      {renderChart()}
    </div>
  );
}
