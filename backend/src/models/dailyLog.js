import mongoose from "mongoose";

const exerciseLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  set: { type: Number, default: 1 },
  weight: { type: Number, required: true },
  targetReps: { type: Number, required: true },
  completedReps: { type: Number, required: true },
  rpe: { type: Number, required: true },
  recommendation: { type: String },
  nextWeight: { type: Number },
  loggedAt: { type: Date, default: Date.now }
});

const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    dayName: {
      type: String,
      required: true,
    },
    completedExercises: [exerciseLogSchema],
    consumedMeals: [{ type: String }],
    waterMl: { type: Number, default: 0, min: 0 },
    waterTargetMl: { type: Number, default: 3000 },
    habitScore: { type: Number, default: 0, min: 0, max: 100 },
    weight: { type: Number, default: null },
    loggedWeight: { type: Number, default: null },
    energyLevel: {
      type: String,
      enum: ["Energized", "Normal", "Fatigued", "Exhausted", "Slightly Fatigued", "Very Tired"],
      default: "Normal",
    },
    workoutStatus: {
      type: String,
      enum: ["Completed", "Partial", "Skipped"],
      default: "Completed",
    },
    dietStatus: {
      type: String,
      enum: ["Followed", "Mostly", "Deviated"],
      default: "Followed",
    },
    notes: { type: String, default: "" },
    measurements: {
      waist: { type: Number, default: null },
      chest: { type: Number, default: null },
      hips: { type: Number, default: null },
      arms: { type: Number, default: null },
      thighs: { type: Number, default: null },
      loggedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

dailyLogSchema.index({ userId: 1, dateString: 1 }, { unique: true });

const DailyLog = mongoose.models.DailyLog || mongoose.model("DailyLog", dailyLogSchema);
export default DailyLog;