import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

type UserProfile = 'Roxanne' | 'Diana';
type LocationMode = 'garage' | 'planet_fitness';
type MuscleTarget = 'legs' | 'back' | 'chest' | 'shoulders' | 'arms' | 'core' | 'cardio';
type WorkoutFormat = 'standard' | 'emom' | 'amrap' | 'pyramid';
type FilterMode = 'muscle' | 'equipment';

interface ExerciseDef {
  name: string;
  equipment: string;
  muscleGroup: MuscleTarget;
}

interface GeneratedExercise extends ExerciseDef {
  prescription: string;
  sets: number;
  reps: string;
  restSeconds: number;
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

const GARAGE_POOL: ExerciseDef[] = [
  { name: 'Barbell Back Squat', equipment: 'Titan Power Rack & Bumper Plates', muscleGroup: 'legs' },
  { name: 'Goblet Squat', equipment: 'Hex Dumbbells / Kettlebell', muscleGroup: 'legs' },
  { name: 'Landmine Hack Squat', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'legs' },
  { name: 'Box Jumps / Step-Ups', equipment: '3-in-1 Soft Plyo Box', muscleGroup: 'legs' },
  { name: 'Romanian Deadlift', equipment: 'Barbell & Bumper Plates', muscleGroup: 'legs' },
  { name: 'Barbell Bent-Over Row', equipment: 'Barbell & Bumper Plates', muscleGroup: 'back' },
  { name: 'Cable Pulldown (MAG Handle)', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'back' },
  { name: 'Landmine Single-Arm Row', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'back' },
  { name: 'Single-Arm Row', equipment: 'Hex Dumbbells & NordicTrack Bench', muscleGroup: 'back' },
  { name: 'Kettlebell Swings', equipment: 'Kettlebell (Up to 71 lbs)', muscleGroup: 'back' },
  { name: 'Barbell Bench Press', equipment: 'Titan Power Rack & NordicTrack Bench', muscleGroup: 'chest' },
  { name: 'Incline Dumbbell Press', equipment: 'Hex Dumbbells & NordicTrack Bench', muscleGroup: 'chest' },
  { name: 'Landmine Chest Press', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'chest' },
  { name: 'Cable Chest Flyes', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'chest' },
  { name: 'Overhead Barbell Press', equipment: 'Titan Power Rack & Barbell', muscleGroup: 'shoulders' },
  { name: 'Dumbbell Lateral Raise', equipment: 'Hex Dumbbells', muscleGroup: 'shoulders' },
  { name: 'Landmine Shoulder Press', equipment: 'Titan Power Rack (Landmine)', muscleGroup: 'shoulders' },
  { name: 'Cable Face Pulls', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'shoulders' },
  { name: 'Cable Tricep Pushdown', equipment: 'Power Rack Pulley & Cable Attachment', muscleGroup: 'arms' },
  { name: 'Dumbbell Bicep Curls', equipment: 'Hex Dumbbells', muscleGroup: 'arms' },
  { name: 'Tricep Bench Dips', equipment: 'NordicTrack Bench', muscleGroup: 'arms' },
  { name: 'Slam Ball Overheads', equipment: 'Medicine & Slam Balls', muscleGroup: 'core' },
  { name: 'Battle Rope Waves', equipment: 'Battle Ropes', muscleGroup: 'cardio' },
];

const PLANET_FITNESS_POOL: ExerciseDef[] = [
  // Cardio Machines
  { name: 'Treadmill Run / Walk', equipment: 'Treadmills', muscleGroup: 'cardio' },
  { name: 'Elliptical Striding', equipment: 'Ellipticals', muscleGroup: 'cardio' },
  { name: 'Arc Trainer Workout', equipment: 'Arc Trainers', muscleGroup: 'cardio' },
  { name: 'StairMaster Climb', equipment: 'StairMaster Stepmills', muscleGroup: 'cardio' },
  { name: 'Stationary Bike Ride', equipment: 'Stationary Bikes (Upright and Recumbent)', muscleGroup: 'cardio' },
  { name: 'Rowing Machine Intervals', equipment: 'Rowing Machines', muscleGroup: 'cardio' },
  { name: 'Recumbent Stepper Session', equipment: 'Recumbent Steppers (SciFit/NuStep)', muscleGroup: 'cardio' },
  { name: 'Upper Body Ergometer Cycle', equipment: 'Upper Body Ergometers (Arm Bikes)', muscleGroup: 'cardio' },

  // Pin-Loaded Strength & Isolation
  { name: 'Machine Chest Press', equipment: 'Chest Press / Incline Chest Press', muscleGroup: 'chest' },
  { name: 'Incline Machine Press', equipment: 'Chest Press / Incline Chest Press', muscleGroup: 'chest' },
  { name: 'Pectoral Fly', equipment: 'Pectoral Fly / Rear Delt', muscleGroup: 'chest' },
  { name: 'Rear Delt Fly', equipment: 'Pectoral Fly / Rear Delt', muscleGroup: 'shoulders' },
  { name: 'Machine Shoulder Press', equipment: 'Shoulder Press', muscleGroup: 'shoulders' },
  { name: 'Machine Lateral Raise', equipment: 'Lateral Raise', muscleGroup: 'shoulders' },
  { name: 'Machine Lat Pulldown', equipment: 'Lat Pulldown', muscleGroup: 'back' },
  { name: 'Machine Seated Row', equipment: 'Seated Row', muscleGroup: 'back' },
  { name: 'Machine Bicep Curl', equipment: 'Bicep Curl', muscleGroup: 'arms' },
  { name: 'Machine Tricep Extension', equipment: 'Tricep Extension / Tricep Press', muscleGroup: 'arms' },
  { name: 'Assisted Dip', equipment: 'Assisted Dip and Chin-Up', muscleGroup: 'arms' },
  { name: 'Assisted Chin-Up', equipment: 'Assisted Dip and Chin-Up', muscleGroup: 'back' },
  { name: 'Abdominal Crunch Machine', equipment: 'Abdominal Crunch / Rotary Torso', muscleGroup: 'core' },
  { name: 'Rotary Torso Twist', equipment: 'Abdominal Crunch / Rotary Torso', muscleGroup: 'core' },
  { name: 'Seated Leg Extension', equipment: 'Leg Extension', muscleGroup: 'legs' },
  { name: 'Seated / Lying Leg Curl', equipment: 'Seated Leg Curl / Lying Leg Curl', muscleGroup: 'legs' },
  { name: 'Seated Leg Press', equipment: 'Leg Press', muscleGroup: 'legs' },
  { name: 'Hip Abductor (Outer Thigh)', equipment: 'Hip Abductor / Hip Adductor', muscleGroup: 'legs' },
  { name: 'Hip Adductor (Inner Thigh)', equipment: 'Hip Abductor / Hip Adductor', muscleGroup: 'legs' },
  { name: 'Machine Glute Drive', equipment: 'Glute Drive / Glute Kickback', muscleGroup: 'legs' },

  // Plate-Loaded & Heavy Strength Equipment
  { name: 'Smith Machine Squat', equipment: 'Smith Machines', muscleGroup: 'legs' },
  { name: 'Smith Machine Bench Press', equipment: 'Smith Machines', muscleGroup: 'chest' },
  { name: 'Smith Machine Shoulder Press', equipment: 'Smith Machines', muscleGroup: 'shoulders' },
  { name: 'Plate-Loaded Leg Press', equipment: 'Plate-Loaded Leg Press', muscleGroup: 'legs' },
  { name: 'Plate-Loaded Hack Squat', equipment: 'Plate-Loaded Hack Squat', muscleGroup: 'legs' },
  { name: 'Plate-Loaded Seated Calf Raise', equipment: 'Plate-Loaded Seated Calf Raise', muscleGroup: 'legs' },
  { name: 'Plate-Loaded Supine Bench Press', equipment: 'Plate-Loaded Supine Bench Press', muscleGroup: 'chest' },

  // Free Weights & Cables
  { name: 'Dumbbell Goblet Squat', equipment: 'Dumbbells (Up to 75 lbs)', muscleGroup: 'legs' },
  { name: 'Dumbbell Shoulder Press', equipment: 'Dumbbells (Up to 75 lbs)', muscleGroup: 'shoulders' },
  { name: 'Flat Bench Dumbbell Press', equipment: 'Flat Bench Press Benches', muscleGroup: 'chest' },
  { name: 'Incline Dumbbell Press', equipment: 'Incline / Decline Adjustable Benches', muscleGroup: 'chest' },
  { name: 'Fixed Barbell Bicep Curls', equipment: 'Fixed Barbells (Straight and EZ-Bar)', muscleGroup: 'arms' },
  { name: 'Cable Lat Pulldown', equipment: 'Cable Towers (Lat Pulldown & Seated Row stations)', muscleGroup: 'back' },
  { name: 'Cable Seated Row', equipment: 'Cable Towers (Lat Pulldown & Seated Row stations)', muscleGroup: 'back' },
  { name: 'Dual Cable Chest Flyes', equipment: 'Dual Adjustable Cable Pulleys (Functional Trainers)', muscleGroup: 'chest' },
  { name: 'Dual Cable Woodchoppers', equipment: 'Dual Adjustable Cable Pulleys (Functional Trainers)', muscleGroup: 'core' },

  // Functional & Stretching Gear
  { name: 'Kettlebell Swings', equipment: 'Kettlebells', muscleGroup: 'back' },
  { name: 'Medicine Ball Slam', equipment: 'Medicine Balls', muscleGroup: 'core' },
  { name: 'Battle Rope Waves', equipment: 'Battle Ropes', muscleGroup: 'cardio' },
  { name: 'TRX Inverted Row', equipment: 'TRX Suspension Straps', muscleGroup: 'back' },
  { name: 'Resistance Band Lateral Walk', equipment: 'Resistance Bands', muscleGroup: 'legs' },
  { name: 'Foam Roller Recovery', equipment: 'Foam Rollers', muscleGroup: 'legs' },
  { name: 'Mat Floor Core Circuit', equipment: 'Yoga & Exercise Mats', muscleGroup: 'core' },
  { name: 'Ab Mat Crunches', equipment: 'Abs/Core Mats', muscleGroup: 'core' },
  { name: 'Captains Chair Leg Raise', equipment: 'Captain Chair Leg Raise Station', muscleGroup: 'core' },
  { name: 'Hyperextension Back Extension', equipment: 'Back Extension Bench', muscleGroup: 'back' },
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
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  useEffect(() => localStorage.setItem('duofit_metrics', JSON.stringify(metricsLogs)), [metricsLogs]);
  useEffect(() => localStorage.setItem('duofit_cardio', JSON.stringify(cardioLogs)), [cardioLogs]);
  useEffect(() => localStorage.setItem('duofit_strength', JSON.stringify(strengthLogs)), [strengthLogs]);

  // Live Supabase Sync
  useEffect(() => {
    if (!supabase) return;

    const fetchLogs = async () => {
      const { data } = await supabase.from('workout_logs').select('*');
      if (data && data.length > 0) {
        const formatted: StrengthLog[] = data.map((d: any) => ({
          id: d.id,
          date: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          profile: d.profile as UserProfile,
          location: d.location as LocationMode,
          routineName: d.routine_name,
          sets: d.sets,
        }));
        setStrengthLogs(formatted);
      }
    };

    fetchLogs();

    const channel = supabase
      .channel('workout_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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

  const toggleMuscle = (m: MuscleTarget) => {
    setSelectedMuscles((prev) => prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]);
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]);
  };

  const getPrescriptionDetails = (format: WorkoutFormat) => {
    switch (format) {
      case 'emom': return { sets: 4, reps: '8-10', restSeconds: 60, prescription: '⏱️ EMOM (4 sets x 8-10 reps, 60s rest)' };
      case 'amrap': return { sets: 3, reps: '12', restSeconds: 45, prescription: '🔥 AMRAP (3 sets x 12 reps, 45s rest)' };
      case 'pyramid': return { sets: 4, reps: '12-10-8-6', restSeconds: 90, prescription: '📐 Pyramid (4 sets x 12-10-8-6 reps, 90s rest)' };
      case 'standard': default: return { sets: 3, reps: '10-12', restSeconds: 60, prescription: '🎯 Standard (3 sets x 10-12 reps, 60s rest)' };
    }
  };

  const handleGenerateWorkout = () => {
    let eligiblePool = [];
    if (filterMode === 'muscle') {
      if (selectedMuscles.length === 0) return;
      eligiblePool = currentPool.filter((item) => selectedMuscles.includes(item.muscleGroup));
    } else {
      if (selectedEquipment.length === 0) return;
      eligiblePool = currentPool.filter((item) => selectedEquipment.includes(item.equipment));
    }

    const shuffled = [...eligiblePool].sort(() => 0.5 - Math.random());
    const count = Math.min(Math.max(3, Math.floor(Math.random() * 3) + 3), shuffled.length);
    const selected = shuffled.slice(0, count);

    const meta = getPrescriptionDetails(selectedFormat);
    const compiled: GeneratedExercise[] = selected.map((item) => ({
      ...item,
      ...meta,
    }));

    setGeneratedWorkout(compiled);
  };

  const handleSwapExercise = (indexToSwap: number) => {
    const current = generatedWorkout[indexToSwap];
    const poolForSwap = currentPool.filter(
      (item) => item.muscleGroup === current.muscleGroup && item.name !== current.name
    );
    if (poolForSwap.length === 0) return;

    const replacement = poolForSwap[Math.floor(Math.random() * poolForSwap.length)];
    const meta = getPrescriptionDetails(selectedFormat);

    const updated = [...generatedWorkout];
    updated[indexToSwap] = { ...replacement, ...meta };
    setGeneratedWorkout(updated);
  };

  const handleStartGeneratedWorkout = () => {
    const formatLabel = selectedFormat.toUpperCase();
    const locLabel = locationMode === 'garage' ? 'Garage' : 'PF';
    setActiveRoutineName(`${locLabel} [${formatLabel}] Plan`);
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

  const handleSaveWorkout = async () => {
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

    if (supabase) {
      await supabase.from('workout_logs').insert([{
        id: newSession.id,
        profile: newSession.profile,
        location: newSession.location,
        routine_name: newSession.routineName,
        sets: newSession.sets,
      }]);
    }

    setCurrentSessionSets([]);
    setExName('');
  };

  const handleDeleteLog = async (id: string) => {
    setStrengthLogs(strengthLogs.filter((log) => log.id !== id));
    if (supabase) {
      await supabase.from('workout_logs').delete().eq('id', id);
    }
  };

  const handleUpdateLogSet = async (logId: string, setId: string, newWeight: number, newReps: number) => {
    const updated = strengthLogs.map((log) => {
      if (log.id !== logId) return log;
      return {
        ...log,
        sets: log.sets.map((s) => (s.id === setId ? { ...s, weightLbs: newWeight, reps: newReps } : s)),
      };
    });

    setStrengthLogs(updated);

    const targetLog = updated.find((l) => l.id === logId);
    if (supabase && targetLog) {
      await supabase.from('workout_logs').update({ sets: targetLog.sets }).eq('id', logId);
    }
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

  const getLastSessionData = (name: string) => {
    if (!name) return null;
    const userLogs = strengthLogs.filter((l) => l.profile === activeProfile);
    for (const log of userLogs) {
      const match = log.sets.filter((s) => s.exerciseName.toLowerCase() === name.toLowerCase());
      if (match.length > 0) {
        const lastSet = match[match.length - 1];
        return { weightLbs: lastSet.weightLbs, reps: lastSet.reps, date: log.date };
      }
    }
    return null;
  };

  const activeLastSession = getLastSessionData(exName);

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
                ⚡ Auto-Generate 3–5 Exercise Plan
              </button>
            </section>

            {generatedWorkout.length > 0 && (
              <section style={{ background: '#1e293b', padding: '16px', borderRadius: '20px', border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  Structured Plan ({generatedWorkout.length} Exercises):
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {generatedWorkout.map((item, idx) => (
                    <div key={idx} style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>
                          {item.name} <span style={{ fontSize: '10px', color: theme.accent, textTransform: 'uppercase' }}>({item.muscleGroup})</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                          📋 {item.sets} Sets × {item.reps} Reps | Rest: {item.restSeconds}s
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>Gear: {item.equipment}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleSwapExercise(idx)}
                          style={{ background: '#334155', border: 'none', color: '#f59e0b', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          🔄 Swap
                        </button>
                        <button
                          onClick={() => { setExName(item.name); setActiveTab('workout'); }}
                          style={{ background: '#334155', border: 'none', color: theme.accent, padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          + Log
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleStartGeneratedWorkout}
                  style={{ background: '#10b981', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', marginTop: '6px' }}
                >
                  🚀 Load Plan into Active Logger
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

              {/* Last Session Tracker Badge */}
              {activeLastSession && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', color: '#10b981', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📌 <strong>Last Session ({activeLastSession.date}):</strong> {activeLastSession.weightLbs} lbs × {activeLastSession.reps} reps</span>
                </div>
              )}

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
                    💾 Save & Sync Workout Session
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
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>Editable Log History</h3>
            {strengthLogs.map((log) => {
              const style = PROFILE_STYLES[log.profile];
              const isEditing = editingLogId === log.id;

              return (
                <div key={log.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', border: `1px solid ${style.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: style.accent }}>
                    <span>🏋️ {log.routineName} ({log.profile})</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', fontSize: '10px' }}>{log.date}</span>
                      <button
                        onClick={() => setEditingLogId(isEditing ? null : log.id)}
                        style={{ background: '#334155', border: 'none', color: '#f59e0b', fontSize: '10px', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {isEditing ? 'Done' : '✏️ Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        style={{ background: '#451a1a', border: '1px solid #ef4444', color: '#ef4444', fontSize: '10px', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {log.sets.map((set) => (
                      <div key={set.id} style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>• {set.exerciseName} {set.seatSetting && `[Seat: ${set.seatSetting}]`}</span>

                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="number"
                              defaultValue={set.weightLbs}
                              onChange={(e) => handleUpdateLogSet(log.id, set.id, parseFloat(e.target.value) || 0, set.reps)}
                              style={{ width: '50px', background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '4px' }}
                            />
                            <span>lbs x</span>
                            <input
                              type="number"
                              defaultValue={set.reps}
                              onChange={(e) => handleUpdateLogSet(log.id, set.id, set.weightLbs, parseInt(e.target.value) || 0)}
                              style={{ width: '40px', background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '4px' }}
                            />
                            <span>reps</span>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {set.weightLbs} lbs × {set.reps} reps
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

      </div>
    </div>
  );
}