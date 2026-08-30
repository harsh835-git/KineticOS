import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  mealName: { type: String, required: true }, // "Breakfast", "Lunch", "Snack", "Dinner"
  suggestedItems: [{ type: String, required: true }],
  calories: { type: Number, required: true },
  protein: { type: Number, required: true }, // in grams
  carbs: { type: Number, required: true }, // in grams
  fats: { type: Number, required: true }, // in grams
});

const dayDietSchema = new mongoose.Schema({
  dayName: { type: String, required: true }, // "Monday" through "Sunday"
  targetCalories: { type: Number, required: true },
  macros: {
    proteinGrams: { type: Number, required: true },
    carbsGrams: { type: Number, required: true },
    fatsGrams: { type: Number, required: true },
    macroSplit: { type: String, required: true }, // e.g., "40P / 30C / 30F"
  },
  meals: [mealSchema],
});

const dietPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    goal: { type: String, required: true },
    dailyTargetCalories: { type: Number, required: true },
    dietaryPreference: {
      type: String,
      enum: ["vegetarian", "non-vegetarian"],
      default: "non-vegetarian",
    },
    disclaimer: {
      type: String,
      default:
        "Medical Disclaimer: FitAI nutrition plans provide general nutritional guidelines and are not medical prescriptions. Consult a licensed physician or registered dietitian before beginning any strict deficit or altered macro protocol.",
    },
    schedule: [dayDietSchema],
  },
  { timestamps: true },
);

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
export default DietPlan;
