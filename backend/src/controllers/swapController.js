import { GoogleGenAI } from "@google/genai";
import WorkoutPlan from "../models/workoutPlan.js";
import DietPlan from "../models/dietPlan.js";
import User from "../models/user.js";

// Safety Net Presets (Used if API key is invalid, quota-limited, or network fails)
const getFallbackExerciseAlternatives = (item) => {
  const baseName = item?.name || "Exercise";
  const sets = item?.sets || 3;
  const reps = item?.reps || "10-12";
  const restSeconds = item?.restSeconds || 60;

  return [
    {
      name: `Dumbbell Variation of ${baseName}`,
      sets,
      reps,
      restSeconds,
      formGuidance: "Maintain controlled tempo and complete full extension and contraction.",
      equipment: "Dumbbells",
    },
    {
      name: `Cable Alternative for ${baseName}`,
      sets,
      reps: "12-15",
      restSeconds,
      formGuidance: "Keep constant tension throughout the entire range of motion.",
      equipment: "Cable Machine",
    },
    {
      name: `Bodyweight Replacement for ${baseName}`,
      sets,
      reps: "To Technical Failure",
      restSeconds: 45,
      formGuidance: "Prioritize strict cadence, core bracing, and joint stability.",
      equipment: "Bodyweight",
    },
  ];
};

const getFallbackMealAlternatives = (item, isVeg) => {
  const mealName = item?.mealName || "Meal";
  const calories = item?.calories || 500;
  const protein = item?.protein || "30g";
  const carbs = item?.carbs || "45g";
  const fats = item?.fats || "12g";

  return [
    {
      mealName,
      calories,
      protein,
      carbs,
      fats,
      suggestedItems: isVeg
        ? ["150g Grilled Paneer or Baked Tofu", "1 cup Steamed Quinoa or Brown Rice", "Sautéed spinach with olive oil"]
        : ["180g Grilled Chicken Breast", "1 medium baked sweet potato", "Steamed asparagus spears"],
    },
    {
      mealName,
      calories,
      protein,
      carbs,
      fats,
      suggestedItems: isVeg
        ? ["1 cup Chickpeas/Lentil Dal", "2 whole wheat rotis or chapatis", "1 cup Greek yogurt with cucumber"]
        : ["3 Whole Eggs + 2 Whites Scramble", "2 slices whole grain sourdough toast", "Half sliced avocado"],
    },
    {
      mealName,
      calories,
      protein,
      carbs,
      fats,
      suggestedItems: isVeg
        ? ["Soy chunks & bell pepper stir-fry", "1 cup Jasmine rice", "Side flaxseed & tomato salad"]
        : ["200g Seared White Fish or Salmon fillet", "1 cup brown basmati rice", "Roasted broccoli florets"],
    },
  ];
};

