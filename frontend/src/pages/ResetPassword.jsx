import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] px-5 text-white">

      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[140px]" />

      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-3xl sm:p-8">

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-[0_0_35px_rgba(139,92,246,0.4)]">
            <LockKeyhole size={25} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Reset Password
          </h1>

          <p className="mt-2 text-xs text-zinc-500">
            Create a new password for your account.
          </p>

        </div>

        <form
          onSubmit={handleResetPassword}
          className="mt-7"
        >

          <div className="mb-5">

            <label className="mb-2 block text-[11px] font-semibold text-zinc-400">
              New Password
            </label>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 focus-within:border-violet-500/60">

              <LockKeyhole
                size={18}
                className="text-zinc-600"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="text-zinc-600 transition hover:text-violet-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          <div className="mb-5">

            <label className="mb-2 block text-[11px] font-semibold text-zinc-400">
              Confirm Password
            </label>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 focus-within:border-violet-500/60">

              <LockKeyhole
                size={18}
                className="text-zinc-600"
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                required
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="text-zinc-600 transition hover:text-violet-400"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {message && (
            <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-center text-xs text-violet-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex h-[54px] w-full items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 pl-5 pr-1.5 text-sm font-semibold shadow-[0_10px_35px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_45px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
          >

            <span>
              {loading
                ? "Updating..."
                : "Update Password"}
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <ArrowRight size={18} />
            </span>

          </button>

        </form>

      </div>
    </div>
  );
};

export default ResetPassword;