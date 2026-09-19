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
} from "lucide-react";

import MessageReaderModal from "../../components/adminModals/MessageReaderModal";
import CreateTemplateModal from "../../components/adminModals/CreateTemplateModal";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    onboardedUsers: 0,
    totalInquiries: 0,
    systemHealth: "Optimal",
  });

  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    targetGoal: "Muscle Gain",
    experienceLevel: "beginner",
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setMetrics(data.stats);
        setRecentUsers(data.recentUsers);
        setRecentMessages(data.recentMessages);
      } else {
        alert(data.message || "Unauthorized access.");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
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
      if (data.success) setTemplates(data.templates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchTemplates();
  }, [navigate]);

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTemplate),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates([data.template, ...templates]);
        setShowTemplateModal(false);
        setNewTemplate({
          title: "",
          targetGoal: "Muscle Gain",
          experienceLevel: "beginner",
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        setTemplates(templates.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredUsers = recentUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-mono text-xs">
        Loading Admin Telemetry...
      </div>
    );
  }

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
            onClick={fetchAdminData}
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

        {/* Actionable Data Grid */}
        <div className="grid lg:grid-cols-2 gap-6 pt-4">
          {/* User Management */}
          <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-violet-400" /> User Management
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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500 border-b border-white/[0.06]">
                  <tr>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.02]">
                      <td className="py-3">
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-zinc-500">{u.email}</p>
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
                            u.isOnboarded
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {u.isOnboarded ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRoleToggle(u._id, u.role || "user")}
                          disabled={updatingUser === u._id}
                          className="px-2.5 py-1 rounded-lg border border-white/[0.08] hover:bg-white/[0.08] text-[11px] text-zinc-300 transition cursor-pointer"
                        >
                          {updatingUser === u._id
                            ? "..."
                            : u.role === "admin"
                            ? "Demote"
                            : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Inquiries */}
          <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.06] space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" /> Contact Inquiries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500 border-b border-white/[0.06]">
                  <tr>
                    <th className="pb-3 font-medium">Sender</th>
                    <th className="pb-3 font-medium">Subject</th>
                    <th className="pb-3 font-medium text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {recentMessages.map((msg) => (
                    <tr key={msg._id} className="hover:bg-white/[0.02]">
                      <td className="py-3">
                        <p className="font-semibold text-white">{msg.name}</p>
                        <p className="text-[10px] text-zinc-500">{msg.email}</p>
                      </td>
                      <td className="py-3 text-zinc-400 truncate max-w-[140px]">
                        {msg.subject || "No Subject"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-[11px] transition cursor-pointer"
                        >
                          Read
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Workout Templates Management Section */}
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
            {templates.length === 0 ? (
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
      </main>

      {/* Message Reader Modal */}
      <MessageReaderModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        newTemplate={newTemplate}
        setNewTemplate={setNewTemplate}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};

export default AdminDashboard;