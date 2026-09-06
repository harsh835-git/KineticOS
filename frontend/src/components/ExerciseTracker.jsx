import React, { useState, useEffect } from "react";
import { TrendingUp, Dumbbell, Zap, CheckCircle2, History } from "lucide-react";

const ExerciseTracker = ({ userId }) => {
  const [exerciseName, setExerciseName] = useState("Barbell Squat");
  const [weight, setWeight] = useState(80);
  const [targetReps, setTargetReps] = useState(8);
  const [completedReps, setCompletedReps] = useState(8);
  const [rpe, setRpe] = useState(7);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loggedSets, setLoggedSets] = useState([]);

  const fetchTodaySets = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/training/today-sets/${userId}`);
      const data = await res.json();
      console.log("RAW BACKEND SETS DATA:", data.exercises);
      if (data.success) {
        setLoggedSets(data.exercises);
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
    try {
      const res = await fetch("http://localhost:5000/api/training/log-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          exerciseName,
          setNumber: loggedSets.filter(s => s.name === exerciseName).length + 1,
          weight: Number(weight),
          targetReps: Number(targetReps),
          completedReps: Number(completedReps),
          rpe: Number(rpe)
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback(data.feedback);
        setLoggedSets(data.dailyLog.completedExercises);
      }
    } catch (err) {
      console.error("Set log error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-2xl transition-colors dark:border-white/[0.08] dark:bg-[#101015]/80">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <Dumbbell size={18} />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Progressive Overload Engine
          </h3>
        </div>
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-400">
          Adaptive RPE Logic
        </span>
      </div>

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
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
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
                className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                required
              />
              <input
                type="number"
                value={completedReps}
                onChange={(e) => setCompletedReps(e.target.value)}
                className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
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
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-violet-500 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Evaluating Overload..." : <><Zap size={14} /> Calculate & Commit Set</>}
        </button>
      </form>

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

     {loggedSets.length > 0 && (
  <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/[0.08]">
    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
      <History size={13} />
      <span>Today's Recorded Sets ({loggedSets.length})</span>
    </div>
    <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
      {loggedSets.map((s, idx) => {
        // Fallbacks for property name differences:
        const setName = s.name || s.exerciseName || s.exercise || "Exercise";
        const setNum = s.set ?? s.setNumber ?? (idx + 1);
        const setWeight = s.weight ?? s.load ?? 0;
        const compReps = s.completedReps ?? s.reps ?? s.actualReps ?? 0;
        const targReps = s.targetReps ?? s.target ?? compReps;
        const rpeVal = s.rpe ?? s.userRpe ?? "-";

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