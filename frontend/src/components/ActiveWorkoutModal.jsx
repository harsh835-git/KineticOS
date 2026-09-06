import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Clock,
  Dumbbell,
  CheckCircle2,
  Circle,
  ChevronRight,
  ArrowRight,
  Volume2,
  VolumeX,
  TrendingUp,
  Zap,
  Award,
  Layers
} from "lucide-react";

// Inline Audio Utilities
const getAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  return AudioCtx ? new AudioCtx() : null;
};

const playTone = (frequency = 600, duration = 120, type = "sine") => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (err) {
    console.warn("Audio error:", err);
  }
};

const playCompletionChime = () => {
  playTone(587.33, 150, "triangle");
  setTimeout(() => playTone(880, 300, "triangle"), 120);
};

const speakCue = (text) => {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Speech error:", err);
  }
};

const ActiveWorkoutModal = ({
  isOpen,
  onClose,
  workoutData,
  dayName,
  userId,
  onSessionComplete,
  onExerciseCompleted,
}) => {
  const exercises = workoutData?.exercises || [];
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [sessionLogs, setSessionLogs] = useState({});
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);

  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Initialize session state
  useEffect(() => {
    if (isOpen && exercises.length > 0) {
      const initial = {};
      exercises.forEach((ex) => {
        const setTotal = Number(ex.sets) || 3;
        initial[ex.name] = Array.from({ length: setTotal }, (_, idx) => ({
          setNumber: idx + 1,
          weightKg: "",
          repsCompleted:
            typeof ex.reps === "string" && ex.reps.includes("-")
              ? ex.reps.split("-")[0]
              : ex.reps || 10,
          isCompleted: false,
        }));
      });

      setSessionLogs(initial);
      setActiveExerciseIndex(0);
      setSessionDuration(0);
      setRestSecondsLeft(0);
      setIsTimerRunning(false);
      setSessionSummary(null);
    }
  }, [isOpen, workoutData]);

  // Session elapsed clock
  useEffect(() => {
    if (!isOpen || sessionSummary) return;

    sessionTimerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(sessionTimerRef.current);
  }, [isOpen, sessionSummary]);

  // Rest countdown logic with sound triggers
  useEffect(() => {
    if (!isOpen || sessionSummary) return;

    if (isTimerRunning && restSecondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (soundEnabled && (prev === 3 || prev === 2 || prev === 1)) {
            playTone(520, 100, "sine");
          }

          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            if (soundEnabled) {
              playCompletionChime();
              speakCue("Rest complete. Get ready for your next set.");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isOpen, isTimerRunning, restSecondsLeft, soundEnabled, sessionSummary]);

  if (!isOpen || !workoutData) return null;

  const currentExercise = exercises[activeExerciseIndex];
  const currentSets = (currentExercise && sessionLogs[currentExercise.name]) || [];

  const handleSetChange = (exerciseName, setIndex, field, value) => {
    setSessionLogs((prev) => {
      const updated = { ...prev };
      if (updated[exerciseName] && updated[exerciseName][setIndex]) {
        updated[exerciseName] = [...updated[exerciseName]];
        updated[exerciseName][setIndex] = {
          ...updated[exerciseName][setIndex],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const toggleSetComplete = (exerciseName, setIndex, defaultRest = 60) => {
    setSessionLogs((prev) => {
      const updated = { ...prev };
      if (updated[exerciseName] && updated[exerciseName][setIndex]) {
        updated[exerciseName] = [...updated[exerciseName]];
        const currentStatus = updated[exerciseName][setIndex].isCompleted;
        const nextStatus = !currentStatus;

        updated[exerciseName][setIndex] = {
          ...updated[exerciseName][setIndex],
          isCompleted: nextStatus,
        };

        if (nextStatus) {
          setRestSecondsLeft(defaultRest);
          setIsTimerRunning(true);
          if (soundEnabled) playTone(440, 80, "sine");
        }

        const hasCompletedSet = updated[exerciseName].some((s) => s.isCompleted);
        if (onExerciseCompleted) {
          onExerciseCompleted(exerciseName, hasCompletedSet);
        }
      }
      return updated;
    });
  };

  const handleFinishSession = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const activeUserId = userId || storedUser.id || storedUser._id;

    if (!activeUserId) {
      alert("Error: Missing user ID. Please sign in again.");
      return;
    }

    const formattedPayload = {
      userId: activeUserId,
      dayName: dayName || "Today",
      focus: workoutData.focus || "Workout",
      durationMinutes: Math.max(Math.round(sessionDuration / 60), 1),
      exercises: exercises.map((ex) => ({
        exerciseName: ex.name,
        sets: sessionLogs[ex.name] || [],
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedPayload),
      });

      const data = await res.json();
      if (data.success) {
        if (soundEnabled) {
          speakCue("Workout complete. Great session today!");
        }
        setSessionSummary(data.summary || {
          totalTonnage: 0,
          completedSetsCount: 0,
          durationMinutes: Math.max(Math.round(sessionDuration / 60), 1),
          density: 0,
          exerciseProgressions: []
        });
      } else {
        alert(data.message || "Failed to log session");
      }
    } catch (err) {
      console.error("Failed to finish session:", err);
      alert("Network error: Could not contact session API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitModal = () => {
    if (onSessionComplete) onSessionComplete();
    onClose();
  };

  const formatMinutesSeconds = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ================= SUMMARY SCREEN =================
  if (sessionSummary) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-[#0c0c12] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Session Completed!</h2>
                <p className="text-xs text-zinc-400">{workoutData.focus} • {dayName}</p>
              </div>
            </div>
            <button
              onClick={handleExitModal}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Tonnage</span>
              <p className="text-base font-bold text-emerald-400 mt-1 font-mono">
                {sessionSummary.totalTonnage} <span className="text-xs font-normal text-zinc-500">kg</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sets Done</span>
              <p className="text-base font-bold text-violet-400 mt-1 font-mono">
                {sessionSummary.completedSetsCount}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Duration</span>
              <p className="text-base font-bold text-blue-400 mt-1 font-mono">
                {sessionSummary.durationMinutes} <span className="text-xs font-normal text-zinc-500">min</span>
              </p>
            </div>
          </div>

          {/* Overload Recommendations Feed */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Overload Progression Feed
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(sessionSummary.exerciseProgressions || []).map((prog, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-white truncate">{prog.exerciseName}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{prog.recommendation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-violet-400 font-mono">
                      Next: {prog.nextWeight} kg
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-medium">
                      {prog.setsDone} sets logged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleExitModal}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-violet-950/40"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ================= LIVE WORKOUT VIEW =================
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-between text-white p-4 sm:p-6 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Dumbbell size={20} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              {workoutData.focus || "Daily Session"} • <span className="text-violet-400">{dayName}</span>
            </h2>
            <p className="text-[11px] text-zinc-400 flex items-center gap-2 font-mono">
              <Clock size={12} /> {formatMinutesSeconds(sessionDuration)} Elapsed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs ${
              soundEnabled
                ? "bg-violet-600/20 border-violet-500/30 text-violet-400"
                : "bg-white/[0.04] border-white/[0.08] text-zinc-500"
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline font-semibold">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-4xl w-full mx-auto py-6 grid md:grid-cols-3 gap-6 flex-1 items-start">
        {/* Left: Sequence List */}
        <div className="space-y-2 order-2 md:order-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Exercise Sequence
          </span>
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {exercises.map((ex, idx) => {
              const sets = sessionLogs[ex.name] || [];
              const completedCount = sets.filter((s) => s.isCompleted).length;
              const isAllDone = completedCount === sets.length && sets.length > 0;
              const isActive = idx === activeExerciseIndex;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isActive
                      ? "bg-violet-950/30 border-violet-500/60 text-white"
                      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-semibold truncate">{ex.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {completedCount}/{sets.length} Sets Done
                    </p>
                  </div>
                  {isAllDone ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Movement Workspace */}
        <div className="md:col-span-2 space-y-5 order-1 md:order-2 bg-[#0f0f15] border border-white/[0.08] p-5 sm:p-6 rounded-3xl shadow-2xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-violet-400 font-bold tracking-wider">
                Movement {activeExerciseIndex + 1} of {exercises.length}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Prescribed Rest: {currentExercise?.restSeconds || 60}s
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              {currentExercise?.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{currentExercise?.formGuidance}</p>
          </div>

          {/* Sets Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-zinc-500 px-2">
              <div className="col-span-2">Set</div>
              <div className="col-span-4">Weight (kg)</div>
              <div className="col-span-4">Reps Done</div>
              <div className="col-span-2 text-right">Done</div>
            </div>

            {currentSets.map((set, sIdx) => (
              <div
                key={sIdx}
                className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border transition ${
                  set.isCompleted
                    ? "bg-emerald-950/20 border-emerald-500/30 opacity-90"
                    : "bg-white/[0.02] border-white/[0.05]"
                }`}
              >
                <div className="col-span-2 text-xs font-mono font-bold text-zinc-400 pl-2">
                  #{set.setNumber}
                </div>

                <div className="col-span-4">
                  <input
                    type="number"
                    placeholder="kg"
                    value={set.weightKg}
                    onChange={(e) =>
                      handleSetChange(currentExercise.name, sIdx, "weightKg", e.target.value)
                    }
                    className="w-full h-8 rounded-lg bg-black/40 border border-white/[0.08] px-2 text-xs font-mono text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="col-span-4">
                  <input
                    type="number"
                    value={set.repsCompleted}
                    onChange={(e) =>
                      handleSetChange(currentExercise.name, sIdx, "repsCompleted", e.target.value)
                    }
                    className="w-full h-8 rounded-lg bg-black/40 border border-white/[0.08] px-2 text-xs font-mono text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2 flex justify-end pr-1">
                  <button
                    onClick={() =>
                      toggleSetComplete(
                        currentExercise.name,
                        sIdx,
                        currentExercise.restSeconds || 60
                      )
                    }
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      set.isCompleted ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {set.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Rest Timer */}
          {restSecondsLeft > 0 && (
            <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-violet-400 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-white">Active Rest Interval</p>
                  <p className="text-xs font-mono text-violet-300">
                    {restSecondsLeft}s remaining {soundEnabled && "• Audio Cues Active"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRestSecondsLeft((prev) => prev + 30)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  +30s
                </button>
                <button
                  onClick={() => {
                    setRestSecondsLeft(0);
                    setIsTimerRunning(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-white/[0.08] max-w-4xl w-full mx-auto flex items-center justify-between gap-4">
        <button
          onClick={() => setActiveExerciseIndex((prev) => Math.max(prev - 1, 0))}
          disabled={activeExerciseIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-zinc-300 disabled:opacity-30 cursor-pointer"
        >
          Previous
        </button>

        {activeExerciseIndex < exercises.length - 1 ? (
          <button
            onClick={() => setActiveExerciseIndex((prev) => prev + 1)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer"
          >
            Next Movement <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleFinishSession}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-xs font-bold text-white flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Calculating Overload..." : "Finish & Log Session"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveWorkoutModal;