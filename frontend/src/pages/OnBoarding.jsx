import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    height: "",
    currentWeight: "",
    targetWeight: "",
    activityLevel: "moderate",
    experienceLevel: "beginner",
    primaryGoal: "Weight Loss",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePreview = () => {
    const w = parseFloat(formData.currentWeight) || 70;
    const h = parseFloat(formData.height) || 175;
    const a = parseFloat(formData.age) || 25;
    const hM = h / 100;
    const bmi = (w / (hM * hM)).toFixed(1);

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr = formData.gender === "male" ? bmr + 5 : bmr - 161;

    const mults = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };
    const maint = Math.round(bmr * (mults[formData.activityLevel] || 1.2));
    let target = maint;
    if (formData.primaryGoal === "Weight Loss") target -= 500;
    if (formData.primaryGoal === "Muscle Gain") target += 300;
    if (formData.primaryGoal === "Body Recomposition") target -= 200;

    const floor = formData.gender === "male" ? 1500 : 1200;
    if (target < floor) target = floor;

    return { bmi, maint, target };
  };

  const handleFinish = async () => {
    setError("");
    setLoading(true);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;

    try {
      const res = await fetch("http://localhost:5000/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to complete setup");
        setLoading(false);
        return;
      }

      // 2. Generate 7-Day Workout Routine
      await fetch("http://localhost:5000/api/workout/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col justify-between relative overflow-hidden px-4 py-8">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-purple-600/15 blur-[160px]" />

      {/* Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              Kinetic<span className="text-violet-500">OS</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Adaptive Profile Setup
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
          Step {step} of 3
        </div>
      </header>

      {/* Step Container Card */}
      <main className="max-w-xl w-full mx-auto my-auto z-10 bg-[#111116]/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold">Biometrics & Body Data</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Used for baseline Mifflin-St Jeor calorie calculations.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`h-11 rounded-xl capitalize text-sm font-semibold border transition ${
                        formData.gender === g
                          ? "border-violet-500 bg-violet-600/20 text-white"
                          : "border-white/[0.08] bg-black/20 text-zinc-400 hover:bg-white/[0.04]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g. 23"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full h-11 bg-black/25 border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-violet-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    placeholder="e.g. 175"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full h-11 bg-black/25 border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-violet-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="currentWeight"
                    placeholder="e.g. 74"
                    value={formData.currentWeight}
                    onChange={handleChange}
                    className="w-full h-11 bg-black/25 border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-violet-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="targetWeight"
                    placeholder="e.g. 68"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    className="w-full h-11 bg-black/25 border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-violet-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold">Goals & Activity Level</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Calibrates your weekly workout generator and macro deficit.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
                  Primary Goal
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Weight Loss",
                    "Muscle Gain",
                    "Body Recomposition",
                    "Maintain",
                    "Improve Endurance",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, primaryGoal: goal })
                      }
                      className={`h-11 px-4 rounded-xl text-left text-sm font-semibold flex items-center justify-between border transition ${
                        formData.primaryGoal === goal
                          ? "border-violet-500 bg-violet-600/20 text-white"
                          : "border-white/[0.08] bg-black/20 text-zinc-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      {goal}
                      {formData.primaryGoal === goal && (
                        <CheckCircle2 size={16} className="text-violet-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full h-11 bg-[#18181f] border border-white/[0.08] rounded-xl px-3 text-xs text-white focus:border-violet-500 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Daily Activity
                  </label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full h-11 bg-[#18181f] border border-white/[0.08] rounded-xl px-3 text-xs text-white focus:border-violet-500 outline-none"
                  >
                    <option value="sedentary">Sedentary (desk job)</option>
                    <option value="light">Light (1-2 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="very_active">
                      Very Active (6-7 days/week)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-[10px] font-bold tracking-wider mb-2">
              <Sparkles size={12} /> PROFILE COMPUTATION
            </div>
            <h2 className="text-2xl font-bold">Your Target Plan</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Calculated according to the Mifflin-St Jeor standard.
            </p>

            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/[0.06] text-center">
                <p className="text-[10px] text-zinc-500 font-semibold uppercase">
                  BMI
                </p>
                <p className="text-xl font-bold text-white mt-1">
                  {preview.bmi}
                </p>
              </div>
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/[0.06] text-center">
                <p className="text-[10px] text-zinc-500 font-semibold uppercase">
                  Maintenance
                </p>
                <p className="text-xl font-bold text-zinc-300 mt-1">
                  {preview.maint} <span className="text-xs">kcal</span>
                </p>
              </div>
              <div className="p-3.5 bg-violet-950/30 rounded-2xl border border-violet-500/30 text-center">
                <p className="text-[10px] text-violet-400 font-semibold uppercase">
                  Target
                </p>
                <p className="text-xl font-bold text-violet-300 mt-1">
                  {preview.target} <span className="text-xs">kcal</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-start gap-2.5 text-zinc-400 text-xs leading-relaxed">
              <ShieldAlert
                size={18}
                className="text-amber-400 shrink-0 mt-0.5"
              />
              <span>
                Safe calorie floor enforced (
                {formData.gender === "male" ? "1500" : "1200"} kcal min). Clear
                medical disclaimer: Consult a physician before following extreme
                dietary deficits.
              </span>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/[0.06]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (
                  step === 1 &&
                  (!formData.age || !formData.height || !formData.currentWeight)
                ) {
                  alert("Please enter age, height, and current weight");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-900/30 ml-auto"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-900/30 disabled:opacity-60 ml-auto"
            >
              {loading ? "Generating Plan..." : "Complete & Enter Dashboard"}
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-[11px] text-zinc-600 z-10 mt-4">
        KineticOS Adaptive Engine • Mifflin-St Jeor Formulation[cite: 2]
      </footer>
    </div>
  );
};

export default Onboarding;
