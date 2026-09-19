import React, { useState, useEffect } from "react";
import { TrendingUp, Dumbbell, Zap, CheckCircle2, History, Award, Flame } from "lucide-react";

const ExerciseTracker = ({ userId }) => {
  const [exerciseName, setExerciseName] = useState("Barbell Squat");
  const [weight, setWeight] = useState(80);
  const [targetReps, setTargetReps] = useState(8);
  const [completedReps, setCompletedReps] = useState(8);
  const [rpe, setRpe] = useState(7);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loggedSets, setLoggedSets] = useState([]);
  const [prCelebration, setPrCelebration] = useState(null);

  // Epley 1RM Formula
  const calculate1RM = (w, r) => {
    if (!w || !r || Number(r) <= 0) return 0;
    return Math.round(Number(w) * (1 + Number(r) / 30));
  };

  const currentEstimated1RM = calculate1RM(weight, completedReps);

  const fetchTodaySets = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/training/today-sets/${userId}`);
      const data = await res.json();
      if (data.success) {
        setLoggedSets(data.exercises || []);
      }
    } catch (err) {
      console.error("Failed to load sets:", err);
    }
  };

  useEffect(() => {
    fetchTodaySets();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrCelebration(null);

    // Compute prior best 1RM for this exercise
    const exerciseHistory = loggedSets.filter(
      (s) => (s.name || s.exerciseName || "").toLowerCase() === exerciseName.toLowerCase()
    );
    const priorBest1RM = exerciseHistory.reduce((max, s) => {
      const sWeight = Number(s.weight ?? s.load ?? 0);
      const sReps = Number(s.completedReps ?? s.reps ?? 0);
      return Math.max(max, calculate1RM(sWeight, sReps));
    }, 0);

    const isNewPR = currentEstimated1RM > priorBest1RM && priorBest1RM > 0;

    try {
      const res = await fetch("http://localhost:5000/api/training/log-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          exerciseName,
          setNumber: loggedSets.filter((s) => s.name === exerciseName).length + 1,
          weight: Number(weight),
          targetReps: Number(targetReps),
          completedReps: Number(completedReps),
          rpe: Number(rpe),
          estimated1RM: currentEstimated1RM,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback(data.feedback);
        setLoggedSets(data.dailyLog?.completedExercises || []);
        if (isNewPR) {
          setPrCelebration({
            exercise: exerciseName,
            new1RM: currentEstimated1RM,
            delta: currentEstimated1RM - priorBest1RM,
          });
        }
      }
    } catch (err) {
      console.error("Set log error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-2xl transition-colors dark:border-white/[0.08] dark:bg-[#101015]/80 mb-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <Dumbbell size={18} />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Progressive Overload & PR Engine
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            Est. 1RM: {currentEstimated1RM} kg
          </span>
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-400">
            Adaptive RPE
          </span>
        </div>
      </div>

      {/* PR Celebration Alert */}
      {prCelebration && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300 animate-pulse">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>NEW PR DETECTED!</strong> {prCelebration.exercise} Est. 1RM reached{" "}
              <strong>{prCelebration.new1RM} kg</strong> (+{prCelebration.delta} kg).
            </span>
          </div>
          <Award size={16} className="text-amber-400 shrink-0" />
        </div>
      )}

      {/* Logging Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Exercise</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Target / Done</label>
            <div className="mt-1 flex gap-1">
              <input
                type="number"
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white font-mono"
                required
              />
              <input
                type="number"
                value={completedReps}
                onChange={(e) => setCompletedReps(e.target.value)}
                className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">RPE (1–10)</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white font-mono"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Evaluating Overload..." : <><Zap size={14} /> Calculate & Commit Set</>}
        </button>
      </form>

      {/* Adaptive Feedback */}
      {feedback && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] p-3.5 text-xs">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet-400" />
          <div className="space-y-1">
            <div className="font-semibold text-violet-300">
              Next Load Target: {feedback.nextWeight} kg
            </div>
            <div className="text-slate-600 dark:text-zinc-400">
              {feedback.recommendation}
            </div>
          </div>
        </div>
      )}

      {/* History of Recorded Sets */}
      {loggedSets.length > 0 && (
        <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/[0.08]">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <History size={13} />
              <span>Today's Recorded Sets ({loggedSets.length})</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">
              Total Volume:{" "}
              {loggedSets.reduce(
                (acc, s) =>
                  acc +
                  Number(s.weight ?? s.load ?? 0) *
                    Number(s.completedReps ?? s.reps ?? 0),
                0
              )}{" "}
              kg
            </span>
          </div>

          <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
            {loggedSets.map((s, idx) => {
              const setName = s.name || s.exerciseName || s.exercise || "Exercise";
              const setNum = s.set ?? s.setNumber ?? idx + 1;
              const setWeight = Number(s.weight ?? s.load ?? 0);
              const compReps = Number(s.completedReps ?? s.reps ?? s.actualReps ?? 0);
              const targReps = Number(s.targetReps ?? s.target ?? compReps);
              const rpeVal = s.rpe ?? s.userRpe ?? "-";
              const set1RM = calculate1RM(setWeight, compReps);

              return (
                <div
                  key={s._id || idx}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-700 dark:bg-white/[0.03] dark:text-zinc-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-violet-400">Set {setNum}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{setName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span>{setWeight} kg</span>
                    <span>{compReps}/{targReps} reps</span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
                      {set1RM} kg 1RM
                    </span>
                    <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-400">
                      RPE {rpeVal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseTracker;