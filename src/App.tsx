import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

type UserProfile = 'Roxanne' | 'Diana';
type LocationMode = 'garage' | 'planet_fitness';
type MuscleTarget = 'legs' | 'back' | 'chest' | 'shoulders' | 'arms' | 'core' | 'cardio';
type WorkoutFormat = 'standard' | 'emom' | 'amrap' | 'pyramid' | 'tabata';
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
  type: 'Run' | 'Walk' | 'Rower' | 'AirBike' | 'Elliptical' | 'StairMaster' | 'Tabata';
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

interface TabataTimerProps {
  exerciseName?: string;
  workDuration?: number;
  restDuration?: number;
  totalRounds?: number;
  themeColor: string;
  onComplete?: () => void;
}

const PROFILE_STYLES = {
  Roxanne: { primary: '#f97316', accent: '#fb923c', bgBadge: 'rgba(249, 115, 22, 0.15)', border: '#ea580c' },
  Diana: { primary: '#d946ef', accent: '#f0abfc', bgBadge: 'rgba(217, 70, 239, 0.15)', border: '#c026d3' },
};

const GARAGE_POOL: ExerciseDef[] = [
  { name: 'Bodyweight Air Squats', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Walking Bodyweight Lunges', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Standard Push-Ups', equipment: 'Bodyweight', muscleGroup: 'chest' },
  { name: 'Decline Push-Ups', equipment: 'NordicTrack Bench', muscleGroup: 'chest' },
  { name: 'Power Rack Pull-Ups / Chin-Ups', equipment: 'Titan Power Rack', muscleGroup: 'back' },
  { name: 'Power Rack Dips', equipment: 'Titan Power Rack (Dip Bars)', muscleGroup: 'arms' },
  { name: 'Plank Hold / Side Plank', equipment: 'Bodyweight', muscleGroup: 'core' },
  { name: 'Hanging Leg Raises', equipment: 'Titan Power Rack', muscleGroup: 'core' },
  { name: 'Burpees / Mountain Climbers', equipment: 'Bodyweight', muscleGroup: 'cardio' },
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
  { name: 'Bodyweight Air Squats', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Walking Bodyweight Lunges', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Standard Push-Ups', equipment: 'Bodyweight', muscleGroup: 'chest' },
  { name: 'Bench Incline Push-Ups', equipment: 'Flat Bench Press Benches', muscleGroup: 'chest' },
  { name: 'Bodyweight Glute Bridges', equipment: 'Yoga & Exercise Mats', muscleGroup: 'legs' },
  { name: 'Plank Hold / Side Plank', equipment: 'Yoga & Exercise Mats', muscleGroup: 'core' },
  { name: 'Mountain Climbers', equipment: 'Yoga & Exercise Mats', muscleGroup: 'cardio' },
  { name: 'Bodyweight Burpees', equipment: 'Bodyweight', muscleGroup: 'cardio' },
  { name: 'Treadmill Run / Walk', equipment: 'Treadmills', muscleGroup: 'cardio' },
  { name: 'Elliptical Striding', equipment: 'Ellipticals', muscleGroup: 'cardio' },
  { name: 'Arc Trainer Workout', equipment: 'Arc Trainers', muscleGroup: 'cardio' },
  { name: 'StairMaster Climb', equipment: 'StairMaster Stepmills', muscleGroup: 'cardio' },
  { name: 'Stationary Bike Ride', equipment: 'Stationary Bikes', muscleGroup: 'cardio' },
  { name: 'Rowing Machine Intervals', equipment: 'Rowing Machines', muscleGroup: 'cardio' },
  { name: 'Machine Chest Press', equipment: 'Chest Press', muscleGroup: 'chest' },
  { name: 'Machine Shoulder Press', equipment: 'Shoulder Press', muscleGroup: 'shoulders' },
  { name: 'Machine Lat Pulldown', equipment: 'Lat Pulldown', muscleGroup: 'back' },
  { name: 'Machine Seated Row', equipment: 'Seated Row', muscleGroup: 'back' },
  { name: 'Seated Leg Press', equipment: 'Leg Press', muscleGroup: 'legs' },
  { name: 'Seated Leg Extension', equipment: 'Leg Extension', muscleGroup: 'legs' },
  { name: 'Seated / Lying Leg Curl', equipment: 'Leg Curl', muscleGroup: 'legs' },
  { name: 'Smith Machine Squat', equipment: 'Smith Machines', muscleGroup: 'legs' },
  { name: 'Smith Machine Bench Press', equipment: 'Smith Machines', muscleGroup: 'chest' },
  { name: 'Dumbbell Goblet Squat', equipment: 'Dumbbells', muscleGroup: 'legs' },
  { name: 'Flat Bench Dumbbell Press', equipment: 'Flat Bench Press Benches', muscleGroup: 'chest' },
  { name: 'Cable Lat Pulldown', equipment: 'Cable Towers', muscleGroup: 'back' },
];

