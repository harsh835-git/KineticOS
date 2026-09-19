import React from "react";
import { Award, Flame, CheckCircle2, Droplets, ArrowRight, Zap, RotateCcw } from "lucide-react";

const WorkoutSummaryModal = ({ isOpen, onClose, summaryData }) => {
  if (!isOpen || !summaryData) return null;

  const {
    duration = "42m",
    totalTonnage = 0,
    completedCount = 0,
    totalPlanned = 0,
    prsAchieved = [],
    habitScoreDelta = "+25",
  } = summaryData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-white/[0.08] dark:bg-[#0f0f16]">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Header Badge & Title */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10">
            <Award size={28} />
          </div>
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-mono font-medium text-violet-400">
            Session Completed
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workout Finalized!
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Mechanical load persisted to your adaptive training log.
          </p>
        </div>

        {/* Core Metric Highlights Strip */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              Total Volume
            </span>
            <p className="mt-1 font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalTonnage} <span className="text-[10px] font-normal">kg</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              Exercises
            </span>
            <p className="mt-1 font-mono text-base font-extrabold text-violet-600 dark:text-violet-400">
              {completedCount}/{totalPlanned}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              Duration
            </span>
            <p className="mt-1 font-mono text-base font-extrabold text-amber-500">
              {duration}
            </p>
          </div>
        </div>

        {/* PR Showcase Card */}
        {prsAchieved.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Flame size={15} className="text-amber-400" />
              <span>Milestones & PRs Unlocked</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {prsAchieved.map((pr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[11px] text-slate-700 dark:text-zinc-300"
                >
                  <span className="font-medium text-slate-900 dark:text-white">{pr.name}</span>
                  <span className="font-mono text-amber-400">
                    {pr.weight} kg × {pr.reps} reps ({pr.est1RM} kg 1RM)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-zinc-400">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Target stimulus completed. Volume recorded for recovery balancing.</span>
          </div>
        )}

        {/* Habit Engine Reward Banner */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-300">Habit Engine Impact</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400">
            {habitScoreDelta} Habit Points
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer"
        >
          <span>Return to Dashboard</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default WorkoutSummaryModal;