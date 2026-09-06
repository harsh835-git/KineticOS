import React from "react";
import { Milestone, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

const MultiWeekRoadmap = ({ roadmap }) => {
  if (!roadmap) return null;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm dark:bg-[#101015]/80 dark:border-white/[0.08] dark:shadow-none backdrop-blur-2xl transition-colors">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Milestone size={18} className="text-violet-500 dark:text-violet-400" />
            Mesocycle Roadmap (Weeks 1–{roadmap.totalWeeks})
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
            Active Phase Progression: Currently on Week {roadmap.currentWeek} of {roadmap.totalWeeks}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
          Week {roadmap.currentWeek} Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {roadmap.phases?.map((phase, idx) => {
          const isActive = phase.status === "in-progress";
          const isDone = phase.status === "completed";

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-violet-500/[0.04] border-violet-500/40 shadow-sm dark:shadow-none"
                  : isDone
                  ? "bg-emerald-500/[0.03] border-emerald-500/30"
                  : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {phase.durationWeeks} Weeks
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                      <CheckCircle2 size={12} /> Complete
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-500 animate-pulse">
                      <Clock size={12} /> In Progress
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">Upcoming</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {phase.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {phase.focus}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.05] space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Load Target:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-zinc-200">
                    {phase.targetMetric}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500/90 font-medium">
                  <ShieldAlert size={12} />
                  <span>{phase.milestoneMarker}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiWeekRoadmap;