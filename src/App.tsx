import React, { useState, useEffect } from 'react';

// --- TYPES ---
type Profile = 'Roxanne' | 'Diana';

interface ExerciseLog {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

interface WorkoutLog {
  id: string;
  profile: Profile;
  date: string;
  type: 'Strength' | 'Cardio' | 'Conditioning' | 'Mixed';
  title: string;
  exercises: ExerciseLog[];
  cardioDetails?: {
    activity: string;
    distanceMiles: number;
    durationMinutes: number;
  };
  notes?: string;
}

const DEFAULT_EQUIPMENT = [
  { id: 'rack', name: 'Titan Power Rack (Landmine & Pulley)', icon: '🏗️' },
  { id: 'bench', name: 'NordicTrack Adjustable Bench', icon: '🏋️‍♂️' },
  { id: 'barbell', name: 'Olympic Barbells & Bumper Plates', icon: '🏋️' },
  { id: 'dumbbells', name: 'Hex Dumbbells (Up to 50 lbs)', icon: '💪' },
  { id: 'kettlebell', name: 'Kettlebells (Up to 71 lbs)', icon: '🔔' },
  { id: 'rower', name: 'Concept2 Rower', icon: '🚣' },
  { id: 'airbike', name: 'Assault AirBike', icon: '🚴' },
  { id: 'cables', name: 'Cable Attachments & Handles', icon: '⚙️' },
  { id: 'med_slam_balls', name: 'Medicine Balls & Slam Balls', icon: '⚽' },
  { id: 'plyo_boxes', name: 'Plyo Boxes & Jump Ropes', icon: '📦' },
  { id: 'recovery_mat', name: 'AbMats, Yoga Wheels & Foam Rollers', icon: '🧘' },
];

export default function App() {
  const [activeProfile, setActiveProfile] = useState<Profile>('Roxanne');
  const [activeTab, setActiveTab] = useState<'plan' | 'log' | 'history' | 'equipment'>('plan');

  // Theme Styling Engine
  const isRoxanne = activeProfile === 'Roxanne';
  
  const theme = {
    gradientHeader: isRoxanne 
      ? 'from-amber-600 via-orange-600 to-red-600' 
      : 'from-purple-700 via-fuchsia-600 to-indigo-700',
    primaryBg: isRoxanne ? 'bg-orange-600' : 'bg-purple-600',
    primaryHover: isRoxanne ? 'hover:bg-orange-500' : 'hover:bg-purple-500',
    primaryText: isRoxanne ? 'text-orange-400' : 'text-purple-400',
    primaryBorder: isRoxanne ? 'border-orange-500/40' : 'border-purple-500/40',
    cardGlow: isRoxanne ? 'shadow-orange-950/40 border-orange-500/20' : 'shadow-purple-950/40 border-purple-500/20',
    activeTabClass: isRoxanne ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-purple-600 text-white shadow-purple-600/30',
    badgeBg: isRoxanne ? 'bg-orange-950/80 text-orange-300 border-orange-500/30' : 'bg-purple-950/80 text-purple-300 border-purple-500/30',
  };

  // Local Storage State
  const [equipment, setEquipment] = useState<string[]>(() => {
    const saved = localStorage.getItem('duofit_equipment');
    return saved
      ? JSON.parse(saved)
      : ['rack', 'bench', 'barbell', 'dumbbells', 'kettlebell', 'rower', 'airbike', 'cables', 'med_slam_balls', 'plyo_boxes', 'recovery_mat'];
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('duofit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Logging Form State
  const [workoutType, setWorkoutType] = useState<'Strength' | 'Cardio' | 'Conditioning' | 'Mixed'>('Strength');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [cardioActivity, setCardioActivity] = useState('Concept2 Rower / Outdoor Run');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    { id: '1', name: 'NordicTrack Bench Press', sets: 4, reps: 8, weight: 135 },
  ]);
  const [notes, setNotes] = useState('');

  // Save to Local Storage
  useEffect(() => {
    localStorage.setItem('duofit_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('duofit_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  const toggleEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addExerciseRow = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: 3, reps: 10, weight: 0 },
    ]);
  };

  const updateExercise = (id: string, field: keyof ExerciseLog, value: any) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle) return;

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      profile: activeProfile,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      type: workoutType,
      title: workoutTitle,
      exercises: workoutType !== 'Cardio' ? exercises : [],
      cardioDetails:
        workoutType !== 'Strength'
          ? {
              activity: cardioActivity,
              distanceMiles: parseFloat(distance) || 0,
              durationMinutes: parseInt(duration) || 0,
            }
          : undefined,
      notes,
    };

    setWorkoutLogs([newLog, ...workoutLogs]);
    setWorkoutTitle('');
    setDistance('');
    setDuration('');
    setNotes('');
    alert(`🔥 Workout saved for ${activeProfile}!`);
    setActiveTab('history');
  };

  const startPlanSession = (title: string, type: 'Strength' | 'Cardio' | 'Conditioning' | 'Mixed') => {
    setWorkoutTitle(title);
    setWorkoutType(type);
    setActiveTab('log');
  };

  const profileLogs = workoutLogs.filter((log) => log.profile === activeProfile);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Dynamic Glowing Header */}
        <header className={`bg-gradient-to-r ${theme.gradientHeader} p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden`}>
          <div className="absolute -right-10 -bottom-10 opacity-15 text-9xl select-none">
            {isRoxanne ? '🔥' : '👑'}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-white tracking-wider">DUOFIT TRACKER</h1>
                <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold text-white">
                  Garage Edition
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium mt-1">
                {isRoxanne ? '⚡ Sunset Orange Mode (Roxanne)' : '💜 Royal Purple Mode (Diana)'}
              </p>
            </div>

            {/* Profile Switcher */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
              <button
                onClick={() => setActiveProfile('Roxanne')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isRoxanne
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105 ring-2 ring-white/50'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🔥 Roxanne
              </button>
              <button
                onClick={() => setActiveProfile('Diana')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  !isRoxanne
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg scale-105 ring-2 ring-white/50'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👑 Diana
              </button>
            </div>
          </div>

          {/* User Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/20 text-xs">
            <div className="bg-slate-950/40 backdrop-blur-sm p-2 rounded-xl border border-white/10 flex items-center justify-between">
              <span className="text-white/70">Logged Sessions:</span>
              <span className="font-black text-white text-sm">{profileLogs.length}</span>
            </div>
            <div className="bg-slate-950/40 backdrop-blur-sm p-2 rounded-xl border border-white/10 flex items-center justify-between">
              <span className="text-white/70">Active Gear:</span>
              <span className="font-black text-white text-sm">{equipment.length} Items</span>
            </div>
            <div className="bg-slate-950/40 backdrop-blur-sm p-2 rounded-xl border border-white/10 flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-white/70">Status:</span>
              <span className="font-black text-emerald-300 text-xs"> Ready to Work</span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex flex-wrap gap-2 pt-2 justify-center relative z-10">
            {[
              { id: 'plan', label: '📋 Custom Plan' },
              { id: 'log', label: '⚡ Log Workout' },
              { id: 'history', label: `📜 History (${profileLogs.length})` },
              { id: 'equipment', label: '⚙️ Garage Gear' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs md:text-sm font-extrabold rounded-xl transition shadow-md ${
                  activeTab === tab.id
                    ? `${theme.activeTabClass} ring-2 ring-white/50 scale-105`
                    : 'bg-slate-950/60 text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* CUSTOM PLAN GENERATOR TAB */}
        {activeTab === 'plan' && (
          <main className={`bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border shadow-2xl space-y-6 ${theme.cardGlow}`}>
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-black ${theme.primaryText}`}>
                  {isRoxanne ? '🔥 Roxanne\'s Tailored Garage Routine' : '👑 Diana\'s Custom Workout Plan'}
                </h2>
                <p className="text-xs text-slate-400">Smart-generated based on your current {equipment.length} active garage items.</p>
              </div>
              <button
                onClick={() => setActiveTab('equipment')}
                className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${theme.badgeBg}`}
              >
                Edit Active Gear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Session 1 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm ${theme.primaryText}`}>🏃 Session 1: Cardio & Endurance</h3>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">Aerobic</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {equipment.includes('rower') && <li>Concept2 Rower: 500m Interval Sprints (5 sets)</li>}
                  {equipment.includes('airbike') && <li>Assault AirBike: 20/10 Calorie Intervals (15 mins)</li>}
                  {equipment.includes('plyo_boxes') && <li>Jump Rope Warm-up (3x2 mins)</li>}
                  <li>Outdoor Long-Distance Run / Endurance Tempo Walk</li>
                </ul>
                <button
                  onClick={() => startPlanSession('Cardio & Endurance Interval', 'Cardio')}
                  className={`w-full mt-2 py-2 text-xs font-black text-white rounded-xl transition ${theme.primaryBg} ${theme.primaryHover}`}
                >
                  Start This Session 🚀
                </button>
              </div>

              {/* Session 2 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm ${theme.primaryText}`}>🏋️ Session 2: Rack & Bench Heavy Strength</h3>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Strength</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {equipment.includes('bench') && equipment.includes('barbell') && <li>NordicTrack Bench Press (Flat / Incline 4x8)</li>}
                  {equipment.includes('bench') && equipment.includes('dumbbells') && <li>Incline Dumbbell Chest Flyes & DB Rows (3x10)</li>}
                  {equipment.includes('barbell') && <li>Titan Rack Barbell Squats or Deadlifts (4x8)</li>}
                  {equipment.includes('rack') && <li>Landmine Rotations & Presses (3x10)</li>}
                  {equipment.includes('cables') && <li>Cable Triceps Pushdowns & Lat Pulldowns (3x12)</li>}
                </ul>
                <button
                  onClick={() => startPlanSession('Rack & Bench Power Session', 'Strength')}
                  className={`w-full mt-2 py-2 text-xs font-black text-white rounded-xl transition ${theme.primaryBg} ${theme.primaryHover}`}
                >
                  Start This Session 🚀
                </button>
              </div>

              {/* Session 3 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm ${theme.primaryText}`}>💥 Session 3: Full Body Conditioning</h3>
                  <span className="text-[10px] bg-violet-950 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">Conditioning</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {equipment.includes('med_slam_balls') && <li>Medicine Ball Wall Balls or Russian Twists (4x15)</li>}
                  {equipment.includes('kettlebell') && <li>Heavy Kettlebell Swings (4x15)</li>}
                  {equipment.includes('plyo_boxes') && <li>Plyo Box Step-ups or Jump Squats (3x12)</li>}
                  {equipment.includes('bench') && <li>NordicTrack Bench Dips (3x15)</li>}
                </ul>
                <button
                  onClick={() => startPlanSession('Full Body Conditioning Circuit', 'Conditioning')}
                  className={`w-full mt-2 py-2 text-xs font-black text-white rounded-xl transition ${theme.primaryBg} ${theme.primaryHover}`}
                >
                  Start This Session 🚀
                </button>
              </div>

              {/* Session 4 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm ${theme.primaryText}`}>🧘 Session 4: Active Recovery & Mobility</h3>
                  <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Mobility</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {equipment.includes('recovery_mat')
                    ? '20-30 min Foam Rolling, Yoga Wheel spine decompression, dynamic mobility flow, and AbMat core work.'
                    : '20 min Light Recovery Walk and Dynamic Mobility Stretches.'}
                </p>
                <button
                  onClick={() => startPlanSession('Active Recovery & Foam Rolling', 'Mixed')}
                  className={`w-full mt-2 py-2 text-xs font-black text-white rounded-xl transition ${theme.primaryBg} ${theme.primaryHover}`}
                >
                  Start This Session 🚀
                </button>
              </div>
            </div>
          </main>
        )}

        {/* LOG WORKOUT TAB */}
        {activeTab === 'log' && (
          <main className={`bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border shadow-2xl space-y-6 ${theme.cardGlow}`}>
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h2 className={`text-xl font-black ${theme.primaryText}`}>Log Workout for {activeProfile}</h2>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['Strength', 'Cardio', 'Conditioning', 'Mixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWorkoutType(t)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      workoutType === t ? `${theme.primaryBg} text-white` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveWorkout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Workout Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g., Garage Bench Press & Rows, Concept2 Rower Sprints..."
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>

              {/* Cardio Fields */}
              {workoutType !== 'Strength' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Activity</label>
                    <input
                      type="text"
                      value={cardioActivity}
                      onChange={(e) => setCardioActivity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Distance (Miles)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 3.5"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Duration (Minutes)</label>
                    <input
                      type="number"
                      placeholder="e.g., 45"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Strength Fields */}
              {workoutType !== 'Cardio' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300">Exercises Tracked</label>
                    <button
                      type="button"
                      onClick={addExerciseRow}
                      className={`text-xs hover:underline font-bold ${theme.primaryText}`}
                    >
                      + Add Exercise Row
                    </button>
                  </div>

                  {exercises.map((ex) => (
                    <div key={ex.id} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                        className="col-span-5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                      <input
                        type="number"
                        placeholder="Sets"
                        value={ex.sets || ''}
                        onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value) || 0)}
                        className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-slate-100"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={ex.reps || ''}
                        onChange={(e) => updateExercise(ex.id, 'reps', parseInt(e.target.value) || 0)}
                        className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-slate-100"
                      />
                      <input
                        type="number"
                        placeholder="lbs"
                        value={ex.weight || ''}
                        onChange={(e) => updateExercise(ex.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="col-span-1 text-rose-400 font-bold text-center hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Notes / Reflection</label>
                <textarea
                  rows={2}
                  placeholder="NordicTrack bench at 30 deg incline felt smooth..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 text-white font-black text-sm rounded-xl transition shadow-lg ${theme.primaryBg} ${theme.primaryHover}`}
              >
                + Save Workout Log
              </button>
            </form>
          </main>
        )}

        {/* WORKOUT HISTORY TAB */}
        {activeTab === 'history' && (
          <main className={`bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border shadow-2xl space-y-4 ${theme.cardGlow}`}>
            <h2 className={`text-xl font-black ${theme.primaryText}`}>{activeProfile}'s Workout History</h2>
            {profileLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No saved workouts yet for {activeProfile}. Log a session to get started!</p>
            ) : (
              <div className="space-y-3">
                {profileLogs.map((log) => (
                  <div key={log.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div>
                        <h3 className="font-bold text-white text-sm">{log.title}</h3>
                        <span className="text-[10px] text-slate-400">{log.date}</span>
                      </div>
                      <span className={`text-[10px] border px-2.5 py-1 rounded-full font-bold ${theme.badgeBg}`}>
                        {log.type}
                      </span>
                    </div>

                    {log.cardioDetails && (
                      <div className="text-xs text-cyan-300 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/20 flex gap-4">
                        <span>🏃 {log.cardioDetails.activity}</span>
                        <span>📍 {log.cardioDetails.distanceMiles} miles</span>
                        <span>⏱️ {log.cardioDetails.durationMinutes} mins</span>
                      </div>
                    )}

                    {log.exercises.length > 0 && (
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {log.exercises.map((e, idx) => (
                          <li key={idx}>
                            {e.name}: {e.sets} sets × {e.reps} reps {e.weight ? `@ ${e.weight} lbs` : ''}
                          </li>
                        ))}
                      </ul>
                    )}

                    {log.notes && <p className="text-[11px] text-slate-400 italic">"{log.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* EQUIPMENT SETTINGS TAB */}
        {activeTab === 'equipment' && (
          <main className={`bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border shadow-2xl space-y-6 ${theme.cardGlow}`}>
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-amber-400">Available Garage Gear</h2>
              <p className="text-xs text-slate-400">Toggle equipment on or off to automatically adapt your custom workout plans.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {DEFAULT_EQUIPMENT.map((item) => {
                const isSelected = equipment.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleEquipment(item.id)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{isSelected ? 'Active in Plan' : 'Not Selected'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}