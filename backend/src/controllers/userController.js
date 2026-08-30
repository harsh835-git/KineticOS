import User from "../models/user.js";
import WorkoutPlan from "../models/workoutPlan.js";
import DietPlan from "../models/dietPlan.js";

// ================= COMPLETE ONBOARDING =================
export const completeOnboarding = async (req, res) => {
  try {
    const {
      userId,
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      dietaryPreference,
      activityLevel,
      experienceLevel,
      primaryGoal,
    } = req.body;

    if (
      !userId ||
      !age ||
      !gender ||
      !height ||
      !currentWeight ||
      !activityLevel ||
      !experienceLevel ||
      !primaryGoal
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required profile details.",
      });
    }

    const numAge = Number(age);
    const numHeight = Number(height);
    const numWeight = Number(currentWeight);

    // 1. BMI Calculation: kg / (m^2)
    const heightInMeters = numHeight / 100;
    const bmi = parseFloat((numWeight / (heightInMeters * heightInMeters)).toFixed(1));

    // 2. Mifflin-St Jeor BMR[cite: 2]
    let bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge;
    bmr = gender === "male" ? bmr + 5 : bmr - 161;

    // Activity Multipliers
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    const maintenanceCalories = Math.round(bmr * (multipliers[activityLevel] || 1.2));

    // 3. Calorie Adjustments Based on Goal
    let targetCalories = maintenanceCalories;
    if (primaryGoal === "Weight Loss") targetCalories -= 500;
    else if (primaryGoal === "Muscle Gain") targetCalories += 300;
    else if (primaryGoal === "Body Recomposition") targetCalories -= 200;

    // 4. Safe Calorie Floor Enforcement[cite: 2]
    const minFloor = gender === "male" ? 1500 : 1200;
    if (targetCalories < minFloor) {
      targetCalories = minFloor;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isOnboarded: true,
        profile: {
          age: numAge,
          gender,
          height: numHeight,
          currentWeight: numWeight,
          targetWeight: targetWeight ? Number(targetWeight) : numWeight,
          dietaryPreference: dietaryPreference || "non-vegetarian",
          activityLevel,
          experienceLevel,
          primaryGoal,
          bmi,
          maintenanceCalories,
          targetCalories,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile setup completed successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isOnboarded: updatedUser.isOnboarded,
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save profile setup.",
    });
  }
};

// ================= GET USER PROFILE =================
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -resetOtp -resetOtpExpire");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile.",
    });
  }
};

// GET /api/user/dashboard/:userId
export const getDashboardOverview = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -resetOtp -resetOtpExpire");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Determine current day of week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = daysOfWeek[new Date().getDay()];

    // Fetch user's active workout and diet plans
    const workoutPlan = await WorkoutPlan.findOne({ userId });
    const dietPlan = await DietPlan.findOne({ userId });

    // Extract today's specific workout and meals
    const todayWorkout = workoutPlan?.schedule?.find((day) => day.dayName === currentDayName) || null;
    const todayDiet = dietPlan?.schedule?.find((day) => day.dayName === currentDayName) || null;

    return res.status(200).json({
      success: true,
      currentDay: currentDayName,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
      todayWorkout,
      todayDiet,
      weeklyWorkoutPlan: workoutPlan,
      weeklyDietPlan: dietPlan,
    });
  } catch (error) {
    console.error("Dashboard Overview Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};