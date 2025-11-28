'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, Check, Upload } from 'lucide-react';
import { analyzeImageWithGemini, addLog } from '@/lib/api';

const formatBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix for API
      const base64 = reader.result.split(',')[1];
      const mimeType = reader.result.split(';')[0].split(':')[1];
      resolve({ base64, mimeType, fullData: reader.result });
    };
    reader.onerror = error => reject(error);
  });
};

export default function AddFood({ user, onSuccess, onCancel }) {
  const [mode, setMode] = useState('scan'); // 'scan' or 'manual'
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ foodItem: '', calories: '', protein: '', carbs: '', fats: '' });
  const [error, setError] = useState('');
  
  // Camera State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const fileInputRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied or unavailable. Please use upload.");
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      setPreview(dataUrl);
      
      // Extract base64 and analyze
      const base64 = dataUrl.split(',')[1];
      performAnalysis(base64, 'image/jpeg');
    }
  };

  const performAnalysis = async (base64, mimeType) => {
    setAnalyzing(true);
    setForm({ foodItem: '', calories: '', protein: '', carbs: '', fats: '' });
    
    try {
      // Call Server Action
      const json = await analyzeImageWithGemini(base64, mimeType);
      
      setForm({ 
        foodItem: json.foodItem, 
        calories: String(json.calories),
        protein: String(json.protein || 0),
        carbs: String(json.carbs || 0),
        fats: String(json.fats || 0)
      });

    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again or enter manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset and start loading
    setError('');
    setAnalyzing(true);
    setForm({ foodItem: '', calories: '', protein: '', carbs: '', fats: '' });
    
    try {
      const { base64, mimeType, fullData } = await formatBase64(file);
      setPreview(fullData);
      performAnalysis(base64, mimeType);
    } catch (err) {
      console.error(err);
      setError("Failed to process image.");
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodItem || !form.calories) return;
    if (!user) return;

    try {
      await addLog(user.id, {
        foodItem: form.foodItem,
        calories: parseInt(form.calories),
        protein: parseInt(form.protein) || 0,
        carbs: parseInt(form.carbs) || 0,
        fats: parseInt(form.fats) || 0,
        method: mode === 'scan' ? 'ai-scan' : 'manual'
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to save entry.");
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Add Meal</h2>
        <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button 
          onClick={() => { setMode('scan'); stopCamera(); setPreview(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'scan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          AI Scan
        </button>
        <button 
          onClick={() => { setMode('manual'); stopCamera(); setPreview(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {/* Scan Mode UI */}
      {mode === 'scan' && (
        <div className="flex-1 flex flex-col relative">
          
          {/* Main Content Area: Camera, Preview, or Buttons */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm bg-slate-50 min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-indigo-100">
            
            {/* 1. Camera View */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`absolute inset-0 w-full h-full object-cover ${isCameraActive && !preview ? 'block' : 'hidden'}`}
            />
            
            {/* 2. Captured/Uploaded Preview */}
            {preview && <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-10" />}
            
            {/* 3. Loading Overlay */}
            {analyzing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
                <Loader2 className="w-10 h-10 animate-spin mb-3" />
                <p className="font-medium">Analyzing with Gemini...</p>
              </div>
            )}

            {/* 4. Initial Buttons (Visible if no camera active & no preview) */}
            {!isCameraActive && !preview && !analyzing && (
              <div className="flex flex-col gap-4 w-full px-8">
                <button 
                  onClick={startCamera}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  <Camera className="w-6 h-6" />
                  Use Camera
                </button>
                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-indigo-200"></div>
                  <span className="shrink mx-4 text-indigo-300 text-xs uppercase font-bold">Or</span>
                  <div className="grow border-t border-indigo-200"></div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  Upload Image
                </button>
              </div>
            )}

            {/* 5. Shutter Button (Visible only when camera active) */}
            {isCameraActive && !preview && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                <button 
                  onClick={captureImage}
                  className="w-16 h-16 bg-white rounded-full border-4 border-indigo-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-full"></div>
                </button>
                <button 
                  onClick={stopCamera}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 6. Close Preview Button */}
            {preview && !analyzing && (
               <button 
                 onClick={() => { setPreview(null); setForm({foodItem: '', calories: '', protein: '', carbs: '', fats: ''}); }} 
                 className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md z-20 hover:bg-black/70 transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Form Fields (Visible for both modes once scan is done or manual selected) */}
      { (mode === 'manual' || (mode === 'scan' && !analyzing && preview)) && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Food Name</label>
            <input 
              type="text" 
              value={form.foodItem}
              onChange={e => setForm({...form, foodItem: e.target.value})}
              placeholder="e.g., Grilled Chicken Salad"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Calories</label>
            <input 
              type="number" 
              value={form.calories}
              onChange={e => setForm({...form, calories: e.target.value})}
              placeholder="e.g., 450"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Protein (g)</label>
              <input 
                type="number" 
                value={form.protein}
                onChange={e => setForm({...form, protein: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Carbs (g)</label>
              <input 
                type="number" 
                value={form.carbs}
                onChange={e => setForm({...form, carbs: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fats (g)</label>
              <input 
                type="number" 
                value={form.fats}
                onChange={e => setForm({...form, fats: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2 mb-8"
          >
            <Check className="w-5 h-5" />
            Save Entry
          </button>
        </form>
      )}
    </div>
  );
}
