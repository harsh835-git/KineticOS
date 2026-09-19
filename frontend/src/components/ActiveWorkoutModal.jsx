import React, { useState, useEffect, useRef } from "react";
import WorkoutSummaryModal from "./WorkoutSummaryModal";
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
  WifiOff,
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

// Fuzzy matcher for exercises across workout plans and past DB records
const findMatchingWeight = (exerciseName = "", weightsMap = {}) => {
  if (!exerciseName || !weightsMap) return 0;

  const clean = (str) =>
    str.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, " ").trim();

  const target = clean(exerciseName);

  const directKey = exerciseName.toLowerCase().trim();
  if (weightsMap[directKey] !== undefined) {
    return Number(weightsMap[directKey]);
  }

  for (const [key, value] of Object.entries(weightsMap)) {
    const cleanedKey = clean(key);
    if (cleanedKey.includes(target) || target.includes(cleanedKey)) {
      return Number(value);
    }

    const targetWords = target.split(/\s+/).filter((w) => w.length > 2);
    const keyWords = cleanedKey.split(/\s+/).filter((w) => w.length > 2);
    const hasCoreMatch = targetWords.filter((w) => keyWords.includes(w)).length >= 2;
    if (hasCoreMatch) {
      return Number(value);
    }
  }

  return 0;
};

// Dynamic muscle-chain derivation when an accessory has zero history
const deriveDynamicAccessoryLoad = (targetExName = "", availableWeights = {}) => {
  const name = targetExName.toLowerCase();

  const getCompoundWeight = (...aliases) => {
    for (const [key, val] of Object.entries(availableWeights)) {
      if (aliases.some((a) => key.toLowerCase().includes(a))) {
        return Number(val) || 0;
      }
    }
    return 0;
  };

  if (name.includes("extension") || name.includes("quad") || name.includes("lunge")) {
    const parentSquat = getCompoundWeight("squat");
    if (parentSquat > 0) return Math.round((parentSquat * 0.6) / 2.5) * 2.5;
  }

  if (name.includes("curl") && (name.includes("leg") || name.includes("hamstring"))) {
    const parentHinge = getCompoundWeight("deadlift", "rdl");
    if (parentHinge > 0) return Math.round((parentHinge * 0.5) / 2.5) * 2.5;
  }

  if (name.includes("calf") || name.includes("calves")) {
    const parentSquat = getCompoundWeight("squat");
    if (parentSquat > 0) return Math.round((parentSquat * 0.65) / 2.5) * 2.5;
  }

  if (name.includes("tricep") || name.includes("pressdown") || name.includes("pushdown")) {
    const parentPress = getCompoundWeight("bench", "push-up", "press");
    if (parentPress > 0) return Math.round((parentPress * 0.4) / 2.5) * 2.5;
  }

  if (name.includes("lateral raise")) {
    const parentPress = getCompoundWeight("overhead", "press", "bench");
    if (parentPress > 0) return Math.round((parentPress * 0.18) / 2.5) * 2.5;
  }

  const allValues = Object.values(availableWeights).map(Number).filter((v) => v > 0);
  if (allValues.length > 0) {
    const sessionMedian = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    return Math.round((sessionMedian * 0.5) / 2.5) * 2.5;
  }

  return 20;
};

