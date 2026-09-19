import React from "react";
import { Link } from "react-router-dom";
import { PublicNavbar, PublicFooter } from "../components/PublicNavbar";
import { 
  Zap, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  FileSpreadsheet, 
  ArrowRight,
  Database,
  UserPlus,
  LogIn
} from "lucide-react";

// Update PublicNavbar locally or use this version to include Auth links
export const LandingNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Zap size={18} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">KineticOS</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <Link to="/" className="text-xs font-semibold text-violet-400">Home</Link>
          <Link to="/about" className="text-xs font-medium text-zinc-400 hover:text-white transition">About</Link>
          <Link to="/contact" className="text-xs font-medium text-zinc-400 hover:text-white transition">Contact</Link>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogIn size={13} /> Login
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <UserPlus size={13} /> Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

const HomePage = () => {
  const features = [
    {
      icon: <TrendingUp className="text-violet-400" size={20} />,
      title: "Automated Overload",
      desc: "Eliminate static logs. Working sets dynamically calibrate off historical PRs and compound muscle ratios.",
    },
    {
      icon: <Zap className="text-cyan-400" size={20} />,
      title: "Deload Orchestration",
      desc: "Phase 3 auto-detects fatigue milestones, cutting set volume by 50% and scaling back intensity safely.",
    },
    {
      icon: <Activity className="text-emerald-400" size={20} />,
      title: "Weighted Habit Score",
      desc: "Composite adherence engine grading workouts (50%), nutrition targets (35%), and fluid intake (15%).",
    },
    {
      icon: <FileSpreadsheet className="text-violet-400" size={20} />,
      title: "Instant PDF Audits",
      desc: "One-click export of set logs, progressive overload velocity, and daily nutritional compliance directly in-browser.",
    },
    {
      icon: <Database className="text-amber-400" size={20} />,
      title: "Offline Resiliency",
      desc: "Zero data loss. Live sets auto-persist locally and synchronize to MongoDB when network reconnects.",
    },
    {
      icon: <ShieldCheck className="text-pink-400" size={20} />,
      title: "Fuzzy Match Engine",
      desc: "Intelligently bridges accessory lift aliases to their corresponding parent database histories.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between">
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Landing Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5 pt-8 pb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Adaptive Training Operating System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Stop Guessing Weights. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400">
              Train on Derived Logic.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            KineticOS calculates real-time loads for compound and accessory lifts, detects 
            mesocycle deload thresholds, and unifies workouts with nutrition tracking.
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-900/30 cursor-pointer"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-xs font-semibold transition cursor-pointer"
            >
              Sign In to Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] hover:border-violet-500/30 transition space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-zinc-100">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default HomePage;