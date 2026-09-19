import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Activity,
  Dumbbell,
  Utensils,
  RefreshCw,
  ChevronRight,
  Check,
  Trash2,
} from "lucide-react";

const UserDetailDrawer = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Workout template state
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [assigningWorkout, setAssigningWorkout] = useState(false);
  const [assignWorkoutSuccess, setAssignWorkoutSuccess] = useState(false);
  const [deletingWorkout, setDeletingWorkout] = useState(false);

  // Diet template state
  const [dietTemplates, setDietTemplates] = useState([]);
  const [selectedDietId, setSelectedDietId] = useState("");
  const [assigningDiet, setAssigningDiet] = useState(false);
  const [assignDietSuccess, setAssignDietSuccess] = useState(false);
  const [deletingDiet, setDeletingDiet] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchDrawerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // 1. Fetch user telemetry and current active plans
        const resUser = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataUser = await resUser.json();
        if (dataUser.success) {
          setUserData(dataUser);
        }

        // 2. Fetch workout templates
        const resWorkouts = await fetch("http://localhost:5000/api/admin/templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataWorkouts = await resWorkouts.json();
        const workoutList = dataWorkouts.templates || (Array.isArray(dataWorkouts) ? dataWorkouts : []);
        setWorkoutTemplates(workoutList);
        if (workoutList.length > 0) setSelectedWorkoutId(workoutList[0]._id);

        // 3. Fetch diet templates
        const resDiets = await fetch("http://localhost:5000/api/admin/diet-templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataDiets = await resDiets.json();
        const dietList = dataDiets.templates || (Array.isArray(dataDiets) ? dataDiets : []);
        setDietTemplates(dietList);
        if (dietList.length > 0) setSelectedDietId(dietList[0]._id);
      } catch (err) {
        console.error("Error loading drawer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrawerData();
  }, [userId]);

  // Workout Assignment & Deletion
  const handleAssignWorkout = async () => {
    if (!selectedWorkoutId) return;
    try {
      setAssigningWorkout(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/assign-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ templateId: selectedWorkoutId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserData((prev) => ({ ...prev, activePlan: data.activePlan }));
        setAssignWorkoutSuccess(true);
        setTimeout(() => setAssignWorkoutSuccess(false), 2000);
      } else {
        alert(data.message || "Failed to assign workout template.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deploying workout routine.");
    } finally {
      setAssigningWorkout(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!window.confirm("Remove this workout routine from the user?")) return;
    try {
      setDeletingWorkout(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/workout-plan`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserData((prev) => ({ ...prev, activePlan: null }));
      } else {
        alert(data.message || "Failed to delete routine.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting workout routine.");
    } finally {
      setDeletingWorkout(false);
    }
  };

  // Diet Assignment & Deletion
  const handleAssignDiet = async () => {
    if (!selectedDietId) return;
    try {
      setAssigningDiet(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/assign-diet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ templateId: selectedDietId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserData((prev) => ({ ...prev, activeDiet: data.activeDiet }));
        setAssignDietSuccess(true);
        setTimeout(() => setAssignDietSuccess(false), 2000);
      } else {
        alert(data.message || "Failed to assign diet template.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deploying diet plan.");
    } finally {
      setAssigningDiet(false);
    }
  };

  const handleDeleteDiet = async () => {
    if (!window.confirm("Remove this diet plan from the user?")) return;
    try {
      setDeletingDiet(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/diet-plan`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserData((prev) => ({ ...prev, activeDiet: null }));
      } else {
        alert(data.message || "Failed to remove diet routine.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting diet plan.");
    } finally {
      setDeletingDiet(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d0d14] border-l border-white/[0.08] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">User Inspector</h3>
                <p className="text-[10px] font-mono text-zinc-500">Biometrics, Training & Diet Diagnostics</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-500">
                <RefreshCw size={16} className="animate-spin mr-2" /> Loading profile...
              </div>
            ) : !userData?.user ? (
              <div className="text-xs text-zinc-500 text-center py-10">Profile details unavailable.</div>
            ) : (
              <>
                {/* Identity Summary Card */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base text-white">{userData.user.name}</h4>
                      <p className="text-xs text-zinc-400">{userData.user.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      userData.user.role === "admin"
                        ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {userData.user.role || "user"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-zinc-600 block">Status:</span>
                      <span className={userData.user.isBlocked ? "text-red-400" : userData.user.isOnboarded ? "text-emerald-400" : "text-amber-400"}>
                        {userData.user.isBlocked ? "Suspended" : userData.user.isOnboarded ? "Onboarded" : "Pending Setup"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block">Registered:</span>
                      <span className="text-zinc-300">{new Date(userData.user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Biometrics & Goals */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-cyan-400" /> Biometric Telemetry
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Weight</span>
                      <span className="text-sm font-bold text-white">{userData.user.profile?.weight ? `${userData.user.profile.weight} kg` : "--"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Height</span>
                      <span className="text-sm font-bold text-white">{userData.user.profile?.height ? `${userData.user.profile.height} cm` : "--"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Age</span>
                      <span className="text-sm font-bold text-white">{userData.user.profile?.age || "--"}</span>
                    </div>
                  </div>
                </div>

                {/* ================= WORKOUT SECTION ================= */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Dumbbell size={14} className="text-violet-400" /> Workout Routine
                    </h4>
                    {userData.activePlan && (
                      <button
                        onClick={handleDeleteWorkout}
                        disabled={deletingWorkout}
                        className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 size={13} /> {deletingWorkout ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>

                  {userData.activePlan ? (
                    <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-white">
                          {userData.activePlan.title || `${userData.activePlan.goal || "Custom"} Plan`}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 font-mono">
                          {userData.activePlan.schedule?.length || 7} Days
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {userData.activePlan.targetGoal || userData.activePlan.goal} · {userData.activePlan.experienceLevel}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04] text-[11px] text-zinc-500 text-center">
                      No active workout routine assigned.
                    </div>
                  )}

                  {workoutTemplates.length > 0 && (
                    <div className="flex gap-2">
                      <select
                        value={selectedWorkoutId}
                        onChange={(e) => setSelectedWorkoutId(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                      >
                        {workoutTemplates.map((t) => (
                          <option key={t._id} value={t._id} className="bg-[#0f0f15]">{t.title}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignWorkout}
                        disabled={assigningWorkout || !selectedWorkoutId}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {assignWorkoutSuccess ? <Check size={13} className="text-emerald-300" /> : <ChevronRight size={13} />}
                        <span>{assigningWorkout ? "..." : "Deploy"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ================= DIET & NUTRITION SECTION ================= */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Utensils size={14} className="text-emerald-400" /> Nutrition & Diet Plan
                    </h4>
                    {userData.activeDiet && (
                      <button
                        onClick={handleDeleteDiet}
                        disabled={deletingDiet}
                        className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 size={13} /> {deletingDiet ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>

                  {userData.activeDiet ? (
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-white">
                          {userData.activeDiet.title || "Target Diet Routine"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                          {userData.activeDiet.caloriesTarget || 2000} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-zinc-300 pt-1 border-t border-white/[0.04]">
                        <div>P: <strong className="text-white">{userData.activeDiet.macros?.protein || 0}g</strong></div>
                        <div>C: <strong className="text-white">{userData.activeDiet.macros?.carbs || 0}g</strong></div>
                        <div>F: <strong className="text-white">{userData.activeDiet.macros?.fats || 0}g</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04] text-[11px] text-zinc-500 text-center">
                      No active diet routine assigned.
                    </div>
                  )}

                  {dietTemplates.length > 0 ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedDietId}
                        onChange={(e) => setSelectedDietId(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                      >
                        {dietTemplates.map((d) => (
                          <option key={d._id} value={d._id} className="bg-[#0f0f15]">
                            {d.title} ({d.caloriesTarget || d.targetGoal || "Diet"})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignDiet}
                        disabled={assigningDiet || !selectedDietId}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {assignDietSuccess ? <Check size={13} className="text-white" /> : <ChevronRight size={13} />}
                        <span>{assigningDiet ? "..." : "Deploy"}</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500 italic">No platform diet blueprints found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailDrawer;