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
    { id: '1', name: 'Bench Press', sets: 4, reps: 8, weight: 135 },
  ]);
  const [notes, setNotes] = useState('');

  // Save to Local Storage
  useEffect(() => {
    localStorage.setItem('duofit_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('duofit_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  // Toggle Equipment Selection
  const toggleEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add Exercise Row to Form
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

  // Save Workout Log
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
    alert(`Workout saved for ${activeProfile}!`);
    setActiveTab('history');
  };

  // Filtered Logs
  const profileLogs = workoutLogs.filter((log) => log.profile === activeProfile);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header & Profile Switcher */}
        <header className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 p-6 rounded-3xl border border-violet-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                DuoFit Tracker
              </h1>
              <p className="text-xs text-violet-300 font-medium">Garage Gym Workout & Plan Generator</p>
            </div>

            {/* Profile Selector */}
            <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-violet-500/40">
              {(['Roxanne', 'Diana'] as Profile[]).map((person) => (
                <button
                  key={person}
                  onClick={() => setActiveProfile(person)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeProfile === person
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👤 {person}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap gap-2 border-t border-violet-900/50 pt-4 justify-center">
            {[
              { id: 'plan', label: '📋 Custom Plan', color: 'bg-emerald-600' },
              { id: 'log', label: '⚡ Log Workout', color: 'bg-cyan-600' },
              { id: 'history', label: `📜 History (${profileLogs.length})`, color: 'bg-violet-600' },
              { id: 'equipment', label: '⚙️ Equipment', color: 'bg-amber-600' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs md:text-sm font-extrabold rounded-xl transition shadow-md ${
                  activeTab === tab.id
                    ? `${tab.color} text-white ring-2 ring-white/40 scale-105`
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* CUSTOM PLAN GENERATOR TAB */}
        {activeTab === 'plan' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/30 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-emerald-400">Tailored Garage Plan for {activeProfile}</h2>
                <p className="text-xs text-slate-400">Generated based on your {equipment.length} active equipment items.</p>
              </div>
              <button
                onClick={() => setActiveTab('equipment')}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-emerald-300 border border-emerald-500/30"
              >
                Edit Gear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Session 1: Cardio & Endurance */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-cyan-300 text-sm">🏃 Session 1: Cardio & Endurance</h3>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-bold">Aerobic</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {equipment.includes('rower') && <li>Concept2 Rower: 500m Interval Sprints (5 sets)</li>}
                  {equipment.includes('airbike') && <li>Assault AirBike: 20/10 Calorie Intervals (15 mins)</li>}
                  {equipment.includes('plyo_boxes') && <li>Jump Rope Warm-up (3x2 mins)</li>}
                  <li>Outdoor Endurance Walk / Run Tempo Session</li>
                </ul>
              </div>

              {/* Session 2: Rack & Bench Upper/Lower */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-emerald-300 text-sm">🏋️ Session 2: Rack & Bench Strength</h3>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">Strength</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {equipment.includes('bench') && equipment.includes('barbell') && <li>Barbell Incline / Flat Bench Press (4x8)</li>}
                  {equipment.includes('bench') && equipment.includes('dumbbells') && <li>Incline Dumbbell Chest Flyes & Rows (3x10)</li>}
                  {equipment.includes('barbell') && <li>Barbell Back Squats or Deadlifts (4x8)</li>}
                  {equipment.includes('rack') && <li>Landmine Rotations & Presses (3x10)</li>}
                  {equipment.includes('cables') && <li>Cable Triceps Pushdowns & Lat Pulldowns (3x12)</li>}
                </ul>
              </div>

              {/* Session 3: Conditioning & Core */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-violet-300 text-sm">💥 Session 3: Full Body Conditioning</h3>
                  <span className="text-[10px] bg-violet-950 text-violet-400 px-2 py-0.5 rounded font-bold">Conditioning</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {equipment.includes('med_slam_balls') && <li>Medicine Ball Wall Balls or Russian Twists (4x15)</li>}
                  {equipment.includes('kettlebell') && <li>Kettlebell Swings (4x15)</li>}
                  {equipment.includes('plyo_boxes') && <li>Box Step-ups or Jump Squats (3x12)</li>}
                  {equipment.includes('bench') && <li>Bench Dips or Step-overs (3x12)</li>}
                </ul>
              </div>

              {/* Session 4: Active Recovery */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-amber-300 text-sm">🧘 Session 4: Active Recovery</h3>
                  <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold">Mobility</span>
                </div>
                <p className="text-xs text-slate-300">
                  {equipment.includes('recovery_mat')
                    ? '20-30 min Foam Rolling, Yoga Wheel mobility flow, and AbMat core work.'
                    : '20 min Light Recovery Walk and Dynamic Stretches.'}
                </p>
              </div>
            </div>
          </main>
        )}

        {/* LOG WORKOUT TAB */}
        {activeTab === 'log' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-cyan-500/30 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h2 className="text-xl font-black text-cyan-400">Log Workout for {activeProfile}</h2>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['Strength', 'Cardio', 'Conditioning', 'Mixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWorkoutType(t)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      workoutType === t ? 'bg-cyan-600 text-white' : 'text-slate-400'
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
                  placeholder="e.g., Garage Bench Press & Rows, Rower Sprints..."
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
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
                      className="text-xs text-cyan-400 hover:underline font-bold"
                    >
                      + Add Exercise
                    </button>
                  </div>

                  {exercises.map((ex) => (
                    <div key={ex.id} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                        className="col-span-5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Sets"
                        value={ex.sets || ''}
                        onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value) || 0)}
                        className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={ex.reps || ''}
                        onChange={(e) => updateExercise(ex.id, 'reps', parseInt(e.target.value) || 0)}
                        className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                      <input
                        type="number"
                        placeholder="lbs"
                        value={ex.weight || ''}
                        onChange={(e) => updateExercise(ex.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="col-span-1 text-rose-400 font-bold text-center"
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
                  placeholder="NordicTrack bench at 30 deg incline felt strong..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 font-extrabold text-white text-sm rounded-xl transition shadow-lg"
              >
                + Save Workout Log
              </button>
            </form>
          </main>
        )}

        {/* WORKOUT HISTORY TAB */}
        {activeTab === 'history' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-violet-500/30 shadow-xl space-y-4">
            <h2 className="text-xl font-black text-violet-400">{activeProfile}'s Workout History</h2>
            {profileLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No saved workouts yet for {activeProfile}. Log a session to get started!</p>
            ) : (
              <div className="space-y-3">
                {profileLogs.map((log) => (
                  <div key={log.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div>
                        <h3 className="font-bold text-violet-300 text-sm">{log.title}</h3>
                        <span className="text-[10px] text-slate-400">{log.date}</span>
                      </div>
                      <span className="text-[10px] bg-violet-950 text-violet-400 px-2.5 py-1 rounded-md border border-violet-500/30 font-bold">
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

                    {log.notes && <p className="text-[11px] text-slate-400 italic">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* EQUIPMENT SETTINGS TAB */}
        {activeTab === 'equipment' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-6">
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
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{isSelected ? 'Active' : 'Not Selected'}</div>
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