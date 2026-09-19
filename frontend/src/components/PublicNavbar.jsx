import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Dumbbell, ArrowRight ,Activity} from "lucide-react";

export const PublicNavbar = () => {
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Activity size={23} strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">KineticOS</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-5">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs font-medium transition ${
                  location.pathname === item.path
                    ? "text-violet-400 font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            Dashboard <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const PublicFooter = () => (
  <footer className="border-t border-white/[0.08] bg-[#09090b] py-8 text-zinc-500 text-xs">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="font-bold text-zinc-300">KineticOS</span>
        <span>• Adaptive Load & Performance Architecture</span>
      </div>
      <div className="flex items-center gap-4">
        <span>© {new Date().getFullYear()} KineticOS. All rights reserved.</span>
        <span className="text-zinc-400 font-medium">Developed by <strong className="text-zinc-200"> Harsh Soni</strong></span>
      </div>
    </div>
  </footer>
);