import React, { useState, useEffect } from 'react';

type Profile = 'Roxanne' | 'Diana';
type LocationMode = 'garage' | 'planet_fitness';

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
  location: LocationMode;
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

interface MorningWalkLog {
  id: string;
  profile: Profile;
  date: string;
  distanceMiles: number;
  durationMinutes: number;
  notes?: string;
}

const GARAGE_EQUIPMENT = [
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
  const [locationMode, setLocationMode] = useState<LocationMode>('garage');
  const [activeTab, setActiveTab] = useState<'plan' | 'log' | 'metrics' | 'history' | 'equipment'>('plan');

  const isRoxanne = activeProfile === 'Roxanne';

  // Dynamic Theme Colors
  const primaryColor = isRoxanne ? '#ea580c' : '#8b5cf6';
  const primaryGradient = isRoxanne 
    ? 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)' 
    : 'linear-gradient(135deg, #6b21a8, #8b5cf6, #4c1d95)';
  const badgeBg = isRoxanne ? 'rgba(234, 88, 12, 0.2)' : 'rgba(139, 92, 246, 0.2)';
  const badgeBorder = isRoxanne ? '#ea580c' : '#8b5cf6';

  // Data Persistence State
  const [equipment, setEquipment] = useState<string[]>(() => {
    const saved = localStorage.getItem('duofit_equipment');
    return saved ? JSON.parse(saved) : GARAGE_EQUIPMENT.map(e => e.id);
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('duofit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [metricLogs, setMetricLogs] = useState<BodyMetricLog[]>(() => {
    const saved = localStorage.getItem('duofit_metrics');
    return saved ? JSON.parse(saved) : [];
  });

  const [walkLogs, setWalkLogs] = useState<MorningWalkLog[]>(() => {
    const saved = localStorage.getItem('duofit_walks');
    return saved ? JSON.parse(saved) : [];
  });

  // Input States
  const [weightInput, setWeightInput] = useState('');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('6');
  const [metricNotes, setMetricNotes] = useState('');

  const [walkDistance, setWalkDistance] = useState('');
  const [walkDuration, setWalkDuration] = useState('');
  const [walkNotes, setWalkNotes] = useState('');

  const [workoutType, setWorkoutType] = useState<'Strength' | 'Cardio' | 'Conditioning' | 'Mixed'>('Strength');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [cardioActivity, setCardioActivity] = useState('Concept2 Rower / Treadmill');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    { id: '1', name: locationMode === 'garage' ? 'NordicTrack Bench Press' : 'PF Smith Machine Press', sets: 4, reps: 8, weight: 135 },
  ]);
  const [notes, setNotes] = useState('');

  // LocalStorage Sync
  useEffect(() => localStorage.setItem('duofit_equipment', JSON.stringify(equipment)), [equipment]);
  useEffect(() => localStorage.setItem('duofit_logs', JSON.stringify(workoutLogs)), [workoutLogs]);
  useEffect(() => localStorage.setItem('duofit_metrics', JSON.stringify(metricLogs)), [metricLogs]);
  useEffect(() => localStorage.setItem('duofit_walks', JSON.stringify(walkLogs)), [walkLogs]);

  // BMI Calculation
  const calculatedInches = (parseInt(heightFeet) || 0) * 12 + (parseInt(heightInches) || 0);
  const numericWeight = parseFloat(weightInput) || 0;
  const liveBmi = (numericWeight > 0 && calculatedInches > 0)
    ? ((numericWeight / (calculatedInches * calculatedInches)) * 703).toFixed(1)
    : '0.0';

  const toggleEquipment = (id: string) => {
    setEquipment((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const addExerciseRow = () => {
    setExercises([...exercises, { id: Date.now().toString(), name: '', sets: 3, reps: 10, weight: 0 }]);
  };

  const updateExercise = (id: string, field: keyof ExerciseLog, value: any) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
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
      location: locationMode,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: workoutType,
      title: workoutTitle,
      exercises: workoutType !== 'Cardio' ? exercises : [],
      cardioDetails: workoutType !== 'Strength' ? {
        activity: cardioActivity,
        distanceMiles: parseFloat(distance) || 0,
        durationMinutes: parseInt(duration) || 0,
      } : undefined,
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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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

  const handleSaveWalk = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(walkDistance);
    const dur = parseInt(walkDuration);
    if (!dist || !dur) return;

    const newWalk: MorningWalkLog = {
      id: `walk-${Date.now()}`,
      profile: activeProfile,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      distanceMiles: dist,
      durationMinutes: dur,
      notes: walkNotes,
    };

    setWalkLogs([newWalk, ...walkLogs]);
    setWalkDistance('');
    setWalkDuration('');
    setWalkNotes('');
    alert(`🌅 Morning walk logged for ${activeProfile}!`);
  };

  const startPlanSession = (title: string, type: 'Strength' | 'Cardio' | 'Conditioning' | 'Mixed') => {
    setWorkoutTitle(title);
    setWorkoutType(type);
    setActiveTab('log');
  };

  const profileLogs = workoutLogs.filter((log) => log.profile === activeProfile);
  const profileMetrics = metricLogs.filter((m) => m.profile === activeProfile);
  const profileWalks = walkLogs.filter((w) => w.profile === activeProfile);

  const latestMetric = profileMetrics[0];
  const baselineMetric = profileMetrics[profileMetrics.length - 1];
  const weightDifference = (latestMetric && baselineMetric && profileMetrics.length > 1)
    ? (latestMetric.weightLbs - baselineMetric.weightLbs).toFixed(1)
    : null;

  // Unified Feed Aggregation
  const combinedHistory = [
    ...profileLogs.map(l => ({ ...l, feedType: 'workout' as const })),
    ...profileMetrics.map(m => ({ ...m, feedType: 'metric' as const })),
    ...profileWalks.map(w => ({ ...w, feedType: 'walk' as const })),
  ].sort((a, b) => b.id.localeCompare(a.id));

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
                  {locationMode === 'garage' ? '🏠 Garage Edition' : '🟣 Planet Fitness Edition'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginTop: '4px', margin: 0 }}>
                {isRoxanne ? '⚡ Sunset Orange Mode (Roxanne)' : '💜 Royal Purple Mode (Diana)'}
              </p>
            </div>

            {/* Profile & Location Switchers */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Location Toggle */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '16px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLocationMode('garage')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    background: locationMode === 'garage' ? '#38bdf8' : 'transparent',
                    color: locationMode === 'garage' ? '#0f172a' : '#ffffff',
                  }}
                >
                  🏠 Garage
                </button>
                <button
                  onClick={() => setLocationMode('planet_fitness')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    background: locationMode === 'planet_fitness' ? '#a855f7' : 'transparent',
                    color: '#ffffff',
                  }}
                >
                  🟣 PF Gym
                </button>
              </div>

              {/* Profile Toggle */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '16px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setActiveProfile('Roxanne')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '11px',
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
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    background: !isRoxanne ? '#8b5cf6' : 'transparent',
                    color: '#ffffff',
                  }}
                >
                  👑 Diana
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Workouts:</span>
              <strong style={{ color: '#fff' }}>{profileLogs.length}</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Morning Walks:</span>
              <strong style={{ color: '#fff' }}>{profileWalks.length}</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Latest Weight:</span>
              <strong style={{ color: '#fff' }}>{latestMetric ? `${latestMetric.weightLbs} lbs` : '--'}</strong>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'plan', label: '📋 Custom Plan' },
              { id: 'log', label: '⚡ Log Workout' },
              { id: 'metrics', label: '⚖️ Weight & Walks' },
              { id: 'history', label: `📊 Progress Feed (${combinedHistory.length})` },
              { id: 'equipment', label: '⚙️ Garage Gear' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
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

        {/* METRICS & MORNING WALKS TAB */}
        {activeTab === 'metrics' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
                ⚖️ Weight, BMI & Morning Walk Log ({activeProfile})
              </h2>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Current Weight</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                  {latestMetric ? `${latestMetric.weightLbs} lbs` : 'No logs yet'}
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Auto-Calculated BMI</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, marginTop: '4px' }}>
                  {latestMetric ? latestMetric.bmi : 'No logs yet'}
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Weight Loss Change</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: weightDifference && parseFloat(weightDifference) <= 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                  {weightDifference ? `${weightDifference} lbs` : 'Log 2+ entries'}
                </div>
              </div>
            </div>

            {/* Morning Walk Logger */}
            <form onSubmit={handleSaveWalk} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #38bdf8' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🌅 Quick Log: Morning Walk</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Distance (Miles)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3.25"
                    value={walkDistance}
                    onChange={(e) => setWalkDistance(e.target.value)}
                    required
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Time (Minutes)</label>
                  <input
                    type="number"
                    placeholder="e.g., 45"
                    value={walkDuration}
                    onChange={(e) => setWalkDuration(e.target.value)}
                    required
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Early 5 AM neighborhood pace walk..."
                  value={walkNotes}
                  onChange={(e) => setWalkNotes(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                Save Morning Walk 🌅
              </button>
            </form>

            {/* Weight & BMI Input Form */}
            <form onSubmit={handleSaveMetric} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>⚖️ Log Weight Entry</h3>
              
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
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Auto BMI</label>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: primaryColor, fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                    {liveBmi}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Post morning walk..."
                  value={metricNotes}
                  onChange={(e) => setMetricNotes(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ background: primaryColor, color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                Save Body Metrics 📊
              </button>
            </form>
          </main>
        )}

        {/* CUSTOM PLAN TAB */}
        {activeTab === 'plan' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
                {locationMode === 'garage' 
                  ? `🏠 Garage Edition Plan (${activeProfile})` 
                  : `🟣 Planet Fitness Plan (${activeProfile})`}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                {locationMode === 'garage' 
                  ? 'Tailored for home garage equipment.' 
                  : 'Tailored for Planet Fitness Smith Machines, Cable Towers & Cardio Decks.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {(locationMode === 'garage' ? [
                {
                  title: '🏃 Session 1: Cardio & Endurance',
                  tag: 'Garage Cardio',
                  items: [
                    equipment.includes('rower') && 'Concept2 Rower: 500m Interval Sprints (5 sets)',
                    equipment.includes('airbike') && 'Assault AirBike: 20/10 Calorie Intervals (15 mins)',
                    'Outdoor Endurance Run / Tempo Walk',
                  ].filter(Boolean),
                  type: 'Cardio' as const,
                },
                {
                  title: '🏋️ Session 2: Rack & Bench Heavy Strength',
                  tag: 'Garage Strength',
                  items: [
                    equipment.includes('bench') && equipment.includes('barbell') && 'NordicTrack Bench Press (Flat/Incline 4x8)',
                    equipment.includes('barbell') && 'Titan Rack Barbell Squats (4x8)',
                    equipment.includes('dumbbells') && 'Dumbbell Rows & Overhead Presses (3x10)',
                  ].filter(Boolean),
                  type: 'Strength' as const,
                },
              ] : [
                {
                  title: '🟣 PF Session 1: Cable Tower & DB Circuit',
                  tag: 'Planet Fitness',
                  items: [
                    'PF Cable Lat Pulldowns & Tricep Pushdowns (4x12)',
                    'Dumbbell Chest Press & Incline Flyes (4x10)',
                    'Treadmill Incline Power Walk (20 mins at 12% Incline)',
                  ],
                  type: 'Strength' as const,
                },
                {
                  title: '🟣 PF Session 2: Smith Machine Heavy Day',
                  tag: 'Planet Fitness',
                  items: [
                    'Smith Machine Squats or Romanian Deadlifts (4x10)',
                    'Smith Machine Shoulder Press (3x10)',
                    'StairMaster Interval Challenge (15 mins)',
                  ],
                  type: 'Strength' as const,
                },
              ]).map((s, idx) => (
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
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>
              Log Workout for {activeProfile} ({locationMode === 'garage' ? '🏠 Garage' : '🟣 Planet Fitness'})
            </h2>
            
            <form onSubmit={handleSaveWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Workout Title</label>
                <input
                  type="text"
                  placeholder="e.g., Cable Pulldowns or Rack Bench Press"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  required
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '10px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

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

              <button type="submit" style={{ background: primaryColor, color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
                Save Log Entry 💾
              </button>
            </form>
          </main>
        )}

        {/* PROGRESS FEED & HISTORY TAB */}
        {activeTab === 'history' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: primaryColor, margin: 0 }}>📊 Progress Feed ({activeProfile})</h2>
            {combinedHistory.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>No activity logged yet.</p>
            ) : (
              combinedHistory.map((item) => {
                if (item.feedType === 'workout') {
                  return (
                    <div key={item.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#fff' }}>🏋️ {item.title}</strong>
                          <span style={{ fontSize: '10px', background: item.location === 'garage' ? '#0284c7' : '#9333ea', color: '#fff', padding: '2px 6px', borderRadius: '6px', marginLeft: '8px' }}>
                            {item.location === 'garage' ? 'Garage' : 'PF Gym'}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.date}</span>
                      </div>
                      <ul style={{ fontSize: '12px', color: '#cbd5e1', paddingLeft: '16px', margin: 0 }}>
                        {item.exercises.map((e, i) => (
                          <li key={i}>{e.name}: {e.sets} sets × {e.reps} reps {e.weight ? `@ ${e.weight} lbs` : ''}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                if (item.feedType === 'walk') {
                  return (
                    <div key={item.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#38bdf8' }}>🌅 Morning Walk</strong>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                          {item.distanceMiles} miles in {item.durationMinutes} mins
                        </div>
                        {item.notes && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>"{item.notes}"</div>}
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.date}</span>
                    </div>
                  );
                }

                return (
                  <div key={item.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#10b981' }}>⚖️ Body Weight Entry</strong>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                        {item.weightLbs} lbs | BMI: {item.bmi}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.date}</span>
                  </div>
                );
              })
            )}
          </main>
        )}

        {/* GEAR TAB */}
        {activeTab === 'equipment' && (
          <main style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>Garage Equipment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {GARAGE_EQUIPMENT.map((item) => {
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