import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },
    isOnboarded: { type: Boolean, default: false },

    // Health & Goal Profile Setup
    profile: {
      age: { type: Number, default: null },
      gender: { type: String, enum: ["male", "female"], default: null },
      height: { type: Number, default: null }, // in cm
      currentWeight: { type: Number, default: null }, // in kg
      targetWeight: { type: Number, default: null }, // in kg
      dietaryPreference: {
        type: String,
        enum: ["vegetarian", "non-vegetarian"],
        default: "non-vegetarian",
      },
      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "very_active", "extra_active"],
        default: null,
      },
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: null,
      },
      primaryGoal: {
        type: String,
        enum: [
          "Weight Loss",
          "Muscle Gain",
          "Body Recomposition",
          "Maintain",
          "Improve Endurance",
        ],
        default: null,
      },
      bmi: { type: Number, default: null },
      maintenanceCalories: { type: Number, default: null },
      targetCalories: { type: Number, default: null },
    },

    resetOtp: {
      type: String,
      default: null,
    },

    resetOtpExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model("User", userSchema);
export default User;
