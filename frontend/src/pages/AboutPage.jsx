import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PublicNavbar, PublicFooter } from "../components/PublicNavbar";
import { Layers, Activity, Cpu, ShieldCheck, Zap, ArrowRight, Code2, Database, Sliders } from "lucide-react";

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState("engine");

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-12">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400 font-semibold px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
            System Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Absolute Progression</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            KineticOS isn’t a passive digital logbook. It’s an active algorithmic training OS designed to eliminate guesswork through data-backed periodization.
          </p>
        </div>

        {/* Interactive Architecture Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-white/[0.08] pb-6">
          <button
            onClick={() => setActiveTab("engine")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "engine"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950/50"
                : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
            }`}
          >
            <Cpu size={15} /> Load Calculation Engine
          </button>
          <button
            onClick={() => setActiveTab("phases")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "phases"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950/50"
                : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
            }`}
          >
            <Layers size={15} /> 8-Week Mesocycles
          </button>
          <button
            onClick={() => setActiveTab("adherence")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "adherence"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950/50"
                : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
            }`}
          >
            <Activity size={15} /> Habit Scoring Matrix
          </button>
        </div>

        {/* Dynamic Tab Content Display */}
        <div className="min-h-[280px]">
          {activeTab === "engine" && (
            <div className="grid sm:grid-cols-2 gap-6 items-center animate-fadeIn">
              <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.08] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                  <Sliders size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Hierarchical Fallback & Fuzzy Match</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When logging lifts, KineticOS first checks verified 1RM PR records. If unavailable, it queries past session histories using a fuzzy string match engine. For brand new accessory movements, the system scales workloads automatically off parent compound ratios.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.08] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Database size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Zero-Latency MongoDB Sync</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every working set, repetition metric, and nutritional intake point is stored locally with background batch synchronization, preventing any data loss during live workout tracking sessions.
                </p>
              </div>
            </div>
          )}

          {activeTab === "phases" && (
            <div className="grid sm:grid-cols-3 gap-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.08] space-y-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">Phase 1</span>
                <h4 className="text-sm font-bold text-white">Base Accumulation</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  High-volume neuromuscular adaptation focused on building work capacity across core hypertrophy patterns.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.08] space-y-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Phase 2</span>
                <h4 className="text-sm font-bold text-white">Overload Intensification</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dynamic +2.5 kg load escalation triggered automatically upon successful set completion thresholds.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.08] space-y-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Phase 3</span>
                <h4 className="text-sm font-bold text-white">Active Deload</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Systemic fatigue detection that automatically reduces set volume by 50% to optimize recovery joints.
                </p>
              </div>
            </div>
          )}

          {activeTab === "adherence" && (
            <div className="p-8 rounded-3xl bg-[#0f0f15] border border-white/[0.08] max-w-2xl mx-auto space-y-6 animate-fadeIn">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Composite 100-Point Habit Index</h3>
                <p className="text-xs text-zinc-400">Daily score calculated precisely across three core pillars:</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1">
                  <p className="text-lg font-extrabold text-emerald-400 font-mono">50%</p>
                  <p className="text-[11px] text-zinc-300 font-medium">Workout Completion</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1">
                  <p className="text-lg font-extrabold text-violet-400 font-mono">35%</p>
                  <p className="text-[11px] text-zinc-300 font-medium">Meal Adherence</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1">
                  <p className="text-lg font-extrabold text-cyan-400 font-mono">15%</p>
                  <p className="text-[11px] text-zinc-300 font-medium">Hydration Targets</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-950/40 via-[#0f0f15] to-indigo-950/40 border border-violet-500/20 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to experience data-driven training?</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Step inside the active dashboard or register your account to start your first mesocycle block.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-950/50"
            >
              Get Started Now <ArrowRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-xs font-semibold transition cursor-pointer"
            >
              Contact Developer
            </Link>
          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
};

export default AboutPage; // Note: Ensure export default AboutPage is used correctly