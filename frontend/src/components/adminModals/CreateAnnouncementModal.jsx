import React, { useState } from "react";
import { X, Megaphone, Send } from "lucide-react";

const CreateAnnouncementModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, message, type }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onCreated(data.announcement);
        setTitle("");
        setMessage("");
        setType("info");
        onClose();
      } else {
        alert(data.message || "Failed to create announcement.");
      }
    } catch (err) {
      console.error(err);
      alert("Error broadcasting announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f0f15] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone size={16} className="text-violet-400" /> Broadcast Announcement
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono mb-1">Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Maintenance"
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-mono mb-1">Severity / Urgency</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white outline-none focus:border-violet-500"
            >
              <option value="info" className="bg-[#0f0f15]">Info (Blue / Violet)</option>
              <option value="warning" className="bg-[#0f0f15]">Warning (Amber)</option>
              <option value="critical" className="bg-[#0f0f15]">Critical Alert (Red)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono mb-1">Message Body</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context or updates for users..."
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold"
            >
              <Send size={13} /> {submitting ? "Publishing..." : "Publish Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;