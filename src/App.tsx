import React, { useState, useEffect } from 'react';

type UserProfile = 'Roxanne' | 'Diana';
type LocationMode = 'garage' | 'planet_fitness';
type MuscleTarget = 'legs' | 'back' | 'chest' | 'shoulders' | 'arms' | 'core' | 'cardio';
type WorkoutFormat = 'standard' | 'emom' | 'amrap' | 'pyramid';
type FilterMode = 'muscle' | 'equipment';

interface GeneratedExercise {
  name: string;
  equipment: string;
  prescription: string;
  muscleGroup: MuscleTarget;
}

interface StrengthSet {
  id: string;
  exerciseName: string;
  weightLbs: number;
  reps: number;
  seatSetting?: string;
}

interface StrengthLog {
  id: string;
  date: string;
  profile: UserProfile;
  location: LocationMode;
  routineName: string;
  sets: StrengthSet[];
}

interface CardioLog {
  id: string;
  date: string;
  profile: UserProfile;
  type: 'Run' | 'Walk' | 'Rower' | 'AirBike' | 'Elliptical' | 'StairMaster';
  distanceMiles: number;
  durationMinutes: number;
  notes: string;
}

interface BodyMetrics {
  id: string;
  date: string;
  profile: UserProfile;
  weightLbs: number;
  heightInches: number;
}

const PROFILE_STYLES = {
  Roxanne: { primary: '#f97316', accent: '#fb923c', bgBadge: 'rgba(249, 115, 22, 0.15)', border: '#ea580c' },
  Diana: { primary: '#d946ef', accent: '#f0abfc', bgBadge: 'rgba(217, 70, 239, 0.15)', border: '#c026d3' },
};

const GARAGE_POOL = [
  // Legs
  { name: 'Barbell Back Squat', equipment: 'Titan Power Rack & Bumper Plates', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Goblet Squat', equipment: 'Hex Dumbbells / Kettlebell', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Landmine Hack Squat', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Box Jumps / Step-Ups', equipment: '3-in-1 Soft Plyo Box', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Romanian Deadlift', equipment: 'Barbell & Bumper Plates', muscleGroup: 'legs' as MuscleTarget },
  
  // Back
  { name: 'Barbell Bent-Over Row', equipment: 'Barbell & Bumper Plates', muscleGroup: 'back' as MuscleTarget },
  { name: 'Cable Pulldown (MAG Handle)', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'back' as MuscleTarget },
  { name: 'Landmine Single-Arm Row', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'back' as MuscleTarget },
  { name: 'Single-Arm Row', equipment: 'Hex Dumbbells & NordicTrack Bench', muscleGroup: 'back' as MuscleTarget },
  { name: 'Kettlebell Swings', equipment: 'Kettlebell (Up to 71 lbs)', muscleGroup: 'back' as MuscleTarget },

  // Chest
  { name: 'Barbell Bench Press', equipment: 'Titan Power Rack & NordicTrack Bench', muscleGroup: 'chest' as MuscleTarget },
  { name: 'Incline Dumbbell Press', equipment: 'Hex Dumbbells & NordicTrack Bench', muscleGroup: 'chest' as MuscleTarget },
  { name: 'Landmine Chest Press', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'chest' as MuscleTarget },
  { name: 'Cable Chest Flyes', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'chest' as MuscleTarget },

  // Shoulders
  { name: 'Overhead Barbell Press', equipment: 'Titan Power Rack & Barbell', muscleGroup: 'shoulders' as MuscleTarget },
  { name: 'Dumbbell Lateral Raise', equipment: 'Hex Dumbbells', muscleGroup: 'shoulders' as MuscleTarget },
  { name: 'Landmine Shoulder Press', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'shoulders' as MuscleTarget },
  { name: 'Cable Face Pulls', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'shoulders' as MuscleTarget },

  // Arms
  { name: 'Cable Tricep Pushdown', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'arms' as MuscleTarget },
  { name: 'Dumbbell Bicep Curls', equipment: 'Hex Dumbbells', muscleGroup: 'arms' as MuscleTarget },
  { name: 'Tricep Bench Dips', equipment: 'NordicTrack Bench', muscleGroup: 'arms' as MuscleTarget },
  { name: 'Band Hammer Curls', equipment: 'Resistance Bands', muscleGroup: 'arms' as MuscleTarget },

  // Core & Conditioning
  { name: 'Slam Ball Overheads', equipment: 'Medicine & Slam Balls', muscleGroup: 'core' as MuscleTarget },
  { name: 'Landmine Rotations', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'core' as MuscleTarget },
  { name: 'Battle Rope Waves', equipment: 'Battle Ropes', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Concept2 Rower Intervals', equipment: 'Concept2 Rower', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Assault Bike Sprint Intervals', equipment: 'Assault AirBike', muscleGroup: 'cardio' as MuscleTarget },
];

