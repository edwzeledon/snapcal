import React from 'react';
import { Settings, RefreshCw } from 'lucide-react';

export default function SettingsView({ onRetakeAssessment }) {
  return (
    <div className="p-6 md:p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Settings className="w-10 h-10 text-slate-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Settings</h2>
      <p className="text-slate-500 max-w-xs mb-8">
        Manage your account preferences and update your fitness profile.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={onRetakeAssessment}
          className="w-full py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between px-6 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Retake Assessment</h3>
              <p className="text-xs text-slate-400">Update goals & measurements</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