const ActiveWorkoutModal = ({
  isOpen,
  onClose,
  workoutData,
  dayName,
  userId,
  activePhase,
  personalRecords = [],
  recentWeights = {},
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
  const [summaryData, setSummaryData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Unique session storage key per workout focus + day
  const cacheKey = `kinetic_active_session_${dayName || "today"}_${workoutData?.focus || "workout"}`;

  // 1. Initialize with Cache Restoration
  useEffect(() => {
    if (isOpen && exercises.length > 0) {
      const isDeload =
        activePhase?.phaseNumber === 3 ||
        activePhase?.title?.toLowerCase().includes("deload");

      // Check for saved local cache first
      const cached = localStorage.getItem(cacheKey);
      let restoredLogs = null;
      let restoredDuration = 0;

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.sessionLogs && Object.keys(parsed.sessionLogs).length > 0) {
            restoredLogs = parsed.sessionLogs;
            restoredDuration = parsed.sessionDuration || 0;
          }
        } catch (e) {
          console.warn("Failed to parse cached session:", e);
        }
      }

      setSessionLogs((prevLogs) => {
        const base = restoredLogs || prevLogs || {};
        const updated = { ...base };

        exercises.forEach((ex) => {
          const rawSets = Number(ex.sets) || 3;
          const setTotal = isDeload ? Math.max(1, Math.round(rawSets / 2)) : rawSets;
          const exKey = (ex.name || "").toLowerCase().trim();

          const currentPr = personalRecords?.find((item) => {
            const prName = (item.name || item.exerciseName || "").toLowerCase().trim();
            return prName && (prName.includes(exKey) || exKey.includes(prName));
          });

          const oneRepMax = Number(
            currentPr?.oneRepMax ||
            currentPr?.est1RM ||
            currentPr?.weight ||
            0
          );

          let dynamicTarget = 0;
          const ratio =
            activePhase?.phaseNumber === 2 ? 0.80 :
            activePhase?.phaseNumber === 3 ? 0.60 : 0.70;

          if (oneRepMax > 0) {
            dynamicTarget = Math.round((oneRepMax * ratio) / 2.5) * 2.5;
          } else {
            const matchedRecent = findMatchingWeight(ex.name, recentWeights);
            if (matchedRecent > 0) {
              if (isDeload) {
                dynamicTarget = Math.round((matchedRecent * 0.8) / 2.5) * 2.5;
              } else if (activePhase?.phaseNumber === 2) {
                dynamicTarget = matchedRecent + 2.5;
              } else {
                dynamicTarget = matchedRecent;
              }
            } else {
              dynamicTarget = deriveDynamicAccessoryLoad(ex.name, recentWeights);
            }
          }

          const autoWeight = dynamicTarget > 0 ? String(dynamicTarget) : "";

          if (!updated[ex.name] || updated[ex.name].length === 0) {
            updated[ex.name] = Array.from({ length: setTotal }, (_, idx) => ({
              setNumber: idx + 1,
              weightKg: autoWeight,
              repsCompleted:
                typeof ex.reps === "string" && ex.reps.includes("-")
                  ? ex.reps.split("-")[0]
                  : ex.reps || 10,
              isCompleted: false,
            }));
          } else if (autoWeight) {
            updated[ex.name] = updated[ex.name].map((s) => ({
              ...s,
              weightKg: s.weightKg === "" ? autoWeight : s.weightKg,
            }));
          }
        });

        return updated;
      });

      if (restoredDuration > 0) {
        setSessionDuration(restoredDuration);
      }
    }
  }, [isOpen, workoutData, activePhase, personalRecords, recentWeights, cacheKey]);

  // 2. Real-time LocalStorage Auto-Persistence
  useEffect(() => {
    if (!isOpen || showSummary) return;
    if (Object.keys(sessionLogs).length > 0) {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          sessionLogs,
          sessionDuration,
          savedAt: Date.now(),
        })
      );
    }
  }, [sessionLogs, sessionDuration, isOpen, showSummary, cacheKey]);

  // Session elapsed clock
  useEffect(() => {
    if (!isOpen || showSummary) return;

    sessionTimerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(sessionTimerRef.current);
  }, [isOpen, showSummary]);

  // Rest countdown logic with sound triggers
  useEffect(() => {
    if (!isOpen || showSummary) return;

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
  }, [isOpen, isTimerRunning, restSecondsLeft, soundEnabled, showSummary]);

  if (!isOpen || !workoutData) return null;

  const currentExercise = exercises[activeExerciseIndex];
  const currentSets = (currentExercise && sessionLogs[currentExercise.name]) || [];
  const isDeloadActive =
    activePhase?.phaseNumber === 3 ||
    activePhase?.title?.toLowerCase().includes("deload");

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

  // 3. Resilient Finish with Offline Sync Queue
  const handleFinishSession = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const activeUserId = userId || storedUser.id || storedUser._id;

    if (!activeUserId) {
      alert("Error: Missing user ID. Please sign in again.");
      return;
    }

    let totalTonnage = 0;
    let completedSetsCount = 0;
    const detectedPrs = [];

    exercises.forEach((ex) => {
      const sets = sessionLogs[ex.name] || [];
      sets.forEach((s) => {
        if (s.isCompleted) {
          const w = Number(s.weightKg) || 0;
          const r = Number(s.repsCompleted) || 0;
          totalTonnage += w * r;
          completedSetsCount += 1;

          if (w > 0 && r > 0) {
            const est1RM = Math.round(w * (1 + r / 30));
            detectedPrs.push({
              name: ex.name,
              weight: w,
              reps: r,
              est1RM,
            });
          }
        }
      });
    });

    const durationMinutes = Math.max(Math.round(sessionDuration / 60), 1);

    const formattedPayload = {
      userId: activeUserId,
      dayName: dayName || "Today",
      focus: workoutData.focus || "Workout",
      durationMinutes,
      exercises: exercises.map((ex) => ({
        exerciseName: ex.name,
        sets: sessionLogs[ex.name] || [],
      })),
    };

    const uniquePrs = Array.from(
      new Map(detectedPrs.map((item) => [item.name, item])).values()
    );

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedPayload),
      });

      const data = await res.json();
      if (data.success) {
        // Clean active session cache upon successful save
        localStorage.removeItem(cacheKey);

        if (soundEnabled) {
          speakCue("Workout complete. Great session today!");
        }

        setSummaryData({
          duration: `${durationMinutes}m`,
          totalTonnage: data.summary?.totalTonnage || totalTonnage,
          completedCount: exercises.filter((ex) =>
            (sessionLogs[ex.name] || []).some((s) => s.isCompleted)
          ).length,
          totalPlanned: exercises.length,
          prsAchieved: uniquePrs,
          habitScoreDelta: "+50",
        });

        setShowSummary(true);
      } else {
        alert(data.message || "Failed to log session");
      }
    } catch (err) {
      console.warn("Network offline: Queuing workout session locally.", err);

      // Save to background offline sync queue
      const existingQueue = JSON.parse(localStorage.getItem("kinetic_offline_queue") || "[]");
      existingQueue.push({
        payload: formattedPayload,
        queuedAt: new Date().toISOString(),
      });
      localStorage.setItem("kinetic_offline_queue", JSON.stringify(existingQueue));

      // Clean local session cache
      localStorage.removeItem(cacheKey);
      setIsOfflineQueued(true);

      // Render local summary data seamlessly
      setSummaryData({
        duration: `${durationMinutes}m`,
        totalTonnage,
        completedCount: exercises.filter((ex) =>
          (sessionLogs[ex.name] || []).some((s) => s.isCompleted)
        ).length,
        totalPlanned: exercises.length,
        prsAchieved: uniquePrs,
        habitScoreDelta: "+50 (Offline Queued)",
      });

      setShowSummary(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMinutesSeconds = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
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
              type="button"
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
              type="button"
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
          <div className="md:col-span-2 space-y-4 order-1 md:order-2 bg-[#0f0f15] border border-white/[0.08] p-5 sm:p-6 rounded-3xl shadow-2xl">
            {/* Deload Notification Banner */}
            {isDeloadActive && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-cyan-400 shrink-0" />
                  <span className="font-semibold">Active Deload Week Protocol</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400/90 font-medium">50% Set Volume Reduction</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] uppercase font-mono text-violet-400 font-bold tracking-wider">
                  Movement {activeExerciseIndex + 1} of {exercises.length}
                </span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const exName = (currentExercise?.name || "").toLowerCase().trim();
                    const currentPr = personalRecords?.find((item) => {
                      const prName = (item.name || item.exerciseName || "").toLowerCase().trim();
                      return prName && (prName.includes(exName) || exName.includes(prName));
                    });
                    const oneRepMax = Number(
                      currentPr?.oneRepMax ||
                      currentPr?.est1RM ||
                      currentPr?.weight ||
                      currentPr?.maxWeight ||
                      0
                    );
                    const suggestedKg = sessionLogs[currentExercise?.name]?.[0]?.weightKg;

                    if (suggestedKg) {
                      return (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <TrendingUp size={11} className="text-emerald-400 shrink-0" />
                          <span>
                            Target: <strong className="text-white font-bold">{suggestedKg} kg</strong>{" "}
                            {oneRepMax > 0
                              ? `(${activePhase?.targetMetric?.split(" ")[0]} of ${oneRepMax}kg 1RM)`
                              : `(Live History Load)`}
                          </span>
                        </span>
                      );
                    }

                    return (
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <TrendingUp size={11} className="text-zinc-500" />
                        <span>Target: {activePhase?.targetMetric || "Standard Effort"}</span>
                      </span>
                    );
                  })()}
                  <span className="text-xs font-mono text-zinc-500">
                    Rest: {currentExercise?.restSeconds || 60}s
                  </span>
                </div>
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
                      type="button"
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
                    type="button"
                    onClick={() => setRestSecondsLeft((prev) => prev + 30)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-zinc-300 cursor-pointer"
                  >
                    +30s
                  </button>
                  <button
                    type="button"
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
            type="button"
            onClick={() => setActiveExerciseIndex((prev) => Math.max(prev - 1, 0))}
            disabled={activeExerciseIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-zinc-300 disabled:opacity-30 cursor-pointer"
          >
            Previous
          </button>

          {activeExerciseIndex < exercises.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveExerciseIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer"
            >
              Next Movement <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSession}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-xs font-bold text-white flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Calculating Overload..." : "Finish & Log Session"}
            </button>
          )}
        </div>
      </div>

      {/* Post-Workout Summary Overlay */}
      <WorkoutSummaryModal
        isOpen={showSummary}
        summaryData={summaryData}
        onClose={() => {
          setShowSummary(false);
          if (typeof onSessionComplete === "function") {
            onSessionComplete();
          }
          onClose();
        }}
      />
    </>
  );
};

export default ActiveWorkoutModal;