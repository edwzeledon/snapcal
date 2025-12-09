const EXERCISE_CATEGORIES = {
  'All': [],
  'Chest': ['Bench Press', 'Push Ups', 'Incline Dumbbell Press', 'Chest Fly', 'Cable Crossovers'],
  'Back': ['Pull Ups', 'Lat Pulldown', 'Bent Over Row', 'Deadlift', 'Face Pulls'],
  'Legs': ['Squat', 'Lunges', 'Leg Press', 'Calf Raises', 'Romanian Deadlift', 'Leg Extensions'],
  'Shoulders': ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Arnold Press', 'Shrugs'],
  'Arms': ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skullcrushers', 'Preacher Curls'],
  'Core': ['Plank', 'Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel']
};
function WorkoutCard({ log, user, appId, onDelete }) {
  const [sets, setSets] = useState(log.sets || []);

  // Sync state with props if props change (e.g. initial load)
  useEffect(() => {
    setSets(log.sets || []);
  }, [log.sets]);

  const saveSets = useCallback(async (newSets) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', log.id);
      await updateDoc(docRef, { sets: newSets });
    } catch (e) {
      console.error("Error saving sets:", e);
    }
  }, [user, appId, log.id]);

  const addSet = () => {
    const newSets = [...sets, { weight: '', reps: '', completed: false }];
    setSets(newSets);
    saveSets(newSets);
  };

  const updateSet = (index, field, value) => {
    // Sanitize input to allow only numbers and one decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleBlur = () => {
    saveSets(sets);
  };

  const toggleSetCompletion = (index) => {
    const newSets = [...sets];
    newSets[index].completed = !newSets[index].completed;
    setSets(newSets);
    saveSets(newSets);
  };

  const quickFinish = () => {
    const newSets = sets.map(s => ({ ...s, completed: true }));
    setSets(newSets);
    saveSets(newSets);
  };

  const removeSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
    saveSets(newSets);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            {log.exercise.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{log.exercise}</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{log.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
             onClick={quickFinish}
             className="p-2 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
             title="Mark all as done"
          >
             <CheckCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(log.id)}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Sets Editor */}
      <div className="space-y-3">
        <div className="grid grid-cols-10 gap-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
          <div className="col-span-1">Set</div>
          <div className="col-span-3">Lbs</div>
          <div className="col-span-3">Reps</div>
          <div className="col-span-2">Done</div>
          <div className="col-span-1"></div>
        </div>

        {sets.map((set, idx) => (
          <div 
            key={idx} 
            className={`grid grid-cols-10 gap-2 items-center transition-all ${set.completed ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="col-span-1 flex justify-center">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
            </div>
            <div className="col-span-3">
              <input 
                type="number" 
                inputMode="decimal"
                min="0"
                value={set.weight}
                onChange={e => updateSet(idx, 'weight', e.target.value)}
                onBlur={handleBlur}
                disabled={set.completed}
                placeholder="-"
                className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-800 text-sm disabled:bg-slate-100"
              />
            </div>
            <div className="col-span-3">
              <input 
                type="number"
                inputMode="numeric" 
                min="0"
                value={set.reps}
                onChange={e => updateSet(idx, 'reps', e.target.value)}
                onBlur={handleBlur}
                disabled={set.completed}
                placeholder="-"
                className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-800 text-sm disabled:bg-slate-100"
              />
            </div>
            <div className="col-span-2 flex justify-center">
              <button 
                onClick={() => toggleSetCompletion(idx)}
                className={`p-1.5 rounded-lg transition-all shadow-sm ${
                  set.completed 
                    ? 'bg-green-500 text-white ring-2 ring-green-200' 
                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                }`}
              >
                {set.completed ? <Check className="w-5 h-5" /> : <Check className="w-5 h-5 opacity-0" />}
              </button>
            </div>
             <div className="col-span-1 flex justify-center">
               {!set.completed && (
                  <button 
                    onClick={() => removeSet(idx)}
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
               )}
            </div>
          </div>
        ))}

        <button 
          onClick={addSet}
          className="w-full py-3 mt-2 border border-dashed border-indigo-200 rounded-xl text-indigo-500 font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>
      </div>
    </div>
  );
}

function WorkoutView({ user, appId, workoutLogs }) {
  const [showPicker, setShowPicker] = useState(false);
  const [completedAnimation, setCompletedAnimation] = useState(false);
  
  // Template States
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showLoadTemplate, setShowLoadTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState([]);

  // Fetch Templates
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'workout-templates'), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  // Derived State: Only Today's Logs for this view
  const todaysLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const todayLogs = workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0,0,0,0);
      return logDate.getTime() === today.getTime();
    });

    // Sort today's logs by creation time (ascending)
    todayLogs.sort((a, b) => a.date - b.date);
    return todayLogs;
  }, [workoutLogs]);

  const handleAddExerciseToDay = async (exercise) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'workouts'), {
        exercise: exercise.name,
        category: exercise.category,
        sets: [{ weight: '', reps: '', completed: false }], // Start with one empty set
        date: serverTimestamp()
      });
      setShowPicker(false);
    } catch (e) {
      console.error("Error creating workout entry", e);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !templateName.trim() || todaysLogs.length === 0) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'workout-templates'), {
        name: templateName,
        exercises: todaysLogs.map(l => ({ 
          exercise: l.exercise, 
          category: l.category, 
          sets: l.sets.map(s => ({ ...s, completed: false })) // Reset completion for template
        })),
        createdAt: serverTimestamp()
      });
      setTemplateName('');
      setShowSaveTemplate(false);
    } catch (e) {
      console.error("Error saving template", e);
    }
  };

  const handleLoadTemplate = async (template) => {
    if (!user) return;
    try {
      // Create new workout logs for each exercise in the template
      const promises = template.exercises.map(ex => 
        addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'workouts'), {
          exercise: ex.exercise,
          category: ex.category,
          sets: ex.sets,
          date: serverTimestamp()
        })
      );
      await Promise.all(promises);
      setShowLoadTemplate(false);
    } catch (e) {
      console.error("Error loading template", e);
    }
  };

  const deleteTemplate = async (id) => {
    if (!user || !confirm('Delete this template?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workout-templates', id));
    } catch (e) {
      console.error("Error deleting template", e);
    }
  }

  const deleteWorkout = async (id) => {
    if (!user || !confirm("Remove this exercise?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', id));
    } catch (e) {
      console.error("Error deleting workout", e);
    }
  }

  const handleCompleteWorkout = () => {
    setCompletedAnimation(true);
    setTimeout(() => {
      setCompletedAnimation(false);
      // Optional: Could redirect home or just show success
    }, 2500);
  };

  const handleDiscardWorkout = async () => {
    if (!user || !confirm("Are you sure you want to discard today's entire workout? This cannot be undone.")) return;
    try {
      // Delete all logs for today
      const promises = todaysLogs.map(log => 
        deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', log.id))
      );
      await Promise.all(promises);
    } catch (e) {
      console.error("Error discarding workout", e);
    }
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col pb-24 md:pb-0 relative">
      
      {/* Celebration Overlay */}
      {completedAnimation && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
          <Trophy className="w-24 h-24 text-yellow-500 mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-slate-800">Workout Complete!</h2>
          <p className="text-slate-500">Great job crushing your goals today.</p>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Save Routine</h3>
            <input 
              type="text" 
              placeholder="Routine Name (e.g., Leg Day)" 
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 mb-4 focus:border-indigo-500 outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSaveTemplate(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Template Modal */}
      {showLoadTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">My Routines</h3>
              <button onClick={() => setShowLoadTemplate(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No saved templates yet.</p>
                </div>
              ) : (
                templates.map(temp => (
                  <div key={temp.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-slate-700">{temp.name}</h4>
                      <p className="text-xs text-slate-400">{temp.exercises.length} Exercises</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleLoadTemplate(temp)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                        title="Load Routine"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button 
                        onClick={() => deleteTemplate(temp.id)}
                        className="p-2 text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!showPicker && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-indigo-600" />
            Lifting Log
          </h2>
          
          {/* Finish Workout moved to top right */}
          {todaysLogs.length > 0 && (
            <button 
              onClick={handleCompleteWorkout}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 text-sm"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
          )}
        </div>
      )}

      {showPicker ? (
        <PickerView onBack={() => setShowPicker(false)} onAddExercise={handleAddExerciseToDay} />
      ) : (
        <div className="flex flex-col h-full">
          {/* Today's List */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 no-scrollbar">
             {todaysLogs.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <Dumbbell className="w-8 h-8 text-indigo-300" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 mb-1">Start your Workout</h3>
                 <p className="text-slate-400 text-sm mb-6">Add exercises to build your daily plan.</p>
                 <div className="flex gap-3 w-full">
                   <button 
                     onClick={() => setShowPicker(true)}
                     className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     <Plus className="w-5 h-5" />
                     Add Exercise
                   </button>
                   <button 
                     onClick={() => setShowLoadTemplate(true)}
                     className="px-4 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
                   >
                     <Download className="w-5 h-5" />
                     Load
                   </button>
                 </div>
               </div>
             ) : (
               <>
                 {todaysLogs.map(log => (
                   <WorkoutCard 
                      key={log.id} 
                      log={log} 
                      user={user} 
                      appId={appId} 
                      onDelete={deleteWorkout} 
                   />
                 ))}

                 {/* Add Buttons Row */}
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setShowPicker(true)}
                     className="flex-1 py-4 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-500 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
                   >
                     <Plus className="w-5 h-5" />
                     Add Exercise
                   </button>
                   <button 
                     onClick={() => setShowLoadTemplate(true)}
                     className="px-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                     title="Load from Template"
                   >
                     <Folder className="w-5 h-5" />
                   </button>
                 </div>

                 {/* Discard & Save Actions */}
                 <div className="pt-8 pb-4 flex gap-3">
                   <button 
                     onClick={handleDiscardWorkout}
                     className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                   >
                     <Ban className="w-4 h-4" />
                     Discard
                   </button>
                   <button 
                     onClick={() => setShowSaveTemplate(true)}
                     className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
                   >
                     <Save className="w-4 h-4" />
                     Save as Template
                   </button>
                 </div>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
}