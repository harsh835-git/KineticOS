import React from "react";
import { X } from "lucide-react";

const MessageReaderModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-white/[0.1] rounded-2xl w-full max-w-md p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div>
          <h3 className="text-base font-bold text-white">
            {message.subject || "Inquiry Details"}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            From: <span className="text-white font-medium">{message.name}</span> ({message.email})
          </p>
          <p className="text-[10px] text-zinc-600 font-mono mt-1">
            Received: {new Date(message.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-zinc-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
          {message.message || message.content || "No message body."}
        </div>
      </div>
    </div>
  );
};

export default MessageReaderModal;