const PLANET_FITNESS_POOL = [
  // Cardio Equipment
  { name: 'Treadmill Run / Walk', equipment: 'Treadmills', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Elliptical Glider', equipment: 'Ellipticals', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Arc Trainer Strides', equipment: 'Arc Trainers', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Stationary Bike (Upright / Recumbent)', equipment: 'Stationary Bikes (Upright and Recumbent)', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Stair Climber / Stepmill', equipment: 'Stair Climbers / Stepmills', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'PF Rowing Machine', equipment: 'Rowing Machines', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Recumbent Stepper Intervals', equipment: 'Recumbent Steppers', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'Upper Body Ergometer (Arm Bike)', equipment: 'Upper Body Ergometers (Arm Bikes)', muscleGroup: 'cardio' as MuscleTarget },

  // Selectorized Strength Machines
  { name: 'Machine Chest Press', equipment: 'Chest Press Machine', muscleGroup: 'chest' as MuscleTarget },
  { name: 'Pectoral Fly / Reverse Fly', equipment: 'Pectoral Fly / Reverse Fly Machine', muscleGroup: 'chest' as MuscleTarget },
  { name: 'Machine Lat Pulldown', equipment: 'Lat Pulldown Machine', muscleGroup: 'back' as MuscleTarget },
  { name: 'Seated Cable Row', equipment: 'Seated Row Machine', muscleGroup: 'back' as MuscleTarget },
  { name: 'Seated Shoulder Press', equipment: 'Shoulder Press Machine', muscleGroup: 'shoulders' as MuscleTarget },
  { name: 'Machine Lateral Raise', equipment: 'Lateral Raise Machine', muscleGroup: 'shoulders' as MuscleTarget },
  { name: 'Machine Rear Deltoid Fly', equipment: 'Rear Deltoid Machine', muscleGroup: 'shoulders' as MuscleTarget },
  { name: 'Machine Bicep Curl', equipment: 'Bicep Curl Machine', muscleGroup: 'arms' as MuscleTarget },
  { name: 'Tricep Extension / Tricep Press', equipment: 'Tricep Extension / Tricep Press Machine', muscleGroup: 'arms' as MuscleTarget },

  { name: 'Seated Leg Press', equipment: 'Seated Leg Press Machine', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Seated Leg Extension', equipment: 'Leg Extension Machine', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Lying or Seated Leg Curl', equipment: 'Lying or Seated Leg Curl Machine', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Calf Extension Machine', equipment: 'Calf Extension Machine', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Hip Adduction and Abduction', equipment: 'Hip Adduction and Abduction Machine', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Glute Kickback Machine', equipment: 'Glute Machine', muscleGroup: 'legs' as MuscleTarget },

  { name: 'Abdominal Crunch Machine', equipment: 'Abdominal Crunch Machine', muscleGroup: 'core' as MuscleTarget },
  { name: 'Machine Back Extension', equipment: 'Back Extension Machine', muscleGroup: 'back' as MuscleTarget },
  { name: 'Torso Rotation Machine', equipment: 'Torso Rotation Machine', muscleGroup: 'core' as MuscleTarget },

  // Free Weights & Cable Systems
  { name: 'Smith Machine Squat / Bench', equipment: 'Smith Machines', muscleGroup: 'legs' as MuscleTarget },
  { name: 'Dual Cable Pulley Crossovers / Face Pulls', equipment: 'Dual Adjustable Cable Pulleys & Cable Towers', muscleGroup: 'chest' as MuscleTarget },
  { name: 'Assisted Pull-Up and Dip', equipment: 'Assisted Pull-Up and Dip Machine', muscleGroup: 'back' as MuscleTarget },
  { name: 'Dumbbell & Fixed Barbell Moves', equipment: 'Dumbbells & Fixed Barbells', muscleGroup: 'arms' as MuscleTarget },

  // Circuit & Mobility Accessories
  { name: '30-Minute Express Station Rotation', equipment: '30-Minute Express Circuit Stations', muscleGroup: 'cardio' as MuscleTarget },
  { name: 'TRX / Medicine Ball / Kettlebell Mobility Work', equipment: 'Stretch/Mobility Accessories', muscleGroup: 'core' as MuscleTarget },
];

export default function App() {
  const [activeProfile, setActiveProfile] = useState<UserProfile>('Roxanne');
  const [activeTab, setActiveTab] = useState<'generator' | 'workout' | 'cardio' | 'metrics' | 'history'>('generator');
  const [locationMode, setLocationMode] = useState<LocationMode>('garage');
  
  const [filterMode, setFilterMode] = useState<FilterMode>('muscle');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleTarget[]>(['legs', 'back']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<WorkoutFormat>('standard');
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedExercise[]>([]);

  const theme = PROFILE_STYLES[activeProfile];

  const [metricsLogs, setMetricsLogs] = useState<BodyMetrics[]>(() => JSON.parse(localStorage.getItem('duofit_metrics') || '[]'));
  const [cardioLogs, setCardioLogs] = useState<CardioLog[]>(() => JSON.parse(localStorage.getItem('duofit_cardio') || '[]'));
  const [strengthLogs, setStrengthLogs] = useState<StrengthLog[]>(() => JSON.parse(localStorage.getItem('duofit_strength') || '[]'));

  useEffect(() => localStorage.setItem('duofit_metrics', JSON.stringify(metricsLogs)), [metricsLogs]);
  useEffect(() => localStorage.setItem('duofit_cardio', JSON.stringify(cardioLogs)), [cardioLogs]);
  useEffect(() => localStorage.setItem('duofit_strength', JSON.stringify(strengthLogs)), [strengthLogs]);

  const [activeRoutineName, setActiveRoutineName] = useState('Custom Workout');
  const [exName, setExName] = useState('');
  const [exWeight, setExWeight] = useState('');
  const [exReps, setExReps] = useState('');
  const [exSeat, setExSeat] = useState('');
  const [currentSessionSets, setCurrentSessionSets] = useState<StrengthSet[]>([]);

  const [cardioType, setCardioType] = useState<CardioLog['type']>('Run');
  const [cardioDist, setCardioDist] = useState('');
  const [cardioTime, setCardioTime] = useState('');
  const [cardioNotes, setCardioNotes] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('65');

  const currentPool = locationMode === 'garage' ? GARAGE_POOL : PLANET_FITNESS_POOL;
  const availableEquipmentList = Array.from(new Set(currentPool.map((item) => item.equipment)));

  const toggleMuscle = (muscle: MuscleTarget) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const formatPrescription = (format: WorkoutFormat): string => {
    switch (format) {
      case 'emom': return '⏱️ EMOM: 8-10 reps at start of every min (10 mins)';
      case 'amrap': return '🔥 AMRAP: 12 reps per exercise in a 12-min circuit';
      case 'pyramid': return '📐 Pyramid: 12 reps, 10 reps, 8 reps, 6 reps (increase weight)';
      case 'standard': default: return '🎯 Standard: 3 sets x 10-12 reps (60s rest)';
    }
  };

  const handleGenerateWorkout = () => {
    let matches = [];

    if (filterMode === 'muscle') {
      if (selectedMuscles.length === 0) return;
      matches = currentPool.filter((item) => selectedMuscles.includes(item.muscleGroup));
    } else {
      if (selectedEquipment.length === 0) return;
      matches = currentPool.filter((item) => selectedEquipment.includes(item.equipment));
    }

    const compiled: GeneratedExercise[] = matches.map((item) => ({
      ...item,
      prescription: formatPrescription(selectedFormat),
    }));

    setGeneratedWorkout(compiled);
  };

  const handleStartGeneratedWorkout = () => {
    const formatLabel = selectedFormat.toUpperCase();
    const locLabel = locationMode === 'garage' ? 'Garage' : 'PF';
    setActiveRoutineName(`${locLabel} [${formatLabel}] Session`);
    setActiveTab('workout');
  };

  const handleAddSet = () => {
    if (!exName || !exWeight || !exReps) return;
    const newSet: StrengthSet = {
      id: Date.now().toString(),
      exerciseName: exName,
      weightLbs: parseFloat(exWeight) || 0,
      reps: parseInt(exReps) || 0,
      seatSetting: locationMode === 'planet_fitness' ? exSeat : undefined,
    };
    setCurrentSessionSets([...currentSessionSets, newSet]);
    setExWeight('');
    setExReps('');
  };

  const handleSaveWorkout = () => {
    if (currentSessionSets.length === 0) return;
    const newSession: StrengthLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profile: activeProfile,
      location: locationMode,
      routineName: activeRoutineName,
      sets: currentSessionSets,
    };
    setStrengthLogs([newSession, ...strengthLogs]);
    setCurrentSessionSets([]);
    setExName('');
  };

  const handleAddCardio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardioDist || !cardioTime) return;
    setCardioLogs([{
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profile: activeProfile,
      type: cardioType,
      distanceMiles: parseFloat(cardioDist) || 0,
      durationMinutes: parseInt(cardioTime) || 0,
      notes: cardioNotes,
    }, ...cardioLogs]);
    setCardioDist('');
    setCardioTime('');
    setCardioNotes('');
  };

  const handleAddMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    setMetricsLogs([{
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profile: activeProfile,
      weightLbs: parseFloat(weightInput) || 0,
      heightInches: parseFloat(heightInput) || 65,
    }, ...metricsLogs]);
    setWeightInput('');
  };

  const latestMetrics = metricsLogs.find((m) => m.profile === activeProfile);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <header style={{ background: '#1e293b', padding: '16px', borderRadius: '20px', border: `2px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: theme.primary }}>⚡ DuoFit Engine</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>Profile: <strong style={{ color: theme.accent }}>{activeProfile}</strong></p>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: '#0f172a', padding: '4px', borderRadius: '12px', border: '1px solid #334155' }}>
            {(['Roxanne', 'Diana'] as UserProfile[]).map((prof) => (
              <button
                key={prof}
                onClick={() => setActiveProfile(prof)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                  background: activeProfile === prof ? PROFILE_STYLES[prof].primary : 'transparent',
                  color: activeProfile === prof ? '#0f172a' : '#cbd5e1',
                }}
              >
                👤 {prof}
              </button>
            ))}
          </div>
        </header>

        <div style={{ display: 'flex', gap: '8px', background: '#1e293b', padding: '6px', borderRadius: '16px', border: '1px solid #334155' }}>
          <button
            onClick={() => { setLocationMode('garage'); setGeneratedWorkout([]); setSelectedEquipment([]); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
              background: locationMode === 'garage' ? '#10b981' : 'transparent',
              color: locationMode === 'garage' ? '#0f172a' : '#cbd5e1',
            }}
          >
            🏠 Garage Gym Mode
          </button>
          <button
            onClick={() => { setLocationMode('planet_fitness'); setGeneratedWorkout([]); setSelectedEquipment([]); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
              background: locationMode === 'planet_fitness' ? '#a855f7' : 'transparent',
              color: locationMode === 'planet_fitness' ? '#fff' : '#cbd5e1',
            }}
          >
            🏋️ Planet Fitness Mode
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {[
            { id: 'generator', label: '⚡ Workout Builder' },
            { id: 'workout', label: '🏋️ Active Workout' },
            { id: 'cardio', label: '🏃 Cardio' },
            { id: 'metrics', label: '⚖️ Weight' },
            { id: 'history', label: '📜 History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${activeTab === tab.id ? theme.border : '#334155'}`, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeTab === tab.id ? theme.bgBadge : '#1e293b',
                color: activeTab === tab.id ? theme.accent : '#94a3b8',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'generator' && (
          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <section style={{ background: '#1e293b', padding: '16px', borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Select How to Build Your Workout:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setFilterMode('muscle')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${filterMode === 'muscle' ? theme.primary : '#334155'}`,
                      background: filterMode === 'muscle' ? theme.bgBadge : '#0f172a',
                      color: filterMode === 'muscle' ? theme.accent : '#cbd5e1', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    💪 Target Muscle Groups
                  </button>
                  <button
                    onClick={() => setFilterMode('equipment')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${filterMode === 'equipment' ? theme.primary : '#334155'}`,
                      background: filterMode === 'equipment' ? theme.bgBadge : '#0f172a',
                      color: filterMode === 'equipment' ? theme.accent : '#cbd5e1', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    🏋️ Available Equipment
                  </button>
                </div>
              </div>

              {filterMode === 'muscle' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: theme.accent, margin: '0 0 6px 0' }}>
                    Select Body Parts:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px' }}>
                    {[
                      { id: 'legs', label: '🦵 Legs' },
                      { id: 'back', label: '🪵 Back' },
                      { id: 'chest', label: '🛡️ Chest' },
                      { id: 'shoulders', label: '🦾 Shoulders' },
                      { id: 'arms', label: '💪 Arms' },
                      { id: 'core', label: '⚡ Core' },
                      { id: 'cardio', label: '🫀 Cardio' },
                    ].map((m) => {
                      const isSelected = selectedMuscles.includes(m.id as MuscleTarget);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggleMuscle(m.id as MuscleTarget)}
                          style={{
                            padding: '8px 4px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                            background: isSelected ? theme.primary : '#0f172a',
                            border: `1px solid ${isSelected ? theme.primary : '#334155'}`,
                            color: isSelected ? '#0f172a' : '#cbd5e1',
                          }}
                        >
                          {m.label} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filterMode === 'equipment' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: theme.accent, margin: '0 0 6px 0' }}>
                    Select Available Equipment ({locationMode === 'garage' ? 'Garage' : 'PF'}):
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px' }}>
                    {availableEquipmentList.map((eq) => {
                      const isSelected = selectedEquipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          onClick={() => toggleEquipment(eq)}
                          style={{
                            padding: '8px 6px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                            background: isSelected ? theme.primary : '#0f172a',
                            border: `1px solid ${isSelected ? theme.primary : '#334155'}`,
                            color: isSelected ? '#0f172a' : '#cbd5e1',
                          }}
                        >
                          ⚙️ {eq} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: theme.accent, margin: '0 0 6px 0' }}>
                  Workout Format / Protocol:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
                  {[
                    { id: 'standard', label: '🎯 Standard (3x10)' },
                    { id: 'emom', label: '⏱️ EMOM (Every Min)' },
                    { id: 'amrap', label: '🔥 AMRAP (Circuit)' },
                    { id: 'pyramid', label: '📐 Pyramid (12-10-8-6)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id as WorkoutFormat)}
                      style={{
                        padding: '8px 4px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                        background: selectedFormat === f.id ? theme.bgBadge : '#0f172a',
                        border: `1px solid ${selectedFormat === f.id ? theme.primary : '#334155'}`,
                        color: selectedFormat === f.id ? theme.accent : '#cbd5e1',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateWorkout}
                style={{
                  marginTop: '6px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
                  background: theme.primary, color: '#0f172a',
                }}
              >
                ⚡ Generate {selectedFormat.toUpperCase()} Workout
              </button>
            </section>

            {generatedWorkout.length > 0 && (
              <section style={{ background: '#1e293b', padding: '16px', borderRadius: '20px', border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  Generated Routine ({generatedWorkout.length} Exercises):
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {generatedWorkout.map((item, idx) => (
                    <div key={idx} style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>{item.name} <span style={{ fontSize: '10px', color: theme.accent, textTransform: 'uppercase' }}>({item.muscleGroup})</span></div>
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>{item.prescription}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>Gear: {item.equipment}</div>
                      </div>
                      <button
                        onClick={() => { setExName(item.name); setActiveTab('workout'); }}
                        style={{ background: '#334155', border: 'none', color: theme.accent, padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        + Quick Log
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleStartGeneratedWorkout}
                  style={{ background: '#10b981', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', marginTop: '6px' }}
                >
                  🚀 Load Session into Active Logger
                </button>
              </section>
            )}
          </main>
        )}

        {activeTab === 'workout' && (
          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.accent }}>
                Active Routine: {activeRoutineName}
              </span>
              <span style={{ fontSize: '11px', background: '#0f172a', padding: '4px 8px', borderRadius: '6px', color: '#94a3b8' }}>
                {locationMode === 'garage' ? '🏠 Garage' : '🏋️ Planet Fitness'}
              </span>
            </div>

            <section style={{ background: '#1e293b', padding: '16px', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>Log Exercise Set ({activeProfile})</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Exercise Name"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px' }}
                />
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  value={exWeight}
                  onChange={(e) => setExWeight(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px' }}
                />
                <input
                  type="number"
                  placeholder="Reps Completed"
                  value={exReps}
                  onChange={(e) => setExReps(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px' }}
                />
                {locationMode === 'planet_fitness' && (
                  <input
                    type="text"
                    placeholder="Seat/Pin Setting"
                    value={exSeat}
                    onChange={(e) => setExSeat(e.target.value)}
                    style={{ background: '#0f172a', border: '1px solid #a855f7', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px' }}
                  />
                )}
              </div>

              <button
                onClick={handleAddSet}
                style={{ background: theme.primary, color: '#0f172a', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                + Add Set
              </button>

              {currentSessionSets.length > 0 && (
                <div style={{ marginTop: '8px', background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.accent }}>Staged Sets:</div>
                  {currentSessionSets.map((s, idx) => (
                    <div key={s.id} style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                      <span>#{idx + 1} {s.exerciseName} - {s.weightLbs} lbs x {s.reps} reps</span>
                      {s.seatSetting && <span style={{ color: '#c084fc' }}>[Seat: {s.seatSetting}]</span>}
                    </div>
                  ))}
                  <button
                    onClick={handleSaveWorkout}
                    style={{ marginTop: '8px', background: '#10b981', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    💾 Save Workout Session
                  </button>
                </div>
              )}
            </section>
          </main>
        )}

        {activeTab === 'cardio' && (
          <section style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: theme.accent, margin: '0 0 12px 0' }}>🏃 Log Cardio ({activeProfile})</h3>
            <form onSubmit={handleAddCardio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Activity</label>
                <select value={cardioType} onChange={(e) => setCardioType(e.target.value as any)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '12px' }}>
                  <option value="Run">Run</option>
                  <option value="Walk">Walk</option>
                  <option value="Rower">Rower</option>
                  <option value="AirBike">AirBike</option>
                  <option value="Elliptical">Elliptical</option>
                  <option value="StairMaster">StairMaster</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Distance (Miles)</label>
                <input type="number" step="0.01" value={cardioDist} onChange={(e) => setCardioDist(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Time (Mins)</label>
                <input type="number" value={cardioTime} onChange={(e) => setCardioTime(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Notes</label>
                <input type="text" placeholder="Morning walk/run" value={cardioNotes} onChange={(e) => setCardioNotes(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: theme.primary, color: '#0f172a', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                Save Cardio
              </button>
            </form>
          </section>
        )}

        {activeTab === 'metrics' && (
          <section style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: theme.accent, margin: 0 }}>⚖️ Weight & BMI ({activeProfile})</h3>
            {latestMetrics && (
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Latest Weight</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{latestMetrics.weightLbs} lbs</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>BMI</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.accent }}>
                    {((latestMetrics.weightLbs / (latestMetrics.heightInches * latestMetrics.heightInches)) * 703).toFixed(1)}
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleAddMetrics} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Weight (lbs)</label>
                <input type="number" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Height (Inches)</label>
                <input type="number" value={heightInput} onChange={(e) => setHeightInput(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: theme.primary, color: '#0f172a', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                Log Weight
              </button>
            </form>
          </section>
        )}

        {activeTab === 'history' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>Log History ({activeProfile})</h3>
            {strengthLogs.filter(s => s.profile === activeProfile).map((s) => (
              <div key={s.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: theme.accent }}>
                  <span>🏋️ {s.routineName}</span>
                  <span style={{ color: '#94a3b8' }}>{s.date}</span>
                </div>
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {s.sets.map((set) => (
                    <div key={set.id} style={{ fontSize: '11px', color: '#cbd5e1' }}>
                      • {set.exerciseName}: {set.weightLbs} lbs x {set.reps} reps {set.seatSetting && `[Seat: ${set.seatSetting}]`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {cardioLogs.filter(c => c.profile === activeProfile).map((c) => (
              <div key={c.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>🏃 {c.type} - {c.distanceMiles} mi</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{c.date} {c.notes && `• ${c.notes}`}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>{c.durationMinutes} mins</div>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
}