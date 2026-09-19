import React, { useState } from "react";
import { X, Send, Mail, CheckCircle2 } from "lucide-react";

const MessageReaderModal = ({ message, onClose, onReplySuccess }) => {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!message) return null;

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/contact/${message._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replyText }),
      });

      // Guard against non-JSON (like HTML 404/500 errors)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setSentSuccess(true);
        if (onReplySuccess) onReplySuccess(data.updatedMessage);
        setTimeout(() => {
          setSentSuccess(false);
          setReplyText("");
          onClose();
        }, 1200);
      } else {
        alert(data.message || "Failed to dispatch email");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error sending reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0f0f15] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
              Inquiry
            </span>
            <h2 className="text-base font-bold text-white mt-1">{message.subject || "No Subject"}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 bg-black/40 border border-white/[0.05] rounded-2xl flex items-center justify-between text-xs font-mono">
          <div>
            <p className="text-white font-semibold">{message.name}</p>
            <p className="text-zinc-500 text-[11px]">{message.email}</p>
          </div>
          <span className="text-[10px] text-zinc-600">
            {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : ""}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Query Content</p>
          <div className="p-4 bg-black/20 border border-white/[0.04] rounded-2xl text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {message.message}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <label className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <Mail size={13} className="text-violet-400" /> Send Direct Email Reply
          </label>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply directly to ${message.email}...`}
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 resize-none transition"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] text-zinc-400 text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim() || sentSuccess}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer"
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-300" /> Dispatched
                </>
              ) : (
                <>
                  <Send size={13} /> {sending ? "Sending..." : "Dispatch Reply"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageReaderModal;