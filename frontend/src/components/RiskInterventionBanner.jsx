import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, Flame, ArrowRight, X,Loader2 } from "lucide-react";

const RiskInterventionBanner = ({ userId,onInterventionApplied }) => {
  const [riskData, setRiskData] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchRiskStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/risk/status/${userId}`);
        const data = await res.json();
        if (data.success) {
          setRiskData(data);
        }
      } catch (err) {
        console.error("Error fetching risk status:", err);
      }
    };

    fetchRiskStatus();
  }, [userId]);

 const handleApply = async () => {
    if (!riskData?.intervention?.type) return;
    setApplying(true);
    try {
      const res = await fetch("http://localhost:5000/api/training/apply-intervention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          interventionType: riskData.intervention.type
        })
      });
      const data = await res.json();
      
      if (data.success) {
        if (typeof onInterventionApplied === "function") {
          onInterventionApplied(data.updatedTodayWorkout);
        }
        setDismissed(true);
      } else {
        alert(data.message || "Failed to adjust session");
      }
    } catch (err) {
      console.error("Failed to apply intervention:", err);
    } finally {
      setApplying(false);
    }
  };

  if (dismissed || !riskData || !riskData.intervention) {
    return null;
  }

  const isHigh = riskData.riskLevel === "High";

  return (
  <div
      className={`relative mb-6 overflow-hidden rounded-3xl border p-5 backdrop-blur-2xl transition-all ${
        isHigh
          ? "border-rose-500/30 bg-rose-500/[0.06] dark:border-rose-500/20 dark:bg-rose-950/20"
          : "border-amber-500/30 bg-amber-500/[0.06] dark:border-amber-500/20 dark:bg-amber-950/20"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              isHigh
                ? "bg-rose-500/20 text-rose-400"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {isHigh ? <AlertTriangle size={20} /> : <Flame size={20} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isHigh
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {riskData.riskLevel} Risk • {riskData.riskScore}% Friction
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {riskData.intervention.title}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {riskData.intervention.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={handleApply}
            disabled={applying}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 ${
              isHigh
                ? "bg-rose-600 hover:bg-rose-500"
                : "bg-amber-600 hover:bg-amber-500"
            }`}
          >
            {applying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <span>{riskData.intervention.actionText}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-300"
            title="Dismiss banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskInterventionBanner;