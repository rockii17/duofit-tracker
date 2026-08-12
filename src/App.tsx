import React, { useState, useEffect } from 'react';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://opnyvfzkkjzxyyrvgoeb.supabase.co";
const SUPABASE_KEY = "sb_publishable_g_ly5yGvBkLzTBW1k-1iLg_9VBZDKny";

const headers: Record<string, string> = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

export interface Exercise {
  name: string;
  category: string;
  location: string[];
  sets?: number;
  reps?: number;
  rest?: string;
  completedSets?: number;
  weightInput?: string;
  repsInput?: string;
}

export interface WorkoutLog {
  id: string;
  created_at: string;
  profile: string;
  exercise_name: string;
  weight_lbs: number;
  reps: number;
  sets: number;
  workout_format?: string;
}

// --- EXERCISE DATABASE ---
const EXERCISE_POOL: Record<string, Exercise[]> = {
  Chest: [
    { name: "Barbell Bench Press", category: "Chest", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Incline Dumbbell Press", category: "Chest", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Chest Fly Machine", category: "Chest", location: ["Planet Fitness"] },
    { name: "Push-Ups", category: "Chest", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Dumbbell Pullover", category: "Chest", location: ["Garage Gym", "Planet Fitness"] }
  ],
  Back: [
    { name: "Barbell Deadlift", category: "Back", location: ["Garage Gym"] },
    { name: "Lat Pulldown", category: "Back", location: ["Planet Fitness"] },
    { name: "Dumbbell Single-Arm Row", category: "Back", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Seated Cable Row", category: "Back", location: ["Planet Fitness"] },
    { name: "Pull-Ups / Inverted Rows", category: "Back", location: ["Garage Gym", "Planet Fitness"] }
  ],
  Shoulders: [
    { name: "Overhead Barbell Press", category: "Shoulders", location: ["Garage Gym"] },
    { name: "Seated Dumbbell Shoulder Press", category: "Shoulders", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Lateral Raises", category: "Shoulders", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Face Pulls", category: "Shoulders", location: ["Planet Fitness"] },
    { name: "Front Dumbbell Raises", category: "Shoulders", location: ["Garage Gym", "Planet Fitness"] }
  ],
  Legs: [
    { name: "Barbell Back Squat", category: "Legs", location: ["Garage Gym"] },
    { name: "Leg Press", category: "Legs", location: ["Planet Fitness"] },
    { name: "Goblet Squat", category: "Legs", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Romanian Deadlift", category: "Legs", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Walking Lunges", category: "Legs", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Leg Extension / Curl", category: "Legs", location: ["Planet Fitness"] }
  ],
  Arms: [
    { name: "Barbell / EZ Bar Curls", category: "Arms", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Dumbbell Hammer Curls", category: "Arms", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Tricep Rope Pushdowns", category: "Arms", location: ["Planet Fitness"] },
    { name: "Skull Crushers", category: "Arms", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Dips", category: "Arms", location: ["Garage Gym", "Planet Fitness"] }
  ],
  Core: [
    { name: "Hanging Leg Raises", category: "Core", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Plank Hold", category: "Core", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Ab Mat Crunches", category: "Core", location: ["Garage Gym", "Planet Fitness"] },
    { name: "Cable Woodchoppers", category: "Core", location: ["Planet Fitness"] }
  ]
};

export default function DuoFitEngine() {
  const [profile, setProfile] = useState<'Roxanne' | 'Diana'>('Roxanne');
  const [locationMode, setLocationMode] = useState<'Garage Gym' | 'Planet Fitness'>('Garage Gym');
  const [activeTab, setActiveTab] = useState<'Builder' | 'Active' | 'History'>('Builder');

  // Generator selections
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['Chest', 'Arms']);
  const [workoutFormat, setWorkoutFormat] = useState<string>('Standard (3x10)');
  const [generatedRoutine, setGeneratedRoutine] = useState<Exercise[]>([]);

  // Database logs
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ weight_lbs: string; reps: string; sets: string }>({ weight_lbs: '', reps: '', sets: '' });

  // Load logs from Supabase
  const fetchLogs = async (): Promise<void> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?select=*&order=created_at.desc`, { headers });
      const data: WorkoutLog[] = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (err) {
      console.error("Failed to load workout logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const themeColor = profile === 'Roxanne' ? '#ff6b00' : '#8a2be2';

  const toggleMuscle = (muscle: string): void => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter((m: string) => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const generateWorkout = (): void => {
    if (selectedMuscles.length === 0) return;

    const routine: Exercise[] = [];
    selectedMuscles.forEach((muscle: string) => {
      const categoryPool: Exercise[] = EXERCISE_POOL[muscle] || EXERCISE_POOL['Arms'] || [];
      const valid: Exercise[] = categoryPool.filter((e: Exercise) => e.location.includes(locationMode));
      if (valid.length > 0) {
        const randomEx: Exercise = valid[Math.floor(Math.random() * valid.length)];
        if (!routine.some((r: Exercise) => r.name === randomEx.name)) {
          routine.push({
            ...randomEx,
            sets: 3,
            reps: 10,
            rest: "60 sec",
            completedSets: 0,
            weightInput: '',
            repsInput: '10'
          });
        }
      }
    });

    setGeneratedRoutine(routine);
    setActiveTab('Active');
  };

  const swapExercise = (index: number): void => {
    const item: Exercise = generatedRoutine[index];
    if (!item) return;
    const categoryPool: Exercise[] = EXERCISE_POOL[item.category] || [];
    const valid: Exercise[] = categoryPool.filter((e: Exercise) => e.location.includes(locationMode) && e.name !== item.name);

    if (valid.length > 0) {
      const newEx: Exercise = valid[Math.floor(Math.random() * valid.length)];
      const updated: Exercise[] = [...generatedRoutine];
      updated[index] = { ...item, name: newEx.name };
      setGeneratedRoutine(updated);
    }
  };

  const getLastSession = (exerciseName: string): string | null => {
    const match: WorkoutLog | undefined = logs.find((l: WorkoutLog) => l.exercise_name === exerciseName && l.profile === profile);
    if (!match) return null;
    return `${match.weight_lbs || 0} lbs × ${match.reps} reps (${new Date(match.created_at).toLocaleDateString()})`;
  };

  const handleLogSet = async (exercise: Exercise): Promise<void> => {
    if (!exercise.weightInput || !exercise.repsInput) return;

    const payload = {
      profile: profile,
      exercise_name: exercise.name,
      weight_lbs: parseFloat(exercise.weightInput),
      reps: parseInt(exercise.repsInput, 10),
      sets: 1,
      workout_format: workoutFormat
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchLogs();
        alert(`Logged set for ${exercise.name}!`);
      }
    } catch (err) {
      console.error("Error saving log:", err);
    }
  };

  const startEdit = (log: WorkoutLog): void => {
    setEditingLogId(log.id);
    setEditForm({ weight_lbs: String(log.weight_lbs), reps: String(log.reps), sets: String(log.sets) });
  };

  const saveEdit = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          weight_lbs: parseFloat(editForm.weight_lbs),
          reps: parseInt(editForm.reps, 10),
          sets: parseInt(editForm.sets, 10)
        })
      });
      if (res.ok) {
        setEditingLogId(null);
        fetchLogs();
      }
    } catch (err) {
      console.error("Error editing log:", err);
    }
  };

  const deleteLog = async (id: string): Promise<void> => {
    if (!confirm("Delete this log entry?")) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) fetchLogs();
    } catch (err) {
      console.error("Error deleting log:", err);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER & PROFILE TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: themeColor }}>DuoFit Engine</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setProfile('Roxanne')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: profile === 'Roxanne' ? '#ff6b00' : '#334155',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Roxanne
          </button>
          <button
            onClick={() => setProfile('Diana')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: profile === 'Diana' ? '#8a2be2' : '#334155',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Diana
          </button>
        </div>
      </div>

      {/* LOCATION MODE */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setLocationMode('Garage Gym')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: locationMode === 'Garage Gym' ? '#10b981' : '#1e293b',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Garage Gym Mode
        </button>
        <button
          onClick={() => setLocationMode('Planet Fitness')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: locationMode === 'Planet Fitness' ? '#3b82f6' : '#1e293b',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Planet Fitness Mode
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
        {(['Builder', 'Active', 'History'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? `3px solid ${themeColor}` : 'none',
              color: activeTab === tab ? themeColor : '#94a3b8',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {tab === 'Builder' ? 'Workout Builder' : tab === 'Active' ? `Active Plan (${generatedRoutine.length})` : 'History'}
          </button>
        ))}
      </div>

      {/* TAB 1: WORKOUT BUILDER */}
      {activeTab === 'Builder' && (
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>1. Select Target Muscle Groups</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'].map((muscle: string) => {
              const selected = selectedMuscles.includes(muscle);
              return (
                <button
                  key={muscle}
                  onClick={() => toggleMuscle(muscle)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selected ? themeColor : '#1e293b',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {muscle}
                </button>
              );
            })}
          </div>

          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>2. Select Workout Format</h3>
          <select
            value={workoutFormat}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWorkoutFormat(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              marginBottom: '20px'
            }}
          >
            <option value="Standard (3x10)">Standard (3 Sets × 10–12 Reps)</option>
            <option value="EMOM (12 Mins)">EMOM (Every Minute on Minute - 12 Mins)</option>
            <option value="AMRAP (15 Mins)">AMRAP (As Many Rounds As Possible)</option>
            <option value="Pyramid (12-10-8-6)">Pyramid Sets (12-10-8-6 Reps)</option>
          </select>

          <button
            onClick={generateWorkout}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: themeColor,
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Generate Routine Plan
          </button>
        </div>
      )}

      {/* TAB 2: ACTIVE WORKOUT ROUTINE */}
      {activeTab === 'Active' && (
        <div>
          {generatedRoutine.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No active routine generated yet. Go to Workout Builder to generate one!</p>
          ) : (
            generatedRoutine.map((ex: Exercise, idx: number) => {
              const lastStats = getLastSession(ex.name);
              return (
                <div key={idx} style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>{ex.name}</h4>
                    <button
                      onClick={() => swapExercise(idx)}
                      style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🔄 Swap
                    </button>
                  </div>

                  {/* LAST SESSION INDICATOR */}
                  {lastStats ? (
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '8px' }}>
                      <strong>Last Time:</strong> {lastStats}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      No past records found
                    </div>
                  )}

                  {/* LOG INPUT FIELD */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
                    <input
                      type="number"
                      placeholder="Lbs"
                      value={ex.weightInput || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updated = [...generatedRoutine];
                        updated[idx].weightInput = e.target.value;
                        setGeneratedRoutine(updated);
                      }}
                      style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={ex.repsInput || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updated = [...generatedRoutine];
                        updated[idx].repsInput = e.target.value;
                        setGeneratedRoutine(updated);
                      }}
                      style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}
                    />
                    <button
                      onClick={() => handleLogSet(ex)}
                      style={{ flex: 1, padding: '8px', backgroundColor: themeColor, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Log Set
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: WORKOUT HISTORY (EDITABLE) */}
      {activeTab === 'History' && (
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Shared Workout History</h3>
          {logs.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No recorded workouts yet.</p>
          ) : (
            logs.map((log: WorkoutLog) => {
              const isEditing = editingLogId === log.id;
              const isRoxanne = log.profile === 'Roxanne';

              return (
                <div key={log.id} style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: `4px solid ${isRoxanne ? '#ff6b00' : '#8a2be2'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: isRoxanne ? '#ff6b00' : '#8a2be2' }}>{log.profile}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '6px' }}>{log.exercise_name}</div>

                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={editForm.weight_lbs}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, weight_lbs: e.target.value })}
                        style={{ width: '65px', padding: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                      />
                      <span>lbs</span>
                      <input
                        type="number"
                        value={editForm.reps}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, reps: e.target.value })}
                        style={{ width: '55px', padding: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                      />
                      <span>reps</span>
                      <button onClick={() => saveEdit(log.id)} style={{ padding: '6px 10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingLogId(null)} style={{ padding: '6px 10px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#cbd5e1' }}>{log.weight_lbs || 0} lbs × {log.reps} reps</span>
                      <div>
                        <button onClick={() => startEdit(log)} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#334155', color: '#38bdf8', border: 'none', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteLog(log.id)} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#334155', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}