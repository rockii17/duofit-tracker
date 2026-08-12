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
  // Bodyweight & Calisthenics
  { name: 'Bodyweight Air Squats', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Walking Bodyweight Lunges', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Standard Push-Ups', equipment: 'Bodyweight', muscleGroup: 'chest' },
  { name: 'Decline Push-Ups', equipment: 'NordicTrack Bench', muscleGroup: 'chest' },
  { name: 'Power Rack Pull-Ups / Chin-Ups', equipment: 'Titan Power Rack', muscleGroup: 'back' },
  { name: 'Power Rack Dips', equipment: 'Titan Power Rack (Dip Bars)', muscleGroup: 'arms' },
  { name: 'Plank Hold / Side Plank', equipment: 'Bodyweight', muscleGroup: 'core' },
  { name: 'Hanging Leg Raises', equipment: 'Titan Power Rack', muscleGroup: 'core' },
  { name: 'Burpees / Mountain Climbers', equipment: 'Bodyweight', muscleGroup: 'cardio' },

  // Heavy Equipment & Free Weights
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
  // Bodyweight & Calisthenics
  { name: 'Bodyweight Air Squats', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Walking Bodyweight Lunges', equipment: 'Bodyweight', muscleGroup: 'legs' },
  { name: 'Standard Push-Ups', equipment: 'Bodyweight', muscleGroup: 'chest' },
  { name: 'Bench Incline Push-Ups', equipment: 'Flat Bench Press Benches', muscleGroup: 'chest' },
  { name: 'Bodyweight Glute Bridges', equipment: 'Yoga & Exercise Mats', muscleGroup: 'legs' },
  { name: 'Plank Hold / Side Plank', equipment: 'Yoga & Exercise Mats', muscleGroup: 'core' },
  { name: 'Mountain Climbers', equipment: 'Yoga & Exercise Mats', muscleGroup: 'cardio' },
  { name: 'Bodyweight Burpees', equipment: 'Bodyweight', muscleGroup: 'cardio' },

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
    let timer: NodeJS.Timeout | null = null;

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#f3f4f6', fontFamily: 'sans-serif', padding: '1rem' }}>
      {/* Profile & Format Options Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Fitness Tracker</h2>
        <div>
          {(['Roxanne', 'Diana'] as UserProfile[]).map((prof) => (
            <button
              key={prof}
              onClick={() => setActiveProfile(prof)}
              style={{
                padding: '0.5rem 1rem',
                marginLeft: '0.5rem',
                borderRadius: '8px',
                border: 'none',
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
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #374151', pb: '0.5rem' }}>
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
            <h3>Generator Options</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Format: </label>
              {(['standard', 'emom', 'amrap', 'pyramid', 'tabata'] as WorkoutFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    marginRight: '0.5rem',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: selectedFormat === fmt ? theme.primary : '#374151',
                    color: '#fff',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateWorkout}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: theme.primary, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Generate Plan
            </button>

            {generatedWorkout.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4>Your Plan:</h4>
                {generatedWorkout.map((ex, idx) => (
                  <div key={idx} style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                    <strong>{ex.name}</strong> - <em>{ex.prescription}</em>
                    <button onClick={() => handleSwapExercise(idx)} style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', backgroundColor: '#4b5563', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Swap</button>
                  </div>
                ))}
                <button onClick={handleStartGeneratedWorkout} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#22c55e', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Start Workout</button>
              </div>
            )}
          </div>
        )}

        {/* Workout / Timer View */}
        {activeTab === 'workout' && (
          <div>
            <h3>Active Session: {activeRoutineName}</h3>
            {selectedFormat === 'tabata' && (
              <TabataTimer exerciseName={activeRoutineName} themeColor={theme.primary} />
            )}
            {/* Standard exercise logging inputs remain available */}
          </div>
        )}

        {/* Cardio View */}
        {activeTab === 'cardio' && (
          <div>
            <h3>Cardio Log & Tools</h3>
            <TabataTimer exerciseName="Standalone Tabata HIIT" themeColor={theme.primary} />
            
            <form onSubmit={handleAddCardio} style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem' }}>
              <h4>Log Cardio Session</h4>
              <select value={cardioType} onChange={(e) => setCardioType(e.target.value as any)} style={{ padding: '0.5rem', marginBottom: '0.5rem', width: '100%' }}>
                <option value="Run">Run</option>
                <option value="Walk">Walk</option>
                <option value="Tabata">Tabata</option>
                <option value="Rower">Rower</option>
                <option value="AirBike">AirBike</option>
                <option value="Elliptical">Elliptical</option>
                <option value="StairMaster">StairMaster</option>
              </select>
              <input placeholder="Minutes" value={cardioTime} onChange={(e) => setCardioTime(e.target.value)} style={{ padding: '0.5rem', marginBottom: '0.5rem', width: '100%' }} />
              <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: theme.primary, border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Save Cardio Log</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}