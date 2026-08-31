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
  Circle,
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
  Droplets,
  Plus,
  Minus,
  Menu,
  X,
  LineChart,
  Scale,
  Award,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [dailyLog, setDailyLog] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "workout", "nutrition", "analytics"
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboardAndLogs = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;

    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const [dashRes, logRes, analyticsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/user/dashboard/${userId}`),
        fetch(`http://localhost:5000/api/log/today/${userId}`),
        fetch(`http://localhost:5000/api/log/analytics/${userId}`),
      ]);

      const dashData = await dashRes.json();
      const logData = await logRes.json();
      const analyticsData = await analyticsRes.json();

      if (!dashRes.ok) {
        setError(dashData.message || "Failed to load dashboard data.");
        setLoading(false);
        return;
      }

      setData(dashData);
      if (logData.success) setDailyLog(logData.log);
      if (analyticsData.success) setAnalytics(analyticsData);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardAndLogs();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Toggle Exercise Check-off
  const handleToggleExercise = async (exerciseName) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;
    const totalExercises = data?.todayWorkout?.exercises?.length || 4;

    setDailyLog((prev) => {
      if (!prev) return prev;
      const exists = prev.completedExercises?.includes(exerciseName);
      const updated = exists
        ? prev.completedExercises.filter((e) => e !== exerciseName)
        : [...(prev.completedExercises || []), exerciseName];
      return { ...prev, completedExercises: updated };
    });

    try {
      const res = await fetch("http://localhost:5000/api/log/toggle-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, exerciseName, totalExercises }),
      });
      const result = await res.json();
      if (result.success) setDailyLog(result.log);
    } catch (err) {
      console.error("Failed to toggle exercise:", err);
    }
  };

  // Toggle Meal Consumed
  const handleToggleMeal = async (mealName) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;
    const totalExercises = data?.todayWorkout?.exercises?.length || 4;

    setDailyLog((prev) => {
      if (!prev) return prev;
      const exists = prev.consumedMeals?.includes(mealName);
      const updated = exists
        ? prev.consumedMeals.filter((m) => m !== mealName)
        : [...(prev.consumedMeals || []), mealName];
      return { ...prev, consumedMeals: updated };
    });

    try {
      const res = await fetch("http://localhost:5000/api/log/toggle-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mealName, totalExercises }),
      });
      const result = await res.json();
      if (result.success) setDailyLog(result.log);
    } catch (err) {
      console.error("Failed to toggle meal:", err);
    }
  };

  // Adjust Water Intake
  const handleAdjustWater = async (amountMl) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;
    const totalExercises = data?.todayWorkout?.exercises?.length || 4;

    try {
      const res = await fetch("http://localhost:5000/api/log/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amountMl, totalExercises }),
      });
      const result = await res.json();
      if (result.success) setDailyLog(result.log);
    } catch (err) {
      console.error("Failed to log water:", err);
    }
  };

  // Log Daily Weight
  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeightInput || Number(newWeightInput) <= 0) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser.id || storedUser._id;

    try {
      const res = await fetch("http://localhost:5000/api/log/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, weight: newWeightInput }),
      });
      const result = await res.json();
      if (result.success) {
        setNewWeightInput("");
        fetchDashboardAndLogs();
      }
    } catch (err) {
      console.error("Failed to log weight:", err);
    }
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

      await fetchDashboardAndLogs();
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

      await fetchDashboardAndLogs();
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
    { id: "analytics", label: "Progress Analytics", icon: LineChart },
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

      {updating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-violet-400" size={32} />
          <p className="text-xs font-semibold text-zinc-300 tracking-wider uppercase">Adapting Engine & Generating Plans...</p>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`h-screen sticky top-0 bg-[#09090c]/95 border-r border-white/[0.06] backdrop-blur-2xl flex flex-col justify-between py-5 z-40 shrink-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64 px-4" : "w-16 px-2 items-center"
        }`}
      >
        <div className="flex flex-col gap-4 w-full">
          {/* Hamburger Toggle */}
          <div className="flex items-center justify-center w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center cursor-pointer rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition ${
                sidebarOpen ? "w-full justify-between px-3 py-2 bg-white/[0.03]" : "w-10 h-10 justify-center"
              }`}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <div className="flex items-center gap-2.5">
                <Menu size={18} className="text-zinc-300" />
                {sidebarOpen && (
                  <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
                    Menu
                  </span>
                )}
              </div>
              {sidebarOpen && <X size={15} className="text-zinc-500 hover:text-white" />}
            </button>
          </div>

          {/* Quick Diet Toggle */}
          {sidebarOpen ? (
            <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
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
            <div className="flex justify-center w-full">
              <button
                onClick={handleToggleDiet}
                disabled={updating}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                  isVeg
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                }`}
                title={`Diet: ${isVeg ? "Vegetarian" : "Non-Vegetarian"}`}
              >
                <span className="text-sm select-none">{isVeg ? "🌱" : "🍗"}</span>
              </button>
            </div>
          )}

          <div className="w-full h-px bg-white/[0.08] my-0.5" />

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5 w-full items-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 rounded-xl transition cursor-pointer relative group ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  } ${sidebarOpen ? "w-full px-3 py-2.5 justify-start" : "w-10 h-10 justify-center"}`}
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

          {/* Target Goal Selector */}
          {sidebarOpen && (
            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] mt-1">
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

        {/* User Badge & Logout */}
        <div className="flex flex-col gap-2.5 w-full pt-3 border-t border-white/[0.06] items-center">
          <div className={`flex items-center gap-2.5 ${sidebarOpen ? "w-full px-1" : "justify-center"}`}>
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

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer relative group ${
              sidebarOpen ? "w-full px-3 py-2 text-xs font-semibold justify-start" : "w-10 h-10 justify-center"
            }`}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-white/[0.06] bg-[#07070b]/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.35)] shrink-0">
              <Activity size={16} className="text-white" />
            </div>

            <span className="text-base font-bold tracking-tight text-white leading-none">
              Kinetic<span className="text-violet-500">OS</span>
            </span>

            <span className="text-zinc-600 font-light text-lg select-none">/</span>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide">
              {activeTab === "overview" && <LayoutDashboard size={13} />}
              {activeTab === "workout" && <Dumbbell size={13} />}
              {activeTab === "nutrition" && <Utensils size={13} />}
              {activeTab === "analytics" && <LineChart size={13} />}
              <span>{navigationItems.find((n) => n.id === activeTab)?.label}</span>
            </div>
          </div>

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
          {/* Top 5 Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider font-semibold">Active Goal</span>
                <Target size={15} className="text-violet-400" />
              </div>
              <p className="text-base font-bold mt-2 text-white truncate">{profile.primaryGoal || "Adaptive Plan"}</p>
              <span className="text-[10px] text-zinc-500 capitalize">{profile.experienceLevel} • {profile.dietaryPreference}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider font-semibold">Target Fuel</span>
                <Flame size={15} className="text-amber-400" />
              </div>
              <p className="text-base font-bold mt-2 text-amber-300">
                {profile.targetCalories || 2000} <span className="text-xs text-zinc-400">kcal</span>
              </p>
              <span className="text-[10px] text-zinc-500">Maint: {profile.maintenanceCalories || 2500} kcal</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider font-semibold">Body Mass Index</span>
                <TrendingUp size={15} className="text-emerald-400" />
              </div>
              <p className="text-base font-bold mt-2 text-white">{profile.bmi || "21.1"}</p>
              <span className="text-[10px] text-zinc-500">{profile.currentWeight || 67} kg → Goal: {profile.targetWeight || 50} kg</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider font-semibold">Hydration</span>
                <Droplets size={15} className="text-blue-400" />
              </div>
              <p className="text-base font-bold mt-2 text-blue-300">
                {dailyLog?.waterMl || 0} <span className="text-[11px] text-zinc-400">/ 3000 ml</span>
              </p>
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => handleAdjustWater(250)}
                  className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold hover:bg-blue-500/30 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={9} /> 250
                </button>
                <button
                  onClick={() => handleAdjustWater(-250)}
                  className="px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 text-[10px] font-bold hover:bg-white/[0.1] flex items-center gap-0.5 cursor-pointer"
                >
                  <Minus size={9} /> 250
                </button>
              </div>
            </div>

            {/* Streak & Habit Metric */}
            {/* 5. Habit Engine & Streak (Combined) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider font-semibold">Habit Engine</span>
                <span className="text-xs">🔥 {analytics?.streak ?? 0} days</span>
              </div>
              <p className="text-base font-bold mt-2 text-purple-300">
                {dailyLog?.habitScore || 0}<span className="text-xs text-zinc-400">/100</span>
              </p>
              <div className="w-full bg-white/[0.08] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyLog?.habitScore || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* ================= TAB 1: TODAY'S OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="rounded-3xl bg-[#101015]/80 border border-white/[0.08] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
                    <Dumbbell size={16} /> Today's Training • {currentDay}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {dailyLog?.completedExercises?.length || 0} / {todayWorkout?.exercises?.length || 0} Done
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{todayWorkout?.focus || "Rest Day"}</h2>

                {todayWorkout?.isRestDay ? (
                  <div className="p-8 text-center text-zinc-500 text-xs bg-black/20 rounded-2xl border border-white/[0.04]">
                    Active recovery day. Focus on foam rolling, hydration, and light walking.
                  </div>
                ) : (
                  <div className="space-y-2.5 mt-4">
                    {todayWorkout?.exercises?.map((ex, i) => {
                      const isCompleted = dailyLog?.completedExercises?.includes(ex.name);
                      return (
                        <div
                          key={i}
                          onClick={() => handleToggleExercise(ex.name)}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer select-none ${
                            isCompleted
                              ? "bg-violet-950/25 border-violet-500/40 opacity-80"
                              : "bg-white/[0.025] border-white/[0.05] hover:border-violet-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className={`p-1 rounded-lg transition ${
                                isCompleted ? "text-violet-400" : "text-zinc-600 hover:text-zinc-400"
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <div>
                              <p className={`text-sm font-semibold transition ${isCompleted ? "line-through text-zinc-400" : "text-zinc-200"}`}>
                                {ex.name}
                              </p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">{ex.formGuidance}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-xs font-mono font-bold text-violet-300">{ex.sets} × {ex.reps}</span>
                            <p className="text-[10px] text-zinc-600">{ex.restSeconds}s rest</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#101015]/80 border border-white/[0.08] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Utensils size={16} /> Today's Nutrition • {currentDay}
                  </div>
                  <span className="text-[10px] bg-white/[0.05] text-zinc-300 border border-white/[0.08] px-2 py-0.5 rounded-full font-mono">
                    {todayDiet?.macros?.macroSplit || "Balanced Split"}
                  </span>
                </div>

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

                <div className="space-y-2.5">
                  {todayDiet?.meals?.map((meal, i) => {
                    const isEaten = dailyLog?.consumedMeals?.includes(meal.mealName);
                    return (
                      <div
                        key={i}
                        onClick={() => handleToggleMeal(meal.mealName)}
                        className={`p-3.5 rounded-xl border transition flex items-start justify-between cursor-pointer select-none ${
                          isEaten
                            ? "bg-amber-950/20 border-amber-500/40 opacity-80"
                            : "bg-white/[0.025] border-white/[0.05] hover:border-amber-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            className={`p-1 mt-0.5 rounded-lg transition ${
                              isEaten ? "text-amber-400" : "text-zinc-600 hover:text-zinc-400"
                            }`}
                          >
                            {isEaten ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold transition ${isEaten ? "line-through text-zinc-400" : "text-white"}`}>
                                {meal.mealName}
                              </span>
                              <span className="text-[10px] font-mono text-amber-400">{meal.calories} kcal</span>
                            </div>
                            <ul className="mt-1 space-y-0.5">
                              {meal.suggestedItems?.map((item, idx) => (
                                <li key={idx} className="text-[11px] text-zinc-400">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 text-right shrink-0 ml-3">
                          {meal.protein}P / {meal.carbs}C / {meal.fats}F
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: FULL 7-DAY WORKOUT ================= */}
          {activeTab === "workout" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">7-Day Progressive Workout Routine</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Tailored for {profile.primaryGoal} ({profile.experienceLevel} level).
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyWorkoutPlan?.schedule?.map((day) => (
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
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: FULL 7-DAY NUTRITION ================= */}
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
                {weeklyDietPlan?.schedule?.map((day) => (
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
                ))}
              </div>
            </div>
          )}

         {/* ================= TAB 4: PROGRESS ANALYTICS & CHARTS ================= */}
{activeTab === "analytics" && (
  <div className="space-y-8">
    {/* Top Summary Cards */}
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/40 via-[#101015] to-[#101015] border border-violet-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-violet-300 font-bold uppercase tracking-wider">Consistency Score</span>
          <Award size={18} className="text-violet-400" />
        </div>
        <h3 className="text-3xl font-extrabold text-white mt-3">{analytics?.weeklyAvgScore || 0}%</h3>
        <p className="text-xs text-zinc-400 mt-1">7-Day Composite Adherence Index</p>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-950/30 via-[#101015] to-[#101015] border border-orange-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-orange-300 font-bold uppercase tracking-wider">Active Streak</span>
          <span className="text-base">🔥</span>
        </div>
        <h3 className="text-3xl font-extrabold text-white mt-3">{analytics?.streak || 1} Days</h3>
        <p className="text-xs text-zinc-400 mt-1">Consecutive days reaching daily targets</p>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-[#101015] to-[#101015] border border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Body Delta</span>
          <Scale size={18} className="text-emerald-400" />
        </div>
        <h3 className="text-3xl font-extrabold text-white mt-3">
          {Math.abs((profile.currentWeight || 67) - (profile.targetWeight || 50))} kg
        </h3>
        <p className="text-xs text-zinc-400 mt-1">Remaining until target weight</p>
      </div>
    </div>

    {/* Interactive Recharts 7-Day Adherence Curve */}
    <div className="p-6 rounded-3xl bg-[#101015]/80 border border-white/[0.08] backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white">7-Day Adherence Velocity</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daily combined score: Workout (50%), Nutrition (35%), Hydration (15%)
          </p>
        </div>
        <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
          Target: 80%+
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics?.weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#121218",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
              }}
              formatter={(value) => [`${value}%`, "Habit Score"]}
            />
            <Area
              type="monotone"
              dataKey="habitScore"
              stroke="#a855f7"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#habitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Weight Logging Card */}
    <div className="p-6 rounded-3xl bg-[#101015]/80 border border-white/[0.08] backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale size={18} className="text-emerald-400" /> Log Daily Weight
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Current: <strong className="text-white">{profile.currentWeight} kg</strong> • BMI:{" "}
            <strong className="text-emerald-400">{profile.bmi}</strong>
          </p>
        </div>

        <form onSubmit={handleLogWeight} className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 66.5"
            value={newWeightInput}
            onChange={(e) => setNewWeightInput(e.target.value)}
            className="w-28 h-10 rounded-xl bg-black/40 border border-white/[0.1] px-3 text-xs text-white outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer"
          >
            Update Weight
          </button>
        </form>
      </div>
    </div>
  </div>
)}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;