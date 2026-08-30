import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true }, // e.g., "8-10" or "12-15"
  restSeconds: { type: Number, required: true }, // in seconds
  formGuidance: { type: String, required: true },
});

const dayPlanSchema = new mongoose.Schema({
  dayName: { type: String, required: true }, // "Monday", "Tuesday", etc.
  focus: { type: String, required: true }, // e.g., "Upper Body Strength", "Cardio & Core", "Rest & Mobility"
  isRestDay: { type: Boolean, default: false },
  exercises: [exerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    goal: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    activityLevel: { type: String, required: true },
    weekNumber: { type: Number, default: 1 },
    schedule: [dayPlanSchema], // Exactly 7 days
  },
  { timestamps: true }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
export default WorkoutPlan;