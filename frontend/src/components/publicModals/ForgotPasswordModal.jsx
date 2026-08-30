import React, { useState } from "react";
import {
  Mail,
  X,
  ArrowRight,
  Loader2,
  KeyRound,
  LockKeyhole,
} from "lucide-react";

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1 = Send OTP, 2 = Verify OTP & Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send verification code");
        return;
      }

      setMessage(data.message);
      setStep(2); // Switch to OTP & Password screen
    } catch (err) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Code & Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid or expired verification code");
        return;
      }

      setMessage(data.message);

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[28px] border border-white/[0.10] bg-[#111116] p-6 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="relative z-10">
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-[0_0_35px_rgba(139,92,246,0.35)]">
            {step === 1 ? <Mail size={25} /> : <KeyRound size={25} />}
          </div>

          {/* Heading */}
          <div className="mt-5 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {step === 1 ? "Forgot Password?" : "Verify & Reset"}
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {step === 1
                ? "Enter your registered email address and we'll send you a 6-digit verification code."
                : `Enter the code sent to ${email} and create your new password.`}
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1 FORM */
            <form onSubmit={handleSendOtp} className="mt-7">
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-zinc-400">
                  Email Address
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 transition-all focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/[0.06]">
                  <Mail size={18} className="text-zinc-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {message && (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                  <p className="text-xs text-green-400">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-6 flex h-[54px] w-full items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 pl-5 pr-1.5 text-sm font-semibold shadow-[0_10px_35px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_45px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <span>
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 transition group-hover:bg-white/20">
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-0.5"
                    />
                  )}
                </span>
              </button>
            </form>
          ) : (
            /* STEP 2 FORM */
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-400">
                  6-Digit Verification Code
                </label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 focus-within:border-violet-500/60">
                  <KeyRound size={18} className="text-zinc-600" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full bg-transparent font-mono text-sm tracking-widest text-white outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-400">
                  New Password
                </label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 focus-within:border-violet-500/60">
                  <LockKeyhole size={18} className="text-zinc-600" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-400">
                  Confirm Password
                </label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 focus-within:border-violet-500/60">
                  <LockKeyhole size={18} className="text-zinc-600" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2.5">
                  <p className="text-xs text-green-400">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-4 flex h-[50px] w-full items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 pl-5 pr-1.5 text-sm font-semibold shadow-[0_10px_35px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_45px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? "Updating..." : "Reset Password"}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 transition group-hover:bg-white/20">
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-0.5"
                    />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setStep(1);
                }}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition mt-2 cursor-pointer"
              >
                ← Change Email / Resend Code
              </button>
            </form>
          )}

          {/* Bottom */}
          <p className="mt-6 text-center text-[10px] leading-5 text-zinc-600">
            If the email is registered with KineticOS, you will receive a
            verification code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
