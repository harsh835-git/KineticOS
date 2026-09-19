import React from "react";
import { X } from "lucide-react";

const CreateTemplateModal = ({
  isOpen,
  onClose,
  newTemplate,
  setNewTemplate,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-white/[0.1] rounded-2xl w-full max-w-md p-6 space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Create Workout Template</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Template Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 4-Day Push Pull Legs Hypertrophy"
              value={newTemplate.title}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Target Goal</label>
              <select
                value={newTemplate.targetGoal}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, targetGoal: e.target.value })
                }
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-zinc-300 outline-none focus:border-violet-500/50 cursor-pointer"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Body Recomposition">Body Recomposition</option>
                <option value="Maintain">Maintain</option>
                <option value="Improve Endurance">Improve Endurance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Experience Level</label>
              <select
                value={newTemplate.experienceLevel}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    experienceLevel: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-zinc-300 outline-none focus:border-violet-500/50 cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;