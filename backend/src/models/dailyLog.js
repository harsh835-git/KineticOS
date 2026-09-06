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
      type: String, // format "YYYY-MM-DD" in user's local timezone
      required: true,
      index: true,
    },
    dayName: {
      type: String, // e.g. "Monday"
      required: true,
    },
    // Array of completed exercise names
    completedExercises: [exerciseLogSchema],
    
    // Array of consumed meal names (e.g., ["Breakfast", "Lunch"])
    consumedMeals: [
      {
        type: String,
      },
    ],
    waterMl: {
      type: Number,
      default: 0,
      min: 0,
    },
    waterTargetMl: {
      type: Number,
      default: 3000,
    },
    habitScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Unified weight fields
    weight: {
      type: Number,
      default: null,
    },
    loggedWeight: {
      type: Number,
      default: null,
    },

    // Daily Biometric Check-In fields
    energyLevel: {
      type: String,
      enum: [
        "Energized",
        "Normal",
        "Fatigued",
        "Exhausted",
        "Slightly Fatigued",
        "Very Tired",
      ],
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
    measurements: {
      type: Map,
      of: Number,
      default: {},
    },
    notes: {
      type: String,
      default: "",
    },


    // Add inside dailyLogSchema (or as a separate Measurement schema):
measurements: {
  waist: { type: Number, default: null }, // in cm or inches
  chest: { type: Number, default: null },
  hips: { type: Number, default: null },
  arms: { type: Number, default: null },
  thighs: { type: Number, default: null },
  loggedAt: { type: Date, default: Date.now }
}
  },
  { timestamps: true }
);



// Compound index so one user only has one log document per calendar day
dailyLogSchema.index({ userId: 1, dateString: 1 }, { unique: true });

const DailyLog = mongoose.models.DailyLog || mongoose.model("DailyLog", dailyLogSchema);
export default DailyLog;