export const TabataTimer: React.FC<TabataTimerProps> = ({
  exerciseName = 'Tabata Circuit',
  workDuration = 20,
  restDuration = 10,
  totalRounds = 8,
  themeColor,
  onComplete,
}) => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [phase, setPhase] = useState<'work' | 'rest' | 'completed'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(workDuration);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isActive && phase !== 'completed') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;

          if (phase === 'work') {
            setPhase('rest');
            return restDuration;
          } else {
            if (currentRound < totalRounds) {
              setCurrentRound((r) => r + 1);
              setPhase('work');
              return workDuration;
            } else {
              setPhase('completed');
              setIsActive(false);
              if (onComplete) onComplete();
              return 0;
            }
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, phase, currentRound, workDuration, restDuration, totalRounds, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setCurrentRound(1);
    setTimeLeft(workDuration);
  };

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      border: '2px solid',
      borderColor: phase === 'work' ? themeColor : phase === 'rest' ? '#3b82f6' : '#22c55e',
      backgroundColor: '#1f2937',
      color: '#ffffff',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '1rem auto'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ {exerciseName}</h3>
      <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
        Round {currentRound} of {totalRounds}
      </div>

      <div style={{
        fontSize: '3rem',
        fontWeight: '800',
        color: phase === 'work' ? themeColor : phase === 'rest' ? '#60a5fa' : '#4ade80',
        margin: '1rem 0'
      }}>
        {phase === 'completed' ? 'DONE!' : `${timeLeft}s`}
      </div>

      <div style={{
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: phase === 'work' ? themeColor : phase === 'rest' ? '#93c5fd' : '#86efac'
      }}>
        {phase === 'completed' ? 'Workout Complete' : phase}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        {phase !== 'completed' && (
          <button
            onClick={toggleTimer}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: isActive ? '#ef4444' : '#22c55e',
              color: '#ffffff'
            }}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
        )}
        <button
          onClick={resetTimer}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            border: '1px solid #4b5563',
            backgroundColor: 'transparent',
            color: '#e5e7eb',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

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
      case 'tabata': return { sets: 8, reps: '20s Work / 10s Rest', restSeconds: 10, prescription: '⚡ TABATA (8 Rounds x 20s Work / 10s Rest)' };
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
    if (!exName || !exReps) return;
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
    if (!cardioTime && cardioType !== 'Tabata') return;
    setCardioLogs([{
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profile: activeProfile,
      type: cardioType,
      distanceMiles: parseFloat(cardioDist) || 0,
      durationMinutes: parseInt(cardioTime) || (cardioType === 'Tabata' ? 4 : 0),
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

  const muscleList: MuscleTarget[] = ['legs', 'back', 'chest', 'shoulders', 'arms', 'core', 'cardio'];

  // Helper to render last logged performance for active profile
  const getLastLoggedSet = (exerciseName: string) => {
    for (const log of strengthLogs) {
      if (log.profile === activeProfile) {
        const matchingSet = log.sets.find(
          (s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase()
        );
        if (matchingSet) {
          return `${matchingSet.weightLbs} lbs × ${matchingSet.reps} reps (${log.date})`;
        }
      }
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#f3f4f6', fontFamily: 'sans-serif', padding: '1rem' }}>
      {/* Profile Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>DuoFit Tracker</h2>
        <div>
          {(['Roxanne', 'Diana'] as UserProfile[]).map((prof) => (
            <button
              key={prof}
              onClick={() => setActiveProfile(prof)}
              style={{
                padding: '0.5rem 1rem',
                marginLeft: '0.5rem',
                borderRadius: '8px',
                border: activeProfile === prof ? `2px solid ${PROFILE_STYLES[prof].border}` : 'none',
                fontWeight: 'bold',
                backgroundColor: activeProfile === prof ? PROFILE_STYLES[prof].primary : '#374151',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {prof}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>
        {(['generator', 'workout', 'cardio', 'metrics', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === tab ? theme.primary : 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Areas */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Workout Generator View */}
        {activeTab === 'generator' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Workout Generator</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Location:</label>
              {(['garage', 'planet_fitness'] as LocationMode[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationMode(loc)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    marginRight: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: locationMode === loc ? theme.primary : '#374151',
                    color: '#fff',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontWeight: locationMode === loc ? 'bold' : 'normal'
                  }}
                >
                  {loc.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Filter Mode:</label>
              {(['muscle', 'equipment'] as FilterMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    marginRight: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: filterMode === mode ? theme.primary : '#374151',
                    color: '#fff',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontWeight: filterMode === mode ? 'bold' : 'normal'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {filterMode === 'muscle' ? (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Target Muscles:</label>
                {muscleList.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMuscle(m)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      marginRight: '0.5rem',
                      marginBottom: '0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedMuscles.includes(m) ? theme.primary : '#374151',
                      color: '#fff',
                      textTransform: 'capitalize',
                      cursor: 'pointer'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Available Equipment:</label>
                {availableEquipmentList.map((eq) => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      marginRight: '0.5rem',
                      marginBottom: '0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedEquipment.includes(eq) ? theme.primary : '#374151',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Format:</label>
              {(['standard', 'emom', 'amrap', 'pyramid', 'tabata'] as WorkoutFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    marginRight: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: selectedFormat === fmt ? theme.primary : '#374151',
                    color: '#fff',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: selectedFormat === fmt ? 'bold' : 'normal'
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateWorkout}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: theme.primary, color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
            >
              Generate Routine
            </button>

            {generatedWorkout.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Generated Routine:</h4>
                {generatedWorkout.map((ex, idx) => (
                  <div key={idx} style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{ex.name}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                        {ex.prescription} ({ex.equipment})
                      </div>
                    </div>
                    <button onClick={() => handleSwapExercise(idx)} style={{ padding: '0.35rem 0.75rem', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Swap</button>
                  </div>
                ))}
                <button onClick={handleStartGeneratedWorkout} style={{ marginTop: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#22c55e', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Start Routine</button>
              </div>
            )}
          </div>
        )}

        {/* Workout / Timer View */}
        {activeTab === 'workout' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Active Session: {activeRoutineName}</h3>
            {selectedFormat === 'tabata' && (
              <TabataTimer exerciseName={activeRoutineName} themeColor={theme.primary} />
            )}

            <div style={{ backgroundColor: '#1f2937', padding: '1.25rem', borderRadius: '10px', marginTop: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Log Exercise Set</h4>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  placeholder="Exercise Name (e.g. Bench Press)"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', boxSizing: 'border-box' }}
                />
                {exName && getLastLoggedSet(exName) && (
                  <div style={{ fontSize: '0.8rem', color: theme.accent, marginTop: '0.35rem' }}>
                    Last logged ({activeProfile}): {getLastLoggedSet(exName)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  placeholder="Weight (lbs)"
                  value={exWeight}
                  onChange={(e) => setExWeight(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff' }}
                />
                <input
                  placeholder="Reps"
                  value={exReps}
                  onChange={(e) => setExReps(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff' }}
                />
                {locationMode === 'planet_fitness' && (
                  <input
                    placeholder="Seat Setting"
                    value={exSeat}
                    onChange={(e) => setExSeat(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff' }}
                  />
                )}
              </div>
              
              <button onClick={handleAddSet} style={{ padding: '0.6rem 1.25rem', backgroundColor: theme.primary, border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Add Set
              </button>

              {currentSessionSets.length > 0 && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
                  <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Current Session Sets:</h5>
                  {currentSessionSets.map((s, index) => (
                    <div key={s.id} style={{ fontSize: '0.9rem', color: '#d1d5db', padding: '0.25rem 0' }}>
                      {index + 1}. <strong>{s.exerciseName}</strong>: {s.weightLbs} lbs × {s.reps} reps {s.seatSetting ? `[Seat: ${s.seatSetting}]` : ''}
                    </div>
                  ))}
                  <button onClick={handleSaveWorkout} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#22c55e', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                    Save Workout Session
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cardio View */}
        {activeTab === 'cardio' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Cardio Tracker</h3>
            <TabataTimer exerciseName="Standalone Tabata HIIT" themeColor={theme.primary} />
            
            <form onSubmit={handleAddCardio} style={{ backgroundColor: '#1f2937', padding: '1.25rem', borderRadius: '10px', marginTop: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Log Cardio Session</h4>
              <select value={cardioType} onChange={(e) => setCardioType(e.target.value as any)} style={{ padding: '0.6rem', marginBottom: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff' }}>
                <option value="Run">Run</option>
                <option value="Walk">Walk</option>
                <option value="Tabata">Tabata</option>
                <option value="Rower">Rower</option>
                <option value="AirBike">AirBike</option>
                <option value="Elliptical">Elliptical</option>
                <option value="StairMaster">StairMaster</option>
              </select>
              <input placeholder="Distance (Miles)" value={cardioDist} onChange={(e) => setCardioDist(e.target.value)} style={{ padding: '0.6rem', marginBottom: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', boxSizing: 'border-box' }} />
              <input placeholder="Duration (Minutes)" value={cardioTime} onChange={(e) => setCardioTime(e.target.value)} style={{ padding: '0.6rem', marginBottom: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', boxSizing: 'border-box' }} />
              <input placeholder="Notes / Effort / Pace" value={cardioNotes} onChange={(e) => setCardioNotes(e.target.value)} style={{ padding: '0.6rem', marginBottom: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '0.6rem 1.25rem', backgroundColor: theme.primary, border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Cardio Log</button>
            </form>
          </div>
        )}

        {/* Body Metrics View */}
        {activeTab === 'metrics' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Body Metrics</h3>
            <form onSubmit={handleAddMetrics} style={{ backgroundColor: '#1f2937', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Log Measurements ({activeProfile})</h4>
              <input placeholder="Weight (lbs)" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} style={{ padding: '0.6rem', marginBottom: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', boxSizing: 'border-box' }} />
              <input placeholder="Height (Inches)" value={heightInput} onChange={(e) => setHeightInput(e.target.value)} style={{ padding: '0.6rem', marginBottom: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '0.6rem 1.25rem', backgroundColor: theme.primary, border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Metrics</button>
            </form>

            <h4 style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Metrics History</h4>
            {metricsLogs.map((m) => (
              <div key={m.id} style={{ backgroundColor: '#1f2937', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: `4px solid ${PROFILE_STYLES[m.profile].primary}` }}>
                <strong>{m.date}</strong> [{m.profile}]: <strong>{m.weightLbs} lbs</strong> ({m.heightInches} in)
              </div>
            ))}
          </div>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Workout History</h3>
            {strengthLogs.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>No strength workouts recorded yet.</p>
            ) : (
              strengthLogs.map((log) => (
                <div key={log.id} style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: `4px solid ${PROFILE_STYLES[log.profile].primary}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{log.date} - {log.routineName} ({log.profile})</strong>
                    <div>
                      <button onClick={() => setEditingLogId(editingLogId === log.id ? null : log.id)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#3b82f6', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        {editingLogId === log.id ? 'Done' : 'Edit'}
                      </button>
                      <button onClick={() => handleDeleteLog(log.id)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                  {log.sets.map((s) => (
                    <div key={s.id} style={{ fontSize: '0.9rem', color: '#d1d5db', marginBottom: '0.25rem' }}>
                      {editingLogId === log.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.25rem 0' }}>
                          <span>{s.exerciseName}:</span>
                          <input
                            type="number"
                            defaultValue={s.weightLbs}
                            onChange={(e) => handleUpdateLogSet(log.id, s.id, parseFloat(e.target.value) || 0, s.reps)}
                            style={{ width: '60px', padding: '0.2rem', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: '4px' }}
                          />
                          <span>lbs ×</span>
                          <input
                            type="number"
                            defaultValue={s.reps}
                            onChange={(e) => handleUpdateLogSet(log.id, s.id, s.weightLbs, parseInt(e.target.value) || 0)}
                            style={{ width: '50px', padding: '0.2rem', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: '4px' }}
                          />
                          <span>reps</span>
                        </div>
                      ) : (
                        <span>• {s.exerciseName}: {s.weightLbs} lbs × {s.reps} reps {s.seatSetting ? `[Seat: ${s.seatSetting}]` : ''}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}

            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '1rem' }}>Cardio History</h3>
            {cardioLogs.map((c) => (
              <div key={c.id} style={{ backgroundColor: '#1f2937', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: `4px solid ${PROFILE_STYLES[c.profile].primary}` }}>
                <strong>{c.date}</strong> [{c.profile}] - <strong>{c.type}</strong>: {c.durationMinutes} mins {c.distanceMiles ? `(${c.distanceMiles} mi)` : ''} {c.notes ? `- ${c.notes}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}