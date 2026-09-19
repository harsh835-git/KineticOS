import React, { useState } from "react";
import { X, UtensilsCrossed, Plus, Trash2 } from "lucide-react";

const CreateDietTemplateModal = ({ isOpen, onClose, onSaveSuccess }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [targetGoal, setTargetGoal] = useState("Muscle Gain");
  const [dietaryType, setDietaryType] = useState("Standard / Omnivore");
  const [dailyCalories, setDailyCalories] = useState(2400);
  const [proteinGrams, setProteinGrams] = useState(160);
  const [carbsGrams, setCarbsGrams] = useState(250);
  const [fatsGrams, setFatsGrams] = useState(65);

  const [meals, setMeals] = useState([
    {
      mealName: "Breakfast",
      targetCalories: 600,
      proteinGrams: 40,
      carbsGrams: 70,
      fatsGrams: 15,
      suggestedFoods: "Oats, Eggs, Berries",
    },
    {
      mealName: "Lunch",
      targetCalories: 750,
      proteinGrams: 50,
      carbsGrams: 80,
      fatsGrams: 20,
      suggestedFoods: "Chicken Breast, Brown Rice, Mixed Greens",
    },
    {
      mealName: "Dinner",
      targetCalories: 650,
      proteinGrams: 45,
      carbsGrams: 60,
      fatsGrams: 20,
      suggestedFoods: "Salmon/Paneer, Sweet Potato, Broccoli",
    },
  ]);

  const [newMeal, setNewMeal] = useState({
    mealName: "",
    targetCalories: 400,
    proteinGrams: 25,
    carbsGrams: 40,
    fatsGrams: 10,
    suggestedFoods: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.mealName.trim()) return;

    setMeals((prev) => [
      ...prev,
      {
        ...newMeal,
        targetCalories: Number(newMeal.targetCalories),
        proteinGrams: Number(newMeal.proteinGrams),
        carbsGrams: Number(newMeal.carbsGrams),
        fatsGrams: Number(newMeal.fatsGrams),
      },
    ]);

    setNewMeal({
      mealName: "",
      targetCalories: 400,
      proteinGrams: 25,
      carbsGrams: 40,
      fatsGrams: 10,
      suggestedFoods: "",
    });
  };

  const handleRemoveMeal = (index) => {
    setMeals((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a template title");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // Format meals suggestedFoods array
      const formattedMeals = meals.map((m) => ({
        ...m,
        suggestedFoods: typeof m.suggestedFoods === "string"
          ? m.suggestedFoods.split(",").map((s) => s.trim()).filter(Boolean)
          : m.suggestedFoods,
      }));

      const res = await fetch("http://localhost:5000/api/admin/diet-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          targetGoal,
          dietaryType,
          dailyCalories: Number(dailyCalories),
          macros: {
            proteinGrams: Number(proteinGrams),
            carbsGrams: Number(carbsGrams),
            fatsGrams: Number(fatsGrams),
          },
          meals: formattedMeals,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSaveSuccess(data.template);
        onClose();
      } else {
        alert(data.message || "Failed to create diet template");
      }
    } catch (err) {
      console.error("Create Diet Template Error:", err);
      alert("Network error creating diet template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e0e15] border border-white/[0.1] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <UtensilsCrossed size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Diet Template Builder
              </h2>
              <p className="text-[11px] text-zinc-400">
                Configure baseline daily macros, calories, and meal blueprints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Plan Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lean Bulk Hypertrophy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Target Goal
              </label>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-zinc-300 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Body Recomposition">Body Recomposition</option>
                <option value="Maintain">Maintain</option>
                <option value="Improve Endurance">Improve Endurance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                Dietary Preference
              </label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-zinc-300 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Standard / Omnivore">Standard / Omnivore</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="High Protein">High Protein</option>
                <option value="Keto">Keto</option>
              </select>
            </div>
          </div>

          {/* Caloric & Macro Targets */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Daily Macro & Caloric Target
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                  Daily Calories
                </label>
                <input
                  type="number"
                  required
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white outline-none font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  required
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white outline-none font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  required
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white outline-none font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                  Fats (g)
                </label>
                <input
                  type="number"
                  required
                  value={fatsGrams}
                  onChange={(e) => setFatsGrams(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white outline-none font-mono focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Meal Blueprints Section */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Meal Schedule Blueprint
            </h4>

            {/* Sub-form to Add a Meal */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Meal Name (e.g. Snack / Pre-workout)"
                  value={newMeal.mealName}
                  onChange={(e) => setNewMeal({ ...newMeal, mealName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Kcal"
                  value={newMeal.targetCalories}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, targetCalories: e.target.value })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="P (g)"
                  value={newMeal.proteinGrams}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, proteinGrams: e.target.value })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="C (g)"
                  value={newMeal.carbsGrams}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, carbsGrams: e.target.value })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white outline-none"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddMeal}
                  className="w-full h-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="sm:col-span-6">
                <input
                  type="text"
                  placeholder="Suggested Foods comma separated (e.g. Whey Protein, Almonds, Banana)"
                  value={newMeal.suggestedFoods}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, suggestedFoods: e.target.value })
                  }
                  className="w-full px-3 py-1 rounded-lg bg-black/20 border border-white/[0.04] text-[11px] text-zinc-300 placeholder:text-zinc-600 outline-none"
                />
              </div>
            </div>

            {/* List of Configured Meals */}
            <div className="space-y-2">
              {meals.length === 0 ? (
                <p className="text-[11px] text-zinc-600 text-center py-3">
                  No meals configured in this blueprint.
                </p>
              ) : (
                meals.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{m.mealName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {m.targetCalories} kcal
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        P: {m.proteinGrams}g · C: {m.carbsGrams}g · F: {m.fatsGrams}g
                        {m.suggestedFoods ? ` · Foods: ${m.suggestedFoods}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving Plan..." : "Deploy Diet Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDietTemplateModal;