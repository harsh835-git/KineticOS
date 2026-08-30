import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Activity,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Flame,
  HeartPulse,
  LockKeyhole,
  Mail,
  User,
  Dumbbell,
  Sparkles,
  Trophy,
  Watch,
  Zap,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // UI Status States (Fixed: added missing states)
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= GOOGLE REGISTRATION / LOGIN =================
  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const userInfo = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      ).then((res) => res.json());

      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: tokenResponse.access_token,
          email: userInfo.email,
          name: userInfo.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google authentication failed");
        setLoading(false);
        return;
      }
      if (!data.isNewUser) {
       setError("This Google email is already registered. Please login instead.");
       setLoading(false);
         return; // Stops here, doesn't redirect
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage(data.message || "Signed in successfully!");

      // If user already completed onboarding, go straight to dashboard
      setTimeout(() => {
        if (data.user?.isOnboarded) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }, 1200);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const registerWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google Sign-Up Failed"),
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= STANDARD EMAIL/PASSWORD REGISTRATION =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      // If already registered (409) or bad request (400)
      if (!res.ok) {
        setError(data.message || "Email is already registered. Please log in.");
        setLoading(false);
        return; // Halt execution so navigation doesn't trigger
      }

      // Successful registration:
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Account created successfully! Redirecting...");

      setTimeout(() => {
        navigate("/onboarding");
      }, 1500);
    } catch (err) {
      console.error("Register Error:", err);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050507] text-white relative">
      {/* ================= BACKGROUND ================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[150px]" />
        <div className="absolute top-[30%] -right-48 w-[550px] h-[550px] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute -bottom-60 left-[35%] w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="relative z-20 max-w-[1450px] mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.45)]">
            <Activity size={23} strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Kinetic<span className="text-violet-500">OS</span>
            </h2>
            <p className="text-[9px] uppercase tracking-[2px] text-zinc-500">
              Move better. Live smarter.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-violet-500/30 bg-white/[0.03] backdrop-blur-xl text-sm text-zinc-200 hover:bg-violet-500/10 hover:border-violet-400/60 transition-all duration-300"
        >
          Login
          <ArrowRight size={16} />
        </button>
      </nav>

      {/* ================= MAIN ================= */}
      <main className="relative z-10 min-h-[calc(100vh-100px)] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-20">
          {/* ================= LEFT ================= */}
          <section className="hidden lg:block mt-20">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] text-violet-300 text-[10px] font-bold tracking-[1.8px]">
              <Sparkles size={13} />
              AI-POWERED FITNESS
            </div>

            <h1 className="mt-7 text-6xl xl:text-7xl font-extrabold tracking-[-4px] leading-[0.98]">
              Your body.
              <br />
              <span className="bg-gradient-to-r from-white via-violet-300 to-violet-600 bg-clip-text text-transparent">
                Your evolution.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-zinc-500 text-[15px] leading-7">
              KineticOS adapts to your body, your goals, and your lifestyle to
              create a fitness journey that evolves with you.
            </p>

            <div className="mt-9 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Adaptive Training</h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    Workouts that adapt to your performance.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Smart Progress</h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    See your progress and performance in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Watch size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Connected Fitness</h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    Your workouts, devices and data in one place.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= REGISTER CARD ================= */}
          <section className="relative w-full max-w-[480px] mx-auto rounded-[28px] border border-white/[0.10] bg-white/[0.055] backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.65)] p-6 sm:p-8 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-violet-600/20 blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

            <div className="relative z-10">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.4)]">
                  <Activity size={27} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight mt-5">
                  Create your account
                </h2>
                <p className="text-xs text-zinc-500 mt-2">
                  Start your personalized fitness journey.
                </p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-black/30 border border-white/[0.04] mt-7 mb-7">
                <button
                  type="button"
                  className="py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-medium shadow-lg shadow-violet-900/30"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="py-2.5 rounded-lg text-sm text-zinc-600 hover:text-zinc-300 transition"
                >
                  Login
                </button>
              </div>

              {/* Feedback Notifications */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              {message && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <p className="text-xs text-emerald-400">{message}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3 h-13 px-4 rounded-xl bg-black/25 border border-white/[0.08] focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/[0.06] transition-all">
                    <User size={18} className="text-zinc-600" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className="w-full bg-transparent outline-none text-sm text-white placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 h-13 px-4 rounded-xl bg-black/25 border border-white/[0.08] focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/[0.06] transition-all">
                    <Mail size={18} className="text-zinc-600" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-transparent outline-none text-sm text-white placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
                    Password
                  </label>
                  <div className="flex items-center gap-3 h-13 px-4 rounded-xl bg-black/25 border border-white/[0.08] focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/[0.06] transition-all">
                    <LockKeyhole size={18} className="text-zinc-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                      className="w-full bg-transparent outline-none text-sm text-white placeholder:text-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-600 hover:text-violet-400 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[10px] leading-5 text-zinc-600">
                    I agree to the{" "}
                    <a href="#" className="text-violet-400 hover:text-violet-300">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-violet-400 hover:text-violet-300">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-[54px] flex items-center justify-between pl-5 pr-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 font-semibold text-sm shadow-[0_10px_35px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_45px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Creating Account..." : "Create Account"}</span>
                  <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-white/20 transition">
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-0.5 transition"
                    />
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="h-px flex-1 bg-white/[0.07]" />
                <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
                  or
                </span>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              {/* Social Login */}
              <button
                type="button"
                onClick={() => registerWithGoogle()}
                disabled={loading}
                className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] hover:border-violet-500/30 text-sm text-zinc-400 transition flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                  G
                </span>
                Continue with Google
              </button>

              {/* Bottom */}
              <p className="text-center text-[11px] text-zinc-600 mt-6">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-violet-400 hover:text-violet-300 font-semibold transition"
                >
                  Sign in
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ================= BOTTOM FEATURE STRIP ================= */}
      <div className="relative z-10 hidden lg:grid max-w-5xl mx-auto grid-cols-4 mt-8 mb-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl px-5 py-5">
        {[
          { icon: Zap, title: "AI Powered", subtitle: "Fitness Plans" },
          { icon: HeartPulse, title: "Real-time", subtitle: "Progress Tracking" },
          { icon: Watch, title: "Wearable", subtitle: "Device Sync" },
          { icon: Trophy, title: "Achieve", subtitle: "Your Best Self" },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`flex items-center justify-center gap-3 ${
                index !== 3 ? "border-r border-white/[0.07]" : ""
              }`}
            >
              <Icon size={21} className="text-violet-400" />
              <div>
                <p className="text-[11px] font-semibold">{item.title}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Register;