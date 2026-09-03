import mongoose from "mongoose";

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
    completedExercises: [
      {
        type: String,
      },
    ],
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
  },
  { timestamps: true }
);

// Compound index so one user only has one log document per calendar day
dailyLogSchema.index({ userId: 1, dateString: 1 }, { unique: true });

export default mongoose.model("DailyLog", dailyLogSchema);