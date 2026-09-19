import React, { useState } from "react";
import { X, Plus, Trash2, Dumbbell, Calendar } from "lucide-react";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CreateTemplateModal = ({ isOpen, onClose, onSaveSuccess }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [targetGoal, setTargetGoal] = useState("Muscle Gain");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Initialize all 7 days
  const [schedule, setSchedule] = useState(
    DAYS_OF_WEEK.map((day) => ({
      day,
      focus: day === "Sunday" ? "Rest & Recovery" : "Full Body",
      isRestDay: day === "Sunday",
      exercises: [],
    }))
  );

  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    targetMuscle: "Chest",
    sets: 3,
    reps: "8-12",
    restSeconds: 90,
    cues: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Toggle active day rest status
  const toggleRestDay = (dayIndex) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              isRestDay: !d.isRestDay,
              focus: !d.isRestDay ? "Rest & Recovery" : "Training Day",
              exercises: !d.isRestDay ? [] : d.exercises,
            }
          : d
      )
    );
  };

  // Update focus for active day
  const handleFocusChange = (text) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === activeDayIndex ? { ...d, focus: text } : d))
    );
  };

  // Add exercise to active day
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!currentExercise.name.trim()) return;

    setSchedule((prev) =>
      prev.map((d, i) =>
        i === activeDayIndex
          ? {
              ...d,
              exercises: [...d.exercises, { ...currentExercise, sets: Number(currentExercise.sets), restSeconds: Number(currentExercise.restSeconds) }],
            }
          : d
      )
    );

    setCurrentExercise({
      name: "",
      targetMuscle: "Chest",
      sets: 3,
      reps: "8-12",
      restSeconds: 90,
      cues: "",
    });
  };

  // Delete exercise from active day
  const handleRemoveExercise = (exIndex) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === activeDayIndex
          ? {
              ...d,
              exercises: d.exercises.filter((_, idx) => idx !== exIndex),
            }
          : d
      )
    );
  };

  // Submit complete template
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a template title");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          targetGoal,
          experienceLevel,
          schedule,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSaveSuccess(data.template);
        onClose();
      } else {
        alert(data.message || "Failed to create workout template");
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating template");
    } finally {
      setSubmitting(false);
    }
  };

  const currentDay = schedule[activeDayIndex];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e0e15] border border-white/[0.1] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Dumbbell size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Workout Template Engine
              </h2>
              <p className="text-[11px] text-zinc-400">
                Design custom splits, routines, and form cues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Template Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 4-Day Hypertrophy Core"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Target Goal
              </label>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-zinc-300 outline-none focus:border-violet-500/60 cursor-pointer"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Body Recomposition">Body Recomposition</option>
                <option value="Maintain">Maintain</option>
                <option value="Improve Endurance">Improve Endurance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-zinc-300 outline-none focus:border-violet-500/60 cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Day Selector Tabs */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
              <Calendar size={13} className="text-violet-400" /> Select Day Routine
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {schedule.map((d, index) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setActiveDayIndex(index)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition cursor-pointer border ${
                    activeDayIndex === index
                      ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-900/30"
                      : d.isRestDay
                      ? "bg-black/20 border-white/[0.04] text-zinc-500 hover:text-zinc-300"
                      : "bg-white/[0.03] border-white/[0.07] text-zinc-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="font-semibold">{d.day.slice(0, 3)}</p>
                  <p className="text-[9px] opacity-75 truncate">
                    {d.isRestDay ? "Rest" : `${d.exercises.length} Ex`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Day Configuration Panel */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-sm font-bold text-white">
                  {currentDay.day} Configuration
                </span>
                <p className="text-[11px] text-zinc-400">
                  {currentDay.isRestDay ? "Scheduled as a rest day." : "Add planned movements below."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Split Focus (e.g. Chest & Triceps)"
                  value={currentDay.focus}
                  onChange={(e) => handleFocusChange(e.target.value)}
                  disabled={currentDay.isRestDay}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none disabled:opacity-40"
                />

                <button
                  type="button"
                  onClick={() => toggleRestDay(activeDayIndex)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    currentDay.isRestDay
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white"
                  }`}
                >
                  {currentDay.isRestDay ? "Set as Workout Day" : "Set as Rest Day"}
                </button>
              </div>
            </div>

            {/* If Not Rest Day: Exercise Inputs */}
            {!currentDay.isRestDay && (
              <div className="space-y-4">
                {/* Exercise Creation Sub-form */}
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g. Barbell Squat)"
                      value={currentExercise.name}
                      onChange={(e) =>
                        setCurrentExercise({ ...currentExercise, name: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <select
                      value={currentExercise.targetMuscle}
                      onChange={(e) =>
                        setCurrentExercise({
                          ...currentExercise,
                          targetMuscle: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-zinc-300 outline-none"
                    >
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Quads">Quads</option>
                      <option value="Hamstrings">Hamstrings</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Biceps">Biceps</option>
                      <option value="Triceps">Triceps</option>
                      <option value="Core">Core</option>
                      <option value="Calves">Calves</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Sets"
                      value={currentExercise.sets}
                      onChange={(e) =>
                        setCurrentExercise({ ...currentExercise, sets: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Reps (e.g. 8-12)"
                      value={currentExercise.reps}
                      onChange={(e) =>
                        setCurrentExercise({ ...currentExercise, reps: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddExercise}
                      className="w-full h-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Optional Form Cue / Instructions (e.g. Retract scapula, slow eccentric)"
                      value={currentExercise.cues}
                      onChange={(e) =>
                        setCurrentExercise({ ...currentExercise, cues: e.target.value })
                      }
                      className="w-full px-3 py-1 rounded-lg bg-black/20 border border-white/[0.04] text-[11px] text-zinc-300 placeholder:text-zinc-600 outline-none"
                    />
                  </div>
                </div>

                {/* Exercises Table for this Day */}
                <div className="space-y-2">
                  {currentDay.exercises.length === 0 ? (
                    <p className="text-[11px] text-zinc-600 text-center py-4">
                      No exercises added for {currentDay.day} yet.
                    </p>
                  ) : (
                    currentDay.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{ex.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              {ex.targetMuscle}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            {ex.sets} sets × {ex.reps} reps · {ex.restSeconds}s rest
                            {ex.cues ? ` — "${ex.cues}"` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition shadow-lg shadow-violet-900/30 cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Saving Plan..." : "Deploy Template"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;