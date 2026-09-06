import mongoose from "mongoose";

const setEntrySchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  weightKg: { type: Number, default: 0 },
  repsCompleted: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
});

const exerciseLogSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  sets: [setEntrySchema],
});

const workoutSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    dayName: { type: String, required: true },
    focus: { type: String, default: "Workout" },
    exercises: [exerciseLogSchema],
    durationMinutes: { type: Number, default: 0 },
    isFinished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError on nodemon reloads
const WorkoutSession =
  mongoose.models.WorkoutSession ||
  mongoose.model("WorkoutSession", workoutSessionSchema);

export default WorkoutSession;