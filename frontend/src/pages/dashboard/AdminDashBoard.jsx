import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  MessageSquare,
  ShieldAlert,
  LogOut,
  Server,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Megaphone,
} from "lucide-react";

import MessageReaderModal from "../../components/adminModals/MessageReaderModal";
import CreateTemplateModal from "../../components/adminModals/CreateTemplateModal";
import CreateDietTemplateModal from "../../components/adminModals/CreateDietTemplateModal";
import UserDetailDrawer from "../../components/adminModals/UserDetailDrawer";
import CreateAnnouncementModal from "../../components/adminModals/CreateAnnouncementModal";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 1. All State Hooks
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    onboardedUsers: 0,
    totalInquiries: 0,
    systemHealth: "Optimal",
  });

  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [dietTemplates, setDietTemplates] = useState([]);
  const [showDietModal, setShowDietModal] = useState(false);

  const [inspectingUserId, setInspectingUserId] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // 2. Data Fetching Handlers
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setMetrics(data.stats || { totalUsers: 0, onboardedUsers: 0, totalInquiries: 0, systemHealth: "Optimal" });
        setRecentUsers(Array.isArray(data.recentUsers) ? data.recentUsers : []);
        setRecentMessages(Array.isArray(data.recentMessages) ? data.recentMessages : []);
      } else {
        alert(data.message || "Unauthorized access.");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
      setRecentUsers([]);
      setRecentMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/admin/templates", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const list = data.templates || (Array.isArray(data) ? data : []);

    // 🔍 ADD THIS LOG:
    console.log("Fetched Admin Workout Templates:", list);
    list.forEach((t) => {
      console.log(`Template: "${t.title}" (${t._id})`);
      t.schedule?.forEach((day) => {
        console.log(`  -> ${day.dayName}: ${day.focus} | Exercises:`, day.exercises?.length || 0);
      });
    });

    setTemplates(list);
  } catch (err) {
    console.error("Failed to load workout templates:", err);
    setTemplates([]);
  }
};
  const fetchDietTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/diet-templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.dietTemplates || data.templates || (Array.isArray(data) ? data : []);
      setDietTemplates(list);
    } catch (err) {
      console.error("Failed to load diet templates:", err);
      setDietTemplates([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.announcements || (Array.isArray(data) ? data : []);
      setAnnouncements(list);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setAnnouncements([]);
    }
  };

  // 3. Consolidated Lifecycle Effect
  useEffect(() => {
    fetchAdminData();
    fetchTemplates();
    fetchDietTemplates();
    fetchAnnouncements();
  }, [navigate]);

  // 4. Action Handlers
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  const handleDeleteDietTemplate = async (id) => {
    if (!window.confirm("Delete this diet template?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/diet-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDietTemplates((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete diet template:", err);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      setUpdatingUser(userId);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecentUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (err) {
      console.error("Failed to toggle role:", err);
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);

    if (msg.isRead) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/contact/${msg._id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRecentMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
        );
      }
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredUsers = (recentUsers || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle Block / Suspend User
  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    const actionText = currentBlockedStatus ? "unblock" : "suspend/block";
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRecentUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: data.isBlocked } : u))
        );
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      console.error("Block user error:", err);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL: Are you sure you want to permanently delete this user account?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRecentUsers((prev) => prev.filter((u) => u._id !== userId));
        setMetrics((prev) => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  // Delete Contact Inquiry
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this contact inquiry?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRecentMessages((prev) => prev.filter((m) => m._id !== id));
        setMetrics((prev) => ({ ...prev, totalInquiries: Math.max(0, prev.totalInquiries - 1) }));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      } else {
        alert(data.message || "Failed to delete message");
      }
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  // Toggle Announcement Active State
  const handleToggleAnnouncement = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/announcements/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a._id === id ? data.announcement : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Loading Guard
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-mono text-xs">
        Loading Admin Telemetry...
      </div>
    );
  }

  // 6. JSX Render
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/[0.08] bg-[#09090b]/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              KineticOS <span className="text-violet-400">Admin Control</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500">System Oversight & Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              fetchAdminData();
              fetchTemplates();
              fetchDietTemplates();
              fetchAnnouncements();
            }}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <Link to="/dashboard" className="text-xs text-violet-400 hover:text-violet-300 transition">
            User View
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">Total Registrations</span>
              <Users size={16} className="text-violet-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{metrics.totalUsers}</p>
            <p className="text-[11px] text-zinc-500">Registered platform accounts</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">Onboarded Profiles</span>
              <Activity size={16} className="text-cyan-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{metrics.onboardedUsers}</p>
            <p className="text-[11px] text-zinc-500">Completed biometric setup</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">Contact Inquiries</span>
              <MessageSquare size={16} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{metrics.totalInquiries}</p>
            <p className="text-[11px] text-zinc-500">Stored inquiries pipeline</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">System Status</span>
              <Server size={16} className="text-amber-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {metrics.systemHealth}
            </p>
            <p className="text-[11px] text-zinc-500">MongoDB & Services Live</p>
          </div>
        </div>

        {/* Actionable Data Grid: Users & Inquiries (Scrollable) */}
        <div className="grid lg:grid-cols-2 gap-6 pt-4">
          {/* User Management */}
          <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] flex flex-col h-[480px]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-violet-400" /> User Management
                <span className="text-[11px] font-mono text-zinc-500 font-normal">
                  ({filteredUsers.length})
                </span>
              </h2>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-zinc-500 border-b border-white/[0.06] sticky top-0 bg-[#0f0f15] z-10">
                  <tr>
                    <th className="pb-3 pl-1 font-medium">User</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 pr-1 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() => setInspectingUserId(u._id)}
                        className="hover:bg-white/[0.03] cursor-pointer transition"
                      >
                        <td className="py-3 pl-1">
                          <p className="font-semibold text-white hover:text-violet-400 transition">{u.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{u.email}</p>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                              u.role === "admin"
                                ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                                : "bg-zinc-800/80 text-zinc-400"
                            }`}
                          >
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              u.isBlocked
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : u.isOnboarded
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {u.isBlocked ? "Suspended" : u.isOnboarded ? "Active" : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 pr-1 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRoleToggle(u._id, u.role || "user")}
                              disabled={updatingUser === u._id}
                              className="px-2 py-1 rounded-lg border border-white/[0.08] hover:bg-white/[0.08] text-[10px] text-zinc-300 transition cursor-pointer"
                            >
                              {updatingUser === u._id ? "..." : u.role === "admin" ? "Demote" : "Admin"}
                            </button>
                            <button
                              onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                              className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                                u.isBlocked
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                                  : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-amber-300"
                              }`}
                            >
                              {u.isBlocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Inquiries */}
          <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] flex flex-col h-[480px]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-400" /> Contact Inquiries
                <span className="text-[11px] font-mono text-zinc-500 font-normal">
                  ({(recentMessages || []).length})
                </span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                {(recentMessages || []).filter((m) => !m.isRead).length} Unread
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-zinc-500 border-b border-white/[0.06] sticky top-0 bg-[#0f0f15] z-10">
                  <tr>
                    <th className="pb-3 pl-1 font-medium w-2/5">Sender</th>
                    <th className="pb-3 font-medium w-2/5">Subject</th>
                    <th className="pb-3 pr-1 font-medium text-right w-1/5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {(recentMessages || []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-500">
                        No contact inquiries found.
                      </td>
                    </tr>
                  ) : (
                    recentMessages.map((msg) => {
                      const isUnread = !Boolean(msg.isRead);

                      return (
                        <tr key={msg._id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 pl-1">
                            <div className="flex items-center gap-2">
                              {isUnread ? (
                                <span
                                  className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0"
                                  title="Unread"
                                />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className={`truncate ${isUnread ? "text-white font-semibold" : "text-zinc-400 font-medium"}`}>
                                  {msg.name || "Anonymous Sender"}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-mono truncate">
                                  {msg.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-2">
                            <p className={`truncate max-w-[140px] sm:max-w-[190px] ${isUnread ? "text-zinc-200 font-medium" : "text-zinc-500"}`}>
                              {msg.subject || "No Subject"}
                            </p>
                          </td>
                          <td className="py-3 pr-1 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenMessage(msg)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                                  isUnread
                                    ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold"
                                    : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400"
                                }`}
                              >
                                {isUnread ? "Read" : "View"}
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                title="Delete Inquiry"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Announcement Banners Section */}
        <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone size={16} className="text-violet-400" /> Platform Announcement Broadcasts
              </h2>
              <p className="text-xs text-zinc-500">Live alert banners rendered across all user dashboards</p>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Plus size={14} /> New Broadcast
            </button>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {(!announcements || announcements.length === 0) ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No broadcast alerts configured.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          a.type === "critical"
                            ? "bg-red-500/20 text-red-300"
                            : a.type === "warning"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-violet-500/20 text-violet-300"
                        }`}
                      >
                        {a.type}
                      </span>
                      <h3 className="font-semibold text-xs text-white truncate">{a.title}</h3>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{a.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleAnnouncement(a._id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                        a.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {a.isActive ? "Live" : "Inactive"}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(a._id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workout Templates Section */}
        <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Platform Workout Templates
              </h2>
              <p className="text-xs text-zinc-500">Preset routines deployed across user onboarding</p>
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Plus size={14} /> New Template
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {(!templates || templates.length === 0) ? (
              <p className="text-xs text-zinc-500 col-span-full py-4 text-center">
                No custom templates configured. System is currently utilizing rule engine defaults.
              </p>
            ) : (
              templates.map((t) => (
                <div
                  key={t._id}
                  className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-white">{t.title}</h3>
                    <button
                      onClick={() => handleDeleteTemplate(t._id)}
                      className="text-zinc-500 hover:text-red-400 text-xs transition cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/20">
                      {t.targetGoal}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] capitalize">
                      {t.experienceLevel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Diet Templates Section */}
        <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Platform Diet Templates
              </h2>
              <p className="text-xs text-zinc-500">Preset macros & nutrition blueprints</p>
            </div>
            <button
              onClick={() => setShowDietModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Plus size={14} /> New Diet Plan
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {(!dietTemplates || dietTemplates.length === 0) ? (
              <p className="text-xs text-zinc-500 col-span-full py-4 text-center">
                No custom diet templates added yet.
              </p>
            ) : (
              dietTemplates.map((d) => (
                <div key={d._id} className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-white">{d.title}</h3>
                    <button
                      onClick={() => handleDeleteDietTemplate(d._id)}
                      className="text-zinc-500 hover:text-red-400 text-xs transition cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      {d.dailyCalories || d.caloriesTarget || 2000} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px]">
                      {d.targetGoal || d.goal}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono pt-1">
                    P: {d.macros?.proteinGrams ?? d.macros?.protein ?? 0}g · C: {d.macros?.carbsGrams ?? d.macros?.carbs ?? 0}g · F: {d.macros?.fatsGrams ?? d.macros?.fats ?? 0}g
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modals & Slide-Over Drawers */}
      <MessageReaderModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onReplySuccess={(updatedMsg) => {
          setRecentMessages((prev) =>
            prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
          );
        }}
      />

      <CreateTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSaveSuccess={(newCreatedTemplate) => {
          setTemplates((prev) => [newCreatedTemplate, ...prev]);
        }}
      />

      <CreateDietTemplateModal
        isOpen={showDietModal}
        onClose={() => setShowDietModal(false)}
        onSaveSuccess={(newPlan) => setDietTemplates((prev) => [newPlan, ...prev])}
      />

      <UserDetailDrawer
        userId={inspectingUserId}
        onClose={() => setInspectingUserId(null)}
      />

      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onCreated={(newA) => setAnnouncements((prev) => [newA, ...prev])}
      />
    </div>
  );
};

export default AdminDashboard;