// POST /api/swap/suggestions
export const getSwapSuggestions = async (req, res) => {
  try {
    const { type, currentItem, userId } = req.body;

    if (!currentItem || !type) {
      return res.status(400).json({ success: false, message: "Missing type or currentItem." });
    }

    let user = null;
    if (userId) {
      try {
        user = await User.findById(userId);
      } catch (err) {
        console.warn("User lookup skipped:", err.message);
      }
    }

    const profile = user?.profile || {};
    const isVeg = profile.dietaryPreference === "vegetarian";

    let suggestions = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        let prompt = "";

        if (type === "exercise") {
          const exName = currentItem.name || "Target Movement";
          const sets = currentItem.sets || 3;
          const reps = currentItem.reps || "10-12";

          prompt = `You are a strength and conditioning specialist. Provide exactly 3 direct exercise alternatives for:
- Current Exercise: "${exName}" (${sets} sets x ${reps} reps)
- Experience Level: ${profile.experienceLevel || "Intermediate"}
- Target Goal: ${profile.primaryGoal || "General Fitness"}

Return ONLY a valid JSON array of 3 objects with this exact format:
[
  {
    "name": "Alternative Exercise Name",
    "sets": ${sets},
    "reps": "${reps}",
    "restSeconds": ${currentItem.restSeconds || 60},
    "formGuidance": "Short 1-sentence execution cue",
    "equipment": "Dumbbell / Cable / Barbell / Bodyweight"
  }
]`;
        } else {
          const mealName = currentItem.mealName || "Target Meal";
          const calories = currentItem.calories || 500;
          const protein = currentItem.protein || "30g";
          const carbs = currentItem.carbs || "45g";
          const fats = currentItem.fats || "12g";

          prompt = `You are a sports nutritionist. Provide exactly 3 viable alternative meal combinations for:
- Meal: "${mealName}"
- Target Calories: ${calories} kcal
- Target Macros: ${protein}P / ${carbs}C / ${fats}F
- Dietary Preference: ${profile.dietaryPreference || "non-vegetarian"}

Return ONLY a valid JSON array of 3 objects with this exact format:
[
  {
    "mealName": "${mealName}",
    "calories": ${calories},
    "protein": "${protein}",
    "carbs": "${carbs}",
    "fats": "${fats}",
    "suggestedItems": ["Item 1 with quantity", "Item 2 with quantity", "Item 3 with quantity"]
  }
]`;
        }

        // Call Gemini Model
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" },
          });
        } catch (modelErr) {
          console.warn("gemini-3.6-flash failed, trying gemini-2.5-flash fallback:", modelErr.message);
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" },
          });
        }

        let rawText = response.text ? response.text.trim() : "";
        if (rawText.startsWith("```json")) {
          rawText = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
        } else if (rawText.startsWith("```")) {
          rawText = rawText.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
        }

        suggestions = JSON.parse(rawText);
        console.log("✅ GEMINI IS ACTIVE & DELIVERED LIVE ALTERNATIVES");
      } catch (geminiError) {
        console.warn("⚠️ Gemini generation failed, using intelligent presets. Reason:", geminiError.message);
        suggestions = type === "exercise"
          ? getFallbackExerciseAlternatives(currentItem)
          : getFallbackMealAlternatives(currentItem, isVeg);
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY missing in .env, using default presets.");
      suggestions = type === "exercise"
        ? getFallbackExerciseAlternatives(currentItem)
        : getFallbackMealAlternatives(currentItem, isVeg);
    }

    return res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("Critical Swap Controller Error:", error);
    const fallback = req.body?.type === "exercise"
      ? getFallbackExerciseAlternatives(req.body?.currentItem)
      : getFallbackMealAlternatives(req.body?.currentItem, false);

    return res.status(200).json({ success: true, suggestions: fallback });
  }
};

// POST /api/swap/apply
export const applySwap = async (req, res) => {
  try {
    const { userId, type, dayName, oldItemName, newItem } = req.body;

    if (!userId || !type || !dayName || !oldItemName || !newItem) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    if (type === "exercise") {
      const workoutPlan = await WorkoutPlan.findOne({ userId });
      if (!workoutPlan) return res.status(404).json({ success: false, message: "Workout plan not found." });

      const day = workoutPlan.schedule.find((d) => d.dayName === dayName);
      if (day && day.exercises) {
        const idx = day.exercises.findIndex((e) => e.name === oldItemName);
        if (idx !== -1) {
          day.exercises[idx] = newItem;
          workoutPlan.markModified("schedule");
          await workoutPlan.save();
        }
      }
      return res.status(200).json({ success: true, message: "Exercise updated successfully." });
    } else if (type === "meal") {
      const dietPlan = await DietPlan.findOne({ userId });
      if (!dietPlan) return res.status(404).json({ success: false, message: "Diet plan not found." });

      const day = dietPlan.schedule.find((d) => d.dayName === dayName);
      if (day && day.meals) {
        const idx = day.meals.findIndex((m) => m.mealName === oldItemName);
        if (idx !== -1) {
          day.meals[idx] = newItem;
          dietPlan.markModified("schedule");
          await dietPlan.save();
        }
      }
      return res.status(200).json({ success: true, message: "Meal updated successfully." });
    }

    return res.status(400).json({ success: false, message: "Invalid swap type." });
  } catch (error) {
    console.error("Apply Swap Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};