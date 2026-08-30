import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Flame,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Target,
  RefreshCw,
  Sliders,
  Settings,
  X,
  Menu,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "workout", "nutrition"
  const [sidebarOpen, setSidebarOpen] = useState(false); // Controls collapsed (w-16) vs expanded (w-64)
  const [showPreferences, setShowPreferences] = useState(false);

  const fetchDashboard = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;

    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/user/dashboard/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Failed to load dashboard data.");
        setLoading(false);
        return;
      }

      setData(result);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Toggle Veg / Non-Veg
  const handleToggleDiet = async () => {
    if (!data?.user?.profile) return;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;
    const currentPref = data.user.profile.dietaryPreference || "non-vegetarian";
    const nextPref = currentPref === "vegetarian" ? "non-vegetarian" : "vegetarian";

    setUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...data.user.profile,
          dietaryPreference: nextPref,
        }),
      });

      if (!res.ok) throw new Error("Failed to update diet preference");

      await fetch("http://localhost:5000/api/diet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      await fetchDashboard();
    } catch (err) {
      console.error("Error updating diet:", err);
      alert("Could not update dietary preference");
    } finally {
      setUpdating(false);
    }
  };

  // Change Target Goal
  const handleChangeGoal = async (newGoal) => {
    if (!data?.user?.profile || newGoal === data.user.profile.primaryGoal) return;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;

    setUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...data.user.profile,
          primaryGoal: newGoal,
        }),
      });

      if (!res.ok) throw new Error("Failed to update goal");

      await Promise.all([
        fetch("http://localhost:5000/api/workout/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("http://localhost:5000/api/diet/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
      ]);

      await fetchDashboard();
    } catch (err) {
      console.error("Error updating goal:", err);
      alert("Could not update target goal");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-violet-400">
          <Activity className="animate-spin" size={24} />
          <span className="text-sm font-semibold tracking-wider uppercase">Loading KineticOS Engine...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-4">
        <p className="text-red-400 text-sm mb-4">{error || "No dashboard data available."}</p>
        <button
          onClick={() => navigate("/onboarding")}
          className="px-5 py-2.5 bg-violet-600 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Setup Profile & Generate Plans
        </button>
      </div>
    );
  }

  const { user, todayWorkout, todayDiet, currentDay, weeklyWorkoutPlan, weeklyDietPlan } = data;
  const profile = user.profile || {};
  const isVeg = profile.dietaryPreference === "vegetarian";

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "workout", label: "Weekly Workout", icon: Dumbbell },
    { id: "nutrition", label: "Weekly Nutrition", icon: Utensils },
  ];

  const availableGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Body Recomposition",
    "Maintain",
    "Improve Endurance",
  ];

  return (
    <div className="max-h-screen bg-[#050507] text-white flex relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[550px] h-[550px] rounded-full bg-violet-700/10 blur-[160px]" />
        <div className="absolute top-[40%] -right-48 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[160px]" />
      </div>

      {/* Updating Overlay Spinner */}
      {updating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-violet-400" size={32} />
          <p className="text-xs font-semibold text-zinc-300 tracking-wider uppercase">Adapting Engine & Generating Plans...</p>
        </div>
      )}

      {/* ================= DYNAMIC SIDEBAR (COLLAPSIBLE RAIL) ================= */}
      <aside
        className={`h-screen sticky top-0 bg-[#09090c]/95 border-r border-white/[0.06] backdrop-blur-2xl flex flex-col justify-between py-5 z-40 shrink-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64 px-4" : "w-16 px-2.5 items-center"
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-4 w-full">
          {/* Top Toggle Header (Hamburger sits here in sidebar) */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center gap-3 cursor-pointer rounded-xl text-zinc-400 hover:text-white transition ${
                sidebarOpen ? "px-2 py-1.5 hover:bg-white/[0.05] w-full justify-between" : "w-10 h-10 justify-center hover:bg-white/[0.05]"
              }`}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <div className="flex items-center gap-2.5">
                <Menu size={20} className="shrink-0 text-zinc-300" />
                {sidebarOpen && (
                  <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
                    Menu
                  </span>
                )}
              </div>
              {sidebarOpen && <X size={16} className="text-zinc-500 hover:text-white" />}
            </button>
          </div>

          {/* Quick Veg/Non-Veg Switch */}
          {sidebarOpen ? (
            <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Diet</span>
                <span className={`text-[10px] font-semibold capitalize ${isVeg ? "text-emerald-400" : "text-amber-400"}`}>
                  {profile.dietaryPreference || "Non-Veg"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleDiet}
                disabled={updating}
                className="w-full flex items-center justify-between p-1 rounded-lg bg-black/40 border border-white/[0.08] cursor-pointer hover:border-violet-500/40 transition"
              >
                <span className={`flex-1 py-1 rounded text-center text-[10px] font-semibold transition ${
                  isVeg ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-500"
                }`}>
                  🌱 Veg
                </span>
                <span className={`flex-1 py-1 rounded text-center text-[10px] font-semibold transition ${
                  !isVeg ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-zinc-500"
                }`}>
                  🍗 Non-Veg
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleDiet}
              disabled={updating}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                isVeg
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
              }`}
              title={`Diet: ${isVeg ? "Vegetarian (Click to switch)" : "Non-Vegetarian (Click to switch)"}`}
            >
              <span className="text-sm select-none">{isVeg ? "🌱" : "🍗"}</span>
            </button>
          )}

          <div className="w-full h-px bg-white/[0.08] my-1" />

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5 w-full">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer relative group ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  } ${sidebarOpen ? "w-full justify-start" : "w-10 h-10 justify-center"}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {sidebarOpen && <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>}
                  {!sidebarOpen && (
                    <span className="absolute left-14 px-2.5 py-1 rounded-md bg-[#18181f] border border-white/[0.1] text-white text-[11px] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-xl z-50">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Goal Selector when Expanded */}
          {sidebarOpen && (
            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] mt-2">
              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
                Target Goal
              </label>
              <select
                value={profile.primaryGoal || "Weight Loss"}
                onChange={(e) => handleChangeGoal(e.target.value)}
                disabled={updating}
                className="w-full h-8 bg-[#111117] border border-white/[0.08] rounded-lg px-2 text-xs text-white focus:border-violet-500 outline-none cursor-pointer"
              >
                {availableGoals.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2 w-full pt-3 border-t border-white/[0.06]">
          {/* User Badge */}
          <div className={`flex items-center gap-2.5 ${sidebarOpen ? "px-1" : "justify-center"}`}>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-white text-xs font-bold border border-violet-400/30 shrink-0"
              title={`${user.name} (${user.email})`}
            >
              {user.name?.charAt(0)?.toUpperCase() || "H"}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate max-w-[140px]">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate max-w-[140px]">{user.email}</p>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer relative group ${
              sidebarOpen ? "w-full px-3 py-2 text-xs font-semibold justify-start" : "w-10 h-10 justify-center"
            }`}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
            {!sidebarOpen && (
              <span className="absolute left-14 px-2.5 py-1 rounded-md bg-[#18181f] border border-white/[0.1] text-red-400 text-[11px] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-xl z-50">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (Logo first, then brand name, then separator and active tab) */}
        <header className="px-6 py-5 border-b border-white/[0.06] bg-[#07070b]/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Logo is placed on the left */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.35)] shrink-0">
              <Activity size={16} className="text-white" />
            </div>

            {/* KineticOS Brand */}
            <span className="text-base font-bold tracking-tight text-white leading-none">
              Kinetic<span className="text-violet-500">OS</span>
            </span>

            {/* Separator Slash */}
            <span className="text-zinc-600 font-light text-lg select-none">/</span>

            {/* Dynamic Active Tab Name Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide">
              {activeTab === "overview" && <LayoutDashboard size={13} />}
              {activeTab === "workout" && <Dumbbell size={13} />}
              {activeTab === "nutrition" && <Utensils size={13} />}
              <span>{navigationItems.find((n) => n.id === activeTab)?.label}</span>
            </div>
          </div>

          {/* Right Highlights */}
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-block text-[11px] text-zinc-400 mr-2">
              Welcome back, <strong className="text-zinc-200">{user.name}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold text-[11px]">
              {profile.primaryGoal}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${
                isVeg
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-300"
              }`}
            >
              {profile.dietaryPreference || "Non-Veg"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Active Goal</span>
                <Target size={16} className="text-violet-400" />
              </div>
              <p className="text-lg font-bold mt-2 text-white truncate">{profile.primaryGoal || "Adaptive Plan"}</p>
              <span className="text-[10px] text-zinc-500 capitalize">{profile.experienceLevel} • {profile.dietaryPreference}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Target Fuel</span>
                <Flame size={16} className="text-amber-400" />
              </div>
              <p className="text-lg font-bold mt-2 text-amber-300">
                {profile.targetCalories || 2000} <span className="text-xs text-zinc-400">kcal/day</span>
              </p>
              <span className="text-[10px] text-zinc-500">Maint: {profile.maintenanceCalories} kcal</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Body Mass Index</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <p className="text-lg font-bold mt-2 text-white">{profile.bmi || "--"}</p>
              <span className="text-[10px] text-zinc-500">{profile.currentWeight} kg → Goal: {profile.targetWeight} kg</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Habit Engine</span>
                <Zap size={16} className="text-purple-400" />
              </div>
              <p className="text-lg font-bold mt-2 text-purple-300">85<span className="text-xs text-zinc-400">/100</span></p>
              <span className="text-[10px] text-zinc-500">Streak: 1 Day Active</span>
            </div>
          </div>

          {/* ================= TAB 1: TODAY'S OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Today's Workout Card */}
              <div className="rounded-3xl bg-[#101015]/80 border border-white/[0.08] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
                    <Dumbbell size={16} /> Today's Training • {currentDay}
                  </div>
                  {todayWorkout?.isRestDay && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      Rest & Mobility
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{todayWorkout?.focus || "Rest Day"}</h2>

                {todayWorkout?.isRestDay ? (
                  <div className="p-8 text-center text-zinc-500 text-xs bg-black/20 rounded-2xl border border-white/[0.04]">
                    Active recovery day. Focus on foam rolling, hydration, and light walking.
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {todayWorkout?.exercises?.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:border-violet-500/30 transition flex items-start justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{ex.name}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{ex.formGuidance}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-xs font-mono font-bold text-violet-300">{ex.sets} × {ex.reps}</span>
                          <p className="text-[10px] text-zinc-600">{ex.restSeconds}s rest</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Diet & Macros Card */}
              <div className="rounded-3xl bg-[#101015]/80 border border-white/[0.08] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Utensils size={16} /> Today's Nutrition • {currentDay}
                  </div>
                  <span className="text-[10px] bg-white/[0.05] text-zinc-300 border border-white/[0.08] px-2 py-0.5 rounded-full font-mono">
                    {todayDiet?.macros?.macroSplit || "Balanced Split"}
                  </span>
                </div>

                {/* Macro Bar */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Protein</span>
                    <p className="text-sm font-bold text-violet-300 mt-0.5">{todayDiet?.macros?.proteinGrams}g</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Carbs</span>
                    <p className="text-sm font-bold text-amber-300 mt-0.5">{todayDiet?.macros?.carbsGrams}g</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Fats</span>
                    <p className="text-sm font-bold text-emerald-300 mt-0.5">{todayDiet?.macros?.fatsGrams}g</p>
                  </div>
                </div>

                {/* Meals List */}
                <div className="space-y-3">
                  {todayDiet?.meals?.map((meal, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.05] flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{meal.mealName}</span>
                          <span className="text-[10px] font-mono text-amber-400">{meal.calories} kcal</span>
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {meal.suggestedItems?.map((item, idx) => (
                            <li key={idx} className="text-[11px] text-zinc-400">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-[10px] text-zinc-500 text-right shrink-0 ml-3">
                        {meal.protein}P / {meal.carbs}C / {meal.fats}F
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: FULL 7-DAY WORKOUT SCHEDULE ================= */}
          {activeTab === "workout" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">7-Day Progressive Workout Routine</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Tailored for {profile.primaryGoal} ({profile.experienceLevel} level).
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyWorkoutPlan?.schedule?.length > 0 ? (
                  weeklyWorkoutPlan.schedule.map((day) => (
                    <div
                      key={day.dayName}
                      className={`p-5 rounded-2xl border transition ${
                        day.dayName === currentDay
                          ? "bg-violet-950/20 border-violet-500/50 shadow-lg shadow-violet-900/20"
                          : "bg-white/[0.02] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{day.dayName}</span>
                        {day.dayName === currentDay && (
                          <span className="text-[9px] bg-violet-500 text-white font-bold px-2 py-0.5 rounded-full">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-violet-300 font-semibold mb-3">{day.focus}</p>
                      {day.isRestDay ? (
                        <p className="text-[11px] text-zinc-500 italic">Active rest & muscle repair</p>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                          {day.exercises?.map((e, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{e.name}</span>
                              <span className="font-mono text-zinc-500">{e.sets}×{e.reps}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-xs col-span-3">No workout plan found.</p>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: FULL 7-DAY NUTRITION SCHEDULE ================= */}
          {activeTab === "nutrition" && (
            <div>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold">7-Day Adaptive Nutrition Schedule</h2>
                  <p className="text-xs text-zinc-400 mt-1 capitalize">
                    {profile.dietaryPreference} • {profile.primaryGoal} ({profile.targetCalories || 2000} kcal/day)
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono">
                  {todayDiet?.macros?.macroSplit}
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyDietPlan?.schedule?.length > 0 ? (
                  weeklyDietPlan.schedule.map((day) => (
                    <div
                      key={day.dayName}
                      className={`p-5 rounded-2xl border transition ${
                        day.dayName === currentDay
                          ? "bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-900/20"
                          : "bg-white/[0.02] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{day.dayName}</span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {day.targetCalories} kcal
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mb-3">
                        {day.macros?.macroSplit}
                      </p>
                      <div className="space-y-2 text-xs">
                        {day.meals?.map((m, idx) => (
                          <div key={idx} className="border-t border-white/[0.04] pt-1.5">
                            <div className="flex justify-between font-semibold text-zinc-300">
                              <span>{m.mealName}</span>
                              <span className="text-zinc-500 font-mono">{m.calories} kcal</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {m.suggestedItems?.[0]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-zinc-500 text-sm mb-3">No weekly nutrition plan found in database.</p>
                    <button
                      onClick={async () => {
                        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                        const userId = storedUser.id || storedUser._id;
                        await fetch("http://localhost:5000/api/diet/generate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId }),
                        });
                        fetchDashboard();
                      }}
                      className="px-4 py-2 bg-violet-600 rounded-xl text-xs font-semibold text-white cursor-pointer"
                    >
                      Generate Diet Plan Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;