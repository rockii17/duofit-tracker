import React, { useState, useEffect } from 'react';

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

interface BodyMetricLog {
  id: string;
  profile: Profile;
  date: string;
  weightLbs: number;
  heightInches: number;
  bmi: number;
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
  const [activeTab, setActiveTab] = useState<'plan' | 'log' | 'metrics' | 'history' | 'equipment'>('plan');

  const isRoxanne = activeProfile === 'Roxanne';

  // Dynamic Visual Styles
  const primaryColor = isRoxanne ? '#ea580c' : '#8b5cf6';
  const primaryGradient = isRoxanne 
    ? 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)' 
    : 'linear-gradient(135deg, #6b21a8, #8b5cf6, #4c1d95)';
  const badgeBg = isRoxanne ? 'rgba(234, 88, 12, 0.2)' : 'rgba(139, 92, 246, 0.2)';
  const badgeBorder = isRoxanne ? '#ea580c' : '#8b5cf6';

  // Equipment & Workout State
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

  // Body Metrics State
  const [metricLogs, setMetricLogs] = useState<BodyMetricLog[]>(() => {
    const saved = localStorage.getItem('duofit_metrics');
    return saved ? JSON.parse(saved) : [];
  });

  const [weightInput, setWeightInput] = useState('');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('6');
  const [metricNotes, setMetricNotes] = useState('');

  // Workout Log Form State
  const [workoutType, setWorkoutType] = useState<'Strength' | 'Cardio' | 'Conditioning' | 'Mixed'>('Strength');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [cardioActivity, setCardioActivity] = useState('Concept2 Rower / Outdoor Run');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    { id: '1', name: 'NordicTrack Bench Press', sets: 4, reps: 8, weight: 135 },
  ]);
  const [notes, setNotes] = useState('');

  // Local Storage Sync
  useEffect(() => {
    localStorage.setItem('duofit_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('duofit_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('duofit_metrics', JSON.stringify(metricLogs));
  }, [metricLogs]);

  // BMI Calculation Formula: (Weight in lbs / (Height in inches)^2) * 703
  const calculatedInches = (parseInt(heightFeet) || 0) * 12 + (parseInt(heightInches) || 0);
  const numericWeight = parseFloat(weightInput) || 0;
  const liveBmi = (numericWeight > 0 && calculatedInches > 0)
    ? ((numericWeight / (calculatedInches * calculatedInches)) * 703).toFixed(1)
    : '0.0';

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

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericWeight || calculatedInches <= 0) return;

    const newMetric: BodyMetricLog = {
      id: `metric-${Date.now()}`,
      profile: activeProfile,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      weightLbs: numericWeight,
      heightInches: calculatedInches,
      bmi: parseFloat(liveBmi),
      notes: metricNotes,
    };

    setMetricLogs([newMetric, ...metricLogs]);
    setWeightInput('');
    setMetricNotes('');
    alert(`📊 Body metrics logged for ${activeProfile}!`);
  };

  const startPlanSession = (title: string, type: 'Strength' | 'Cardio' | 'Conditioning' | 'Mixed') => {
    setWorkoutTitle(title);
    setWorkoutType(type);
    setActiveTab('log');
  };

  const profileLogs = workoutLogs.filter((log) => log.profile === activeProfile);
  const profileMetrics = metricLogs.filter((m) => m.profile === activeProfile);

  // Weight Change Calculation
  const latestMetric = profileMetrics[0];
  const baselineMetric = profileMetrics[profileMetrics.length - 1];
  const weightDifference = (latestMetric && baselineMetric && profileMetrics.length > 1)
    ? (latestMetric.weightLbs - baselineMetric.weightLbs).toFixed(1)
    : null;

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9', fontFamily: 'sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Dynamic Header */}
        <header style={{
          background: primaryGradient,
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', margin: 0 }}>DUOFIT TRACKER</h1>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  Garage Edition
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginTop: '4px', margin: 0 }}>
                {isRoxanne ? '⚡ Sunset Orange Mode (Roxanne)' : '💜 Royal Purple Mode (Diana)'}
              </p>
            </div>

            {/* Profile Switcher */}
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '16px', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActiveProfile('Roxanne')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: isRoxanne ? '#ea580c' : 'transparent',
                  color: '#ffffff',
                }}
              >
                🔥 Roxanne
              </button>
              <button
                onClick={() => setActiveProfile('Diana')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: !isRoxanne ? '#8b5cf6' : 'transparent',
                  color: '#ffffff',
                }}
              >
                👑 Diana
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Workouts:</span>
              <strong style={{ color: '#fff' }}>{profileLogs.length}</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Latest Weight:</span>
              <strong style={{ color: '#fff' }}>{latestMetric ? `${latestMetric.weightLbs} lbs` : '--'}</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Current BMI:</span>
              <strong style={{ color: '#fff' }}>{latestMetric ? latestMetric.bmi : '--'}</strong>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'plan', label: '📋 Custom Plan' },
              { id: 'log', label: '⚡ Log Workout' },
              { id: 'metrics', label: '⚖️ Weight & BMI' },
              { id: 'history', label: `📜 History (${profileLogs.length})` },
              { id: 'equipment', label: '⚙️ Garage Gear' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: activeTab === tab.id ? '#ffffff' : 'rgba(15, 23, 42, 0.6)',
                  color: activeTab === tab.id ? primaryColor : '#ffffff',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* BODY METRICS & BMI TRACKER TAB */}
        {activeTab === 'metrics' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
                ⚖️ Weight, BMI & Progress Tracker ({activeProfile})
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Log entries over time to automatically calculate BMI and total weight loss.</p>
            </div>

            {/* Quick Metrics Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Current Weight</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                  {latestMetric ? `${latestMetric.weightLbs} lbs` : 'No logs yet'}
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Auto-Calculated BMI</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: primaryColor, marginTop: '4px' }}>
                  {latestMetric ? latestMetric.bmi : 'No logs yet'}
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Change</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: weightDifference && parseFloat(weightDifference) <= 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                  {weightDifference ? `${weightDifference} lbs` : 'Log 2+ entries'}
                </div>
              </div>
            </div>

            {/* Metric Input Form */}
            <form onSubmit={handleSaveMetric} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>+ Log New Weight Entry</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 165.4"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    required
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Height (Feet & Inches)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      placeholder="Ft"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      style={{ width: '50%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', textAlign: 'center' }}
                    />
                    <input
                      type="number"
                      placeholder="In"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      style={{ width: '50%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Auto-Calculated BMI</label>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: primaryColor, fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                    {liveBmi}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Morning weight after outdoor long run..."
                  value={metricNotes}
                  onChange={(e) => setMetricNotes(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ background: primaryColor, color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
                Save Body Metrics 📊
              </button>
            </form>

            {/* Metric History List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>{activeProfile}'s Weight History</h3>
              {profileMetrics.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>No metrics recorded yet. Log your first weight entry above!</p>
              ) : (
                profileMetrics.map((m) => (
                  <div key={m.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#fff' }}>{m.weightLbs} lbs</strong>
                      <span style={{ fontSize: '11px', color: primaryColor, marginLeft: '10px' }}>BMI: {m.bmi}</span>
                      {m.notes && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>"{m.notes}"</div>}
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{m.date}</span>
                  </div>
                ))
              )}
            </div>
          </main>
        )}

        {/* CUSTOM PLAN TAB */}
        {activeTab === 'plan' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
                  {isRoxanne ? '🔥 Roxanne\'s Tailored Routine' : '👑 Diana\'s Custom Workout Plan'}
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Generated for your {equipment.length} active garage items.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {[
                {
                  title: '🏃 Session 1: Cardio & Endurance',
                  tag: 'Aerobic',
                  items: [
                    equipment.includes('rower') && 'Concept2 Rower: 500m Interval Sprints (5 sets)',
                    equipment.includes('airbike') && 'Assault AirBike: 20/10 Calorie Intervals (15 mins)',
                    equipment.includes('plyo_boxes') && 'Jump Rope Warm-up (3x2 mins)',
                    'Outdoor Long-Distance Run / Endurance Tempo Walk',
                  ].filter(Boolean),
                  type: 'Cardio' as const,
                },
                {
                  title: '🏋️ Session 2: Rack & Bench Heavy Strength',
                  tag: 'Strength',
                  items: [
                    equipment.includes('bench') && equipment.includes('barbell') && 'NordicTrack Bench Press (Flat/Incline 4x8)',
                    equipment.includes('bench') && equipment.includes('dumbbells') && 'Incline Dumbbell Chest Flyes & Rows (3x10)',
                    equipment.includes('barbell') && 'Titan Rack Barbell Squats or Deadlifts (4x8)',
                    equipment.includes('rack') && 'Landmine Rotations & Presses (3x10)',
                  ].filter(Boolean),
                  type: 'Strength' as const,
                },
                {
                  title: '💥 Session 3: Full Body Conditioning',
                  tag: 'Conditioning',
                  items: [
                    equipment.includes('med_slam_balls') && 'Medicine Ball Wall Balls or Russian Twists (4x15)',
                    equipment.includes('kettlebell') && 'Heavy Kettlebell Swings (4x15)',
                    equipment.includes('plyo_boxes') && 'Plyo Box Step-ups or Jump Squats (3x12)',
                  ].filter(Boolean),
                  type: 'Conditioning' as const,
                },
              ].map((s, idx) => (
                <div key={idx} style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>{s.title}</h3>
                    <span style={{ fontSize: '10px', background: badgeBg, border: `1px solid ${badgeBorder}`, color: primaryColor, padding: '2px 6px', borderRadius: '8px' }}>{s.tag}</span>
                  </div>
                  <ul style={{ fontSize: '12px', color: '#cbd5e1', paddingLeft: '16px', margin: 0 }}>
                    {s.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <button
                    onClick={() => startPlanSession(s.title, s.type)}
                    style={{ marginTop: 'auto', background: primaryColor, color: '#fff', border: 'none', padding: '8px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Start Session 🚀
                  </button>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* LOG WORKOUT TAB */}
        {activeTab === 'log' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>Log Workout for {activeProfile}</h2>
            
            <form onSubmit={handleSaveWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Workout Title</label>
                <input
                  type="text"
                  placeholder="e.g., Garage Bench Press & Rows"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  required
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              {/* Cardio Fields */}
              {workoutType !== 'Strength' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: '#0f172a', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block' }}>Activity</label>
                    <input
                      type="text"
                      value={cardioActivity}
                      onChange={(e) => setCardioActivity(e.target.value)}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block' }}>Distance (Miles)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="3.5"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block' }}>Duration (Mins)</label>
                    <input
                      type="number"
                      placeholder="45"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Exercises */}
              {exercises.map((ex) => (
                <div key={ex.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#0f172a', padding: '8px', borderRadius: '10px' }}>
                  <input
                    type="text"
                    placeholder="Exercise"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                    style={{ flex: 2, background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <input
                    type="number"
                    placeholder="Sets"
                    value={ex.sets || ''}
                    onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value) || 0)}
                    style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={ex.reps || ''}
                    onChange={(e) => updateExercise(ex.id, 'reps', parseInt(e.target.value) || 0)}
                    style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    placeholder="lbs"
                    value={ex.weight || ''}
                    onChange={(e) => updateExercise(ex.id, 'weight', parseFloat(e.target.value) || 0)}
                    style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px', textAlign: 'center' }}
                  />
                  <button type="button" onClick={() => removeExercise(ex.id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                </div>
              ))}

              <button type="button" onClick={addExerciseRow} style={{ background: 'none', border: 'none', color: primaryColor, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start' }}>+ Add Row</button>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on bench angle, tempo, or feel..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ background: primaryColor, color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
                Save Log Entry 💾
              </button>
            </form>
          </main>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>{activeProfile}'s Logged Sessions</h2>
            {profileLogs.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>No workouts saved yet.</p>
            ) : (
              profileLogs.map((log) => (
                <div key={log.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#fff' }}>{log.title}</strong>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{log.date}</span>
                  </div>
                  <ul style={{ fontSize: '12px', color: '#cbd5e1', paddingLeft: '16px', margin: 0 }}>
                    {log.exercises.map((e, i) => (
                      <li key={i}>{e.name}: {e.sets} sets × {e.reps} reps {e.weight ? `@ ${e.weight} lbs` : ''}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </main>
        )}

        {/* GEAR TAB */}
        {activeTab === 'equipment' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>Garage Equipment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {DEFAULT_EQUIPMENT.map((item) => {
                const isSelected = equipment.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleEquipment(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #f59e0b' : '1px solid #334155',
                      background: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                      color: isSelected ? '#fef3c7' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.name}</span>
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