import React, { useState } from "react";
import { PublicNavbar, PublicFooter } from "../components/PublicNavbar";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || "Failed to transmit message.");
      }
    } catch (err) {
      console.error("Network error submitting contact form:", err);
      alert("Network error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
            Inquiries & Feedback
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Get in Touch
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Have feature suggestions or technical inquiries about KineticOS?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Contact Details */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <Mail size={16} />
              </div>
              <h3 className="text-xs font-bold text-white">Direct Email</h3>
              <p className="text-xs text-zinc-400 font-mono">harshdeveloper83@gmail.com</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f15] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <h3 className="text-xs font-bold text-white">Issue Reporting</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log edge cases or calculation bug reports for immediate engine tuning.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-[#0f0f15] border border-white/[0.08] shadow-xl">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-bold text-white">Message Transmitted</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Thank you for reaching out. We will review your message and respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 rounded-xl bg-black/40 border border-white/[0.08] px-3 text-xs text-white outline-none focus:border-violet-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 rounded-xl bg-black/40 border border-white/[0.08] px-3 text-xs text-white outline-none focus:border-violet-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Topic / Subject</label>
                  <input
                    type="text"
                    placeholder="Feedback / Engine scaling suggestion"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-10 rounded-xl bg-black/40 border border-white/[0.08] px-3 text-xs text-white outline-none focus:border-violet-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your question or recommendation..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.08] p-3 text-xs text-white outline-none focus:border-violet-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-950/50 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;