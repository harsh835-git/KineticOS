import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  Zap,
  HeartPulse,
  Watch,
  Trophy,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../components/publicModals/ForgotPasswordModal";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.isOnboarded) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      console.error(error);

      alert("Unable to connect to server.");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotMessage("Please enter your email address.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail.trim().toLowerCase(),
          }),
        },
      );

      const data = await response.json();

      setForgotMessage(data.message);
    } catch (error) {
      console.error(error);

      setForgotMessage("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // Fetch Google profile using the access token
      const userInfo = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      ).then((res) => res.json());

      // Send payload to your backend
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
        alert(data.message || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user?.isOnboarded) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => alert("Google Login Failed"),
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[#050507] text-white relative">
      {/* ================= BACKGROUND ================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Violet glow */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[150px]" />

        <div className="absolute top-[30%] -right-48 w-[550px] h-[550px] rounded-full bg-purple-600/20 blur-[150px]" />

        <div className="absolute -bottom-60 left-[35%] w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[160px]" />

        {/* Grid */}
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

      <nav className="relative z-20 max-w-[1450px] mx-auto px-6 lg:px-10 py-6 flex items-center justify-between sticky top-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div
            className="
            w-11 h-11
            rounded-xl
            bg-gradient-to-br
            from-violet-500
            to-purple-700
            flex items-center justify-center
            shadow-[0_0_30px_rgba(139,92,246,0.45)]
          "
          >
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
        </Link>

        {/* Register */}
        <Link
          to="/register"
          className="
            flex items-center gap-2
            px-5 py-2.5
            rounded-full
            border border-violet-500/30
            bg-white/[0.03]
            backdrop-blur-xl
            text-sm
            text-zinc-200
            hover:bg-violet-500/10
            hover:border-violet-400/60
            transition-all duration-300
          "
        >
          Create Account
          <ArrowRight size={16} />
        </Link>
      </nav>

      {/* ================= MAIN ================= */}

      <main className="relative z-10 min-h-[calc(100vh-100px)] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-16 items-center">
          {/* ================= LEFT ================= */}

          <section className="hidden lg:block">
            {/* Badge */}
            <div
              className="
              inline-flex items-center gap-2
              px-3 py-2
              rounded-full
              border border-violet-500/20
              bg-violet-500/[0.07]
              text-violet-300
              text-[10px]
              font-bold
              tracking-[1.8px]
            "
            >
              <Sparkles size={13} />
              WELCOME BACK
            </div>

            {/* Heading */}
            <h1
              className="
              mt-7
              text-6xl xl:text-7xl
              font-extrabold
              tracking-[-4px]
              leading-[0.98]
            "
            >
              Keep moving.
              <br />
              <span
                className="
                bg-gradient-to-r
                from-white
                via-violet-300
                to-violet-600
                bg-clip-text
                text-transparent
              "
              >
                Keep evolving.
              </span>
            </h1>

            <p
              className="
              mt-7
              max-w-lg
              text-zinc-500
              text-[15px]
              leading-7
            "
            >
              Your personalized fitness journey is waiting. Pick up where you
              left off and keep becoming your strongest self.
            </p>

            {/* Features */}
            <div className="mt-9 space-y-3">
              <div
                className="
                flex items-center gap-4
                p-4
                rounded-2xl
                border border-white/[0.06]
                bg-white/[0.025]
                backdrop-blur-xl
              "
              >
                <div
                  className="
                  w-11 h-11
                  shrink-0
                  rounded-xl
                  bg-violet-500/10
                  flex items-center justify-center
                  text-violet-400
                "
                >
                  <Zap size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Adaptive Training</h3>

                  <p className="text-xs text-zinc-600 mt-1">
                    Workouts that adapt to your performance.
                  </p>
                </div>
              </div>

              <div
                className="
                flex items-center gap-4
                p-4
                rounded-2xl
                border border-white/[0.06]
                bg-white/[0.025]
                backdrop-blur-xl
              "
              >
                <div
                  className="
                  w-11 h-11
                  shrink-0
                  rounded-xl
                  bg-violet-500/10
                  flex items-center justify-center
                  text-violet-400
                "
                >
                  <HeartPulse size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Smart Progress</h3>

                  <p className="text-xs text-zinc-600 mt-1">
                    See your progress and performance in real time.
                  </p>
                </div>
              </div>

              <div
                className="
                flex items-center gap-4
                p-4
                rounded-2xl
                border border-white/[0.06]
                bg-white/[0.025]
                backdrop-blur-xl
              "
              >
                <div
                  className="
                  w-11 h-11
                  shrink-0
                  rounded-xl
                  bg-violet-500/10
                  flex items-center justify-center
                  text-violet-400
                "
                >
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

          {/* ================= LOGIN CARD ================= */}

          <section
            className="
            relative
            w-full
            max-w-[480px]
            mx-auto
            rounded-[28px]
            border border-white/[0.10]
            bg-white/[0.055]
            backdrop-blur-3xl
            shadow-[0_30px_100px_rgba(0,0,0,0.65)]
            p-6 sm:p-8
            overflow-hidden
          "
          >
            {/* Glow */}
            <div
              className="
              absolute
              -top-32
              -right-32
              w-72
              h-72
              rounded-full
              bg-violet-600/20
              blur-[100px]
              pointer-events-none
            "
            />

            {/* Top shine */}
            <div
              className="
              absolute top-0 left-10 right-10
              h-px
              bg-gradient-to-r
              from-transparent
              via-violet-400/50
              to-transparent
            "
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center">
                <div
                  className="
                  mx-auto
                  w-14 h-14
                  rounded-2xl
                  bg-gradient-to-br
                  from-violet-500
                  to-purple-700
                  flex items-center justify-center
                  shadow-[0_0_35px_rgba(139,92,246,0.4)]
                "
                >
                  <Activity size={27} />
                </div>

                <h2
                  className="
                  text-2xl
                  font-bold
                  tracking-tight
                  mt-5
                "
                >
                  Welcome back
                </h2>

                <p
                  className="
                  text-xs
                  text-zinc-500
                  mt-2
                "
                >
                  Sign in to continue your fitness journey.
                </p>
              </div>

              {/* Tabs */}
              <div
                className="
                grid grid-cols-2
                p-1
                rounded-xl
                bg-black/30
                border border-white/[0.04]
                mt-7
                mb-7
              "
              >
                <button
                  className="
                  py-2.5
                  rounded-lg
                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600
                  text-sm
                  font-medium
                  shadow-lg
                  shadow-violet-900/30
                "
                >
                  Login
                </button>

                <Link
                  to="/register"
                  className="
                    flex items-center
                    justify-center
                    py-2.5
                    rounded-lg
                    text-sm
                    text-zinc-600
                    hover:text-zinc-300
                    transition
                  "
                >
                  Register
                </Link>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-5">
                  <label
                    className="
                    block
                    text-[11px]
                    font-semibold
                    text-zinc-400
                    mb-2
                  "
                  >
                    Email Address
                  </label>

                  <div
                    className="
                    flex items-center gap-3
                    h-13
                    px-4
                    rounded-xl
                    bg-black/25
                    border border-white/[0.08]
                    focus-within:border-violet-500/60
                    focus-within:ring-4
                    focus-within:ring-violet-500/[0.06]
                    transition-all
                  "
                  >
                    <Mail size={18} className="text-zinc-600" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="
                        w-full
                        bg-transparent
                        outline-none
                        text-sm
                        text-white
                        placeholder:text-zinc-700
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className="
                      text-[11px]
                      font-semibold
                      text-zinc-400
                    "
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowForgotModal(true);
                        setForgotMessage("");
                        setForgotEmail("");
                      }}
                      className="
text-[10px]
text-violet-400
hover:text-violet-300
transition
cursor-pointer
relative
z-20
"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div
                    className="
                    flex items-center gap-3
                    h-13
                    px-4
                    rounded-xl
                    bg-black/25
                    border border-white/[0.08]
                    focus-within:border-violet-500/60
                    focus-within:ring-4
                    focus-within:ring-violet-500/[0.06]
                    transition-all
                  "
                  >
                    <LockKeyhole size={18} className="text-zinc-600" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="
                        w-full
                        bg-transparent
                        outline-none
                        text-sm
                        text-white
                        placeholder:text-zinc-700
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        text-zinc-600
                        hover:text-violet-400
                        transition
                      "
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember */}
                <div
                  className="
                  flex items-center
                  justify-between
                  mt-5
                  mb-6
                "
                >
                  <label
                    className="
                    flex items-center
                    gap-2
                    cursor-pointer
                  "
                  >
                    <input
                      type="checkbox"
                      className="
                        accent-violet-600
                        cursor-pointer
                      "
                    />

                    <span
                      className="
                      text-[10px]
                      text-zinc-600
                    "
                    >
                      Remember me
                    </span>
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="
                    group
                    w-full
                    h-[54px]
                    flex items-center
                    justify-between
                    pl-5 pr-1.5
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    via-purple-600
                    to-violet-600
                    font-semibold
                    text-sm
                    shadow-[0_10px_35px_rgba(124,58,237,0.3)]
                    hover:shadow-[0_15px_45px_rgba(124,58,237,0.5)]
                    hover:-translate-y-0.5
                    transition-all duration-300
                  "
                >
                  <span>Sign In</span>

                  <span
                    className="
                    w-10 h-10
                    rounded-lg
                    bg-white/15
                    flex items-center
                    justify-center
                    group-hover:bg-white/20
                    transition
                  "
                  >
                    <ArrowRight
                      size={18}
                      className="
                        group-hover:translate-x-0.5
                        transition
                      "
                    />
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div
                className="
                flex items-center
                gap-3
                my-6
              "
              >
                <div className="h-px flex-1 bg-white/[0.07]" />

                <span
                  className="
                  text-[9px]
                  text-zinc-700
                  uppercase
                  tracking-wider
                "
                >
                  or
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              {/* Social Login */}
              <button
                onClick={() => loginWithGoogle()}
                className="
                w-full
                h-12
                rounded-xl
                border border-white/[0.08]
                bg-white/[0.025]
                hover:bg-white/[0.05]
                hover:border-violet-500/30
                text-sm
                text-zinc-400
                transition
                flex items-center
                justify-center
                gap-3
              "
              >
                <span
                  className="
                  w-6 h-6
                  rounded-full
                  bg-white
                  text-black
                  flex items-center
                  justify-center
                  text-xs
                  font-bold
                "
                >
                  G
                </span>
                Continue with Google
              </button>

              {/* Bottom */}
              <p
                className="
                text-center
                text-[11px]
                text-zinc-600
                mt-6
              "
              >
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="
                    text-violet-400
                    hover:text-violet-300
                    font-semibold
                    transition
                  "
                >
                  Create one
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ================= BOTTOM ================= */}

      <div
        className="
        relative z-10
        hidden lg:flex
        max-w-4xl
        mx-auto
        items-center
        justify-center
        gap-10
        pb-8
      "
      >
        <div className="flex items-center gap-2 text-zinc-700">
          <Zap size={16} className="text-violet-500" />
          <span className="text-[10px]">AI Powered</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-700">
          <HeartPulse size={16} className="text-violet-500" />
          <span className="text-[10px]">Smart Tracking</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-700">
          <Watch size={16} className="text-violet-500" />
          <span className="text-[10px]">Device Sync</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-700">
          <Trophy size={16} className="text-violet-500" />
          <span className="text-[10px]">Personal Goals</span>
        </div>
      </div>
      {showForgotModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotModal(false)}
          email={forgotEmail}
          setEmail={setForgotEmail}
          onSubmit={handleForgotPassword}
          message={forgotMessage}
          loading={forgotLoading}
        />
      )}
    </div>
  );
};

export default Login;
