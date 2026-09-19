import mongoose from "mongoose";

const exerciseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetMuscle: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  restSeconds: { type: Number, default: 90 },
  cues: { type: String, default: "" },
});

const dayRoutineSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  focus: { type: String, required: true },
  isRestDay: { type: Boolean, default: false },
  exercises: [exerciseItemSchema],
});

const workoutTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetGoal: {
      type: String,
      enum: ["Muscle Gain", "Weight Loss", "Body Recomposition", "Maintain", "Improve Endurance"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    schedule: [dayRoutineSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const WorkoutTemplate =
  mongoose.models.WorkoutTemplate || mongoose.model("WorkoutTemplate", workoutTemplateSchema);
export default WorkoutTemplate;