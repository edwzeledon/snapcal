import React from 'react';
import { Home, Plus, Calendar } from 'lucide-react';

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
      active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon className="w-6 h-6" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-20 pb-safe">
      <NavButton 
        active={activeTab === 'home'} 
        onClick={() => setActiveTab('home')} 
        icon={Home} 
        label="Home" 
      />
      
      {/* Floating Action Button for Add */}
      <div className="-mt-8">
        <button 
          onClick={() => setActiveTab('add')}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            activeTab === 'add' 
              ? 'bg-slate-800 text-white' 
              : 'bg-indigo-600 text-white'
          }`}
        >
          <Plus className={`w-8 h-8 ${activeTab === 'add' ? 'rotate-45 transition-transform' : 'transition-transform'}`} />
        </button>
      </div>

      <NavButton 
        active={activeTab === 'history'} 
        onClick={() => setActiveTab('history')} 
        icon={Calendar} 
        label="History" 
      />
    </nav>
  );
}
