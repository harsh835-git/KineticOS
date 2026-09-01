import React, { useState } from "react";
import {
  X,
  Zap,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Dumbbell,
  Utensils,
  Scale,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const DailyCheckInModal = ({ isOpen, onClose, userId, onCheckInComplete }) => {
  const [energyLevel, setEnergyLevel] = useState("Normal");
  const [workoutStatus, setWorkoutStatus] = useState("Completed");
  const [dietStatus, setDietStatus] = useState("Followed");
  const [weight, setWeight] = useState("");
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState({
    waist: "",
    chest: "",
    hips: "",
    arms: "",
    thighs: "",
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const energyOptions = [
    { level: "Energized", icon: Zap, label: "Energized", desc: "Peak output ready" },
    { level: "Normal", icon: BatteryCharging, label: "Normal", desc: "Solid baseline" },
    { level: "Slightly Fatigued", icon: Battery, label: "Fatigued", desc: "Mild recovery lag" },
    { level: "Very Tired", icon: BatteryWarning, label: "Exhausted", desc: "High central fatigue" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const activeUserId = userId || storedUser._id || storedUser.id;

      if (!activeUserId) {
        alert("User session not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Sanitize measurements to prevent sending empty strings
      let cleanMeasurements = undefined;
      if (showMeasurements) {
        const temp = {};
        Object.entries(measurements).forEach(([key, val]) => {
          if (val !== "" && val !== undefined && val !== null && !isNaN(parseFloat(val))) {
            temp[key] = parseFloat(val);
          }
        });
        if (Object.keys(temp).length > 0) {
          cleanMeasurements = temp;
        }
      }

      const payload = {
        userId: activeUserId,
        energyLevel,
        workoutStatus,
        dietStatus,
      };

      if (weight && weight !== "" && !isNaN(parseFloat(weight))) {
        payload.weight = parseFloat(weight);
      }

      if (cleanMeasurements) {
        payload.measurements = cleanMeasurements;
      }

      if (notes && notes.trim()) {
        payload.notes = notes.trim();
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/log/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onCheckInComplete) onCheckInComplete(data.log);
        onClose();
      } else {
        alert(data.message || "Failed to submit check-in log.");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      alert(`Network error: ${err.message}. Ensure backend is running.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0d0d12] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daily Biometric Check-In</h2>
              <p className="text-[11px] text-zinc-400">KineticOS Biometric & Fatigue Log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Energy Status */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Energy & Recovery Status
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {energyOptions.map((opt) => {
                const Icon = opt.icon;
                const active = energyLevel === opt.level;
                return (
                  <button
                    type="button"
                    key={opt.level}
                    onClick={() => setEnergyLevel(opt.level)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      active
                        ? "bg-violet-600/15 border-violet-500/40 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-violet-400" : "text-zinc-500"} />
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Workout Completion */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Dumbbell size={14} className="text-violet-400" /> 2. Today's Workout Protocol
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Completed", "Partial", "Skipped"].map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setWorkoutStatus(status)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    workoutStatus === status
                      ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/40"
                      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Diet Adherence */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Utensils size={14} className="text-violet-400" /> 3. Diet & Macro Adherence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Followed", "Mostly", "Deviated"].map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setDietStatus(status)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    dietStatus === status
                      ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/40"
                      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Scale Weight */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Scale size={14} className="text-violet-400" /> 4. Scale Weight (Optional)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 70.5 (in kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* 5. Circumference Measurements */}
          <div className="space-y-3 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight size={14} className={showMeasurements ? "rotate-90 transition" : "transition"} />
              {showMeasurements ? "Hide Body Circumferences" : "+ Log Body Circumferences (Waist, Chest, etc.)"}
            </button>

            {showMeasurements && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                {["waist", "chest", "hips", "arms", "thighs"].map((field) => (
                  <div key={field}>
                    <label className="text-[10px] text-zinc-400 capitalize font-mono">{field} (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={measurements[field]}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, [field]: e.target.value })
                      }
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Daily Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Sleep quality, soreness, joint pain..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-900/30 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              "Logging Biometrics..."
            ) : (
              <>
                <CheckCircle2 size={16} /> Complete Daily Check-In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailyCheckInModal;