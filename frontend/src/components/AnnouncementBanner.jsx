import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const AnnouncementBanner = () => {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);

// Inside src/components/AnnouncementBanner.jsx
useEffect(() => {
  const fetchActiveBanner = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Don't fetch if user isn't logged in yet

      const res = await fetch("http://localhost:5000/api/announcements/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.announcement) {
        const dismissedId = localStorage.getItem("dismissed_announcement");
        if (dismissedId !== data.announcement._id) {
          setBanner(data.announcement);
        }
      }
    } catch (err) {
      console.error("Failed to load platform banner:", err);
    }
  };

  fetchActiveBanner();
}, []);
  if (!banner || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem("dismissed_announcement", banner._id);
    setDismissed(true);
  };

  const colorStyles = {
    info: "bg-violet-950/40 border-violet-500/30 text-violet-200",
    warning: "bg-amber-950/40 border-amber-500/30 text-amber-200",
    critical: "bg-red-950/40 border-red-500/30 text-red-200",
  }[banner.type || "info"];

  const iconMap = {
    info: <Info size={16} className="text-violet-400 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
    critical: <AlertCircle size={16} className="text-red-400 shrink-0" />,
  };

  return (
    <div className={`w-full border-b px-4 py-2 text-xs flex items-center justify-between backdrop-blur-md transition ${colorStyles}`}>
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        {iconMap[banner.type || "info"]}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold tracking-tight">{banner.title}:</span>
          <span className="opacity-90">{banner.message}</span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/[0.06] transition cursor-pointer"
        title="Dismiss alert"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBanner;