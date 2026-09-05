import React, { useState } from "react";
import { X, Ruler, CheckCircle2 } from "lucide-react";

const BodyMeasurementModal = ({ isOpen, onClose, userId, onSaved, initialValues = {} }) => {
  const [form, setForm] = useState({
    waist: initialValues.waist || "",
    chest: initialValues.chest || "",
    hips: initialValues.hips || "",
    arms: initialValues.arms || "",
    thighs: initialValues.thighs || "",
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/log/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "waist", label: "Waist (cm)" },
    { name: "chest", label: "Chest (cm)" },
    { name: "hips", label: "Hips (cm)" },
    { name: "arms", label: "Arms (cm)" },
    { name: "thighs", label: "Thighs (cm)" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 dark:bg-[#0e0e14] dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <Ruler size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Body Circumference</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  {f.label}
                </label>
                <input
                  type="number"
                  step="0.5"
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder="e.g. 82.5"
                  className="w-full h-9 rounded-xl bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-white/[0.1] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500 font-mono"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {saving ? "Saving Measurements..." : "Update Circumference Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BodyMeasurementModal;