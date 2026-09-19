import mongoose from "mongoose";

const mealBlueprintSchema = new mongoose.Schema({
  mealName: { type: String, required: true },
  targetCalories: { type: Number, required: true },
  proteinGrams: { type: Number, required: true },
  carbsGrams: { type: Number, required: true },
  fatsGrams: { type: Number, required: true },
  suggestedFoods: [{ type: String }],
});

const adminDietTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetGoal: {
      type: String,
      enum: ["Muscle Gain", "Weight Loss", "Body Recomposition", "Maintain", "Improve Endurance"],
      required: true,
    },
    dietaryType: {
      type: String,
      enum: ["Standard / Omnivore", "Vegetarian", "Vegan", "Keto", "High Protein"],
      default: "Standard / Omnivore",
    },
    dailyCalories: { type: Number, required: true },
    macros: {
      proteinGrams: { type: Number, required: true },
      carbsGrams: { type: Number, required: true },
      fatsGrams: { type: Number, required: true },
    },
    meals: [mealBlueprintSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const AdminDietTemplate =
  mongoose.models.AdminDietTemplate ||
  mongoose.model("AdminDietTemplate", adminDietTemplateSchema);

export default AdminDietTemplate;