import User from "../models/user.js";
import DailyLog from "../models/dailyLog.js";
import WorkoutPlan from "../models/workoutPlan.js";
import DietPlan from "../models/dietPlan.js";

// Helper: Get local YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDayName = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
};

// Helper to recalculate habit score
const calculateHabitScore = (completedExCount, totalExCount, consumedMealCount, totalMealCount, waterMl, waterTargetMl) => {
  const workoutPct = totalExCount > 0 ? Math.min(completedExCount / totalExCount, 1) : 1;
  const dietPct = totalMealCount > 0 ? Math.min(consumedMealCount / totalMealCount, 1) : 1;
  const waterPct = waterTargetMl > 0 ? Math.min(waterMl / waterTargetMl, 1) : 1;

  const score = Math.round((workoutPct * 0.5 + dietPct * 0.35 + waterPct * 0.15) * 100);
  return Math.min(Math.max(score, 0), 100);
};

// Helper: Calculate true consecutive day streak
const calculateStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;

  // Filter logs that met the threshold (e.g., at least 30% habit score or at least 1 exercise/meal completed)
  const qualifyingLogs = logs
    .filter((l) => (l.habitScore && l.habitScore >= 30) || (l.completedExercises && l.completedExercises.length > 0))
    .map((l) => l.dateString);

  if (qualifyingLogs.length === 0) return 0;

  // Unique sorted dates in descending order (newest first)
  const uniqueDates = [...new Set(qualifyingLogs)].sort((a, b) => new Date(b) - new Date(a));

  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // If neither today nor yesterday was completed, streak is 0
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(uniqueDates[0]);

  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr);
    const diffDays = Math.round((expectedDate - currentDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// GET /api/log/today/:userId
export const getTodayLog = async (req, res) => {
  try {
    const { userId } = req.params;
    const dateString = getTodayDateString();
    const dayName = getTodayDayName();

    let log = await DailyLog.findOne({ userId, dateString });

    if (!log) {
      log = await DailyLog.create({
        userId,
        dateString,
        dayName,
        completedExercises: [],
        consumedMeals: [],
        waterMl: 0,
        habitScore: 0,
      });
    }

    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error("Get Today Log Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/log/toggle-exercise
export const toggleExercise = async (req, res) => {
  try {
    const { userId, exerciseName, totalExercises } = req.body;
    const dateString = getTodayDateString();
    const dayName = getTodayDayName();

    let log = await DailyLog.findOne({ userId, dateString });
    if (!log) {
      log = new DailyLog({ userId, dateString, dayName });
    }

    const idx = log.completedExercises.indexOf(exerciseName);
    if (idx > -1) {
      log.completedExercises.splice(idx, 1);
    } else {
      log.completedExercises.push(exerciseName);
    }

    // Recalculate score
    log.habitScore = calculateHabitScore(
      log.completedExercises.length,
      totalExercises || 4,
      log.consumedMeals.length,
      4, // 4 standard meals
      log.waterMl,
      log.waterTargetMl
    );

    await log.save();
    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error("Toggle Exercise Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/log/toggle-meal
export const toggleMeal = async (req, res) => {
  try {
    const { userId, mealName, totalExercises } = req.body;
    const dateString = getTodayDateString();
    const dayName = getTodayDayName();

    let log = await DailyLog.findOne({ userId, dateString });
    if (!log) {
      log = new DailyLog({ userId, dateString, dayName });
    }

    const idx = log.consumedMeals.indexOf(mealName);
    if (idx > -1) {
      log.consumedMeals.splice(idx, 1);
    } else {
      log.consumedMeals.push(mealName);
    }

    log.habitScore = calculateHabitScore(
      log.completedExercises.length,
      totalExercises || 4,
      log.consumedMeals.length,
      4,
      log.waterMl,
      log.waterTargetMl
    );

    await log.save();
    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error("Toggle Meal Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/log/water
export const logWater = async (req, res) => {
  try {
    const { userId, amountMl, totalExercises } = req.body;
    const dateString = getTodayDateString();
    const dayName = getTodayDayName();

    let log = await DailyLog.findOne({ userId, dateString });
    if (!log) {
      log = new DailyLog({ userId, dateString, dayName });
    }

    log.waterMl = Math.max(0, (log.waterMl || 0) + (Number(amountMl) || 250));

    log.habitScore = calculateHabitScore(
      log.completedExercises.length,
      totalExercises || 4,
      log.consumedMeals.length,
      4,
      log.waterMl,
      log.waterTargetMl
    );

    await log.save();
    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error("Log Water Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/log/analytics/:userId
export const getWeeklyAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch logs from the last 7 days
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      past7Days.push({
        dateString: `${year}-${month}-${day}`,
        shortDay: days[d.getDay()],
      });
    }

    const logs = await DailyLog.find({
      userId,
      dateString: { $gte: past7Days[0].dateString },
    });

    const allUserLogs = await DailyLog.find({ userId });
    const streak = calculateStreak(allUserLogs);

    // Map the 7-day timeline
    const weeklyTrend = past7Days.map((p) => {
      const entry = logs.find((l) => l.dateString === p.dateString);
      return {
        dateString: p.dateString,
        day: p.shortDay,
        habitScore: entry ? entry.habitScore : 0,
        completedExercisesCount: entry ? entry.completedExercises.length : 0,
        consumedMealsCount: entry ? entry.consumedMeals.length : 0,
        waterMl: entry ? entry.waterMl : 0,
        loggedWeight: entry ? entry.loggedWeight : null,
      };
    });

    // Calculate weekly completion average
    const totalScore = weeklyTrend.reduce((acc, curr) => acc + curr.habitScore, 0);
    const avgScore = Math.round(totalScore / 7);

    return res.status(200).json({
      success: true,
      streak,
      weeklyAvgScore: avgScore,
      weeklyTrend,
    });
  } catch (error) {
    console.error("Weekly Analytics Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/log/weight
export const logWeight = async (req, res) => {
  try {
    const { userId, weight } = req.body;
    if (!weight || Number(weight) <= 0) {
      return res.status(400).json({ success: false, message: "Valid weight is required." });
    }

    const dateString = getTodayDateString();
    const dayName = getTodayDayName();

    let log = await DailyLog.findOne({ userId, dateString });
    if (!log) {
      log = new DailyLog({ userId, dateString, dayName });
    }

    log.loggedWeight = Number(weight);
    await log.save();

    // Also update user's profile currentWeight and BMI
    const user = await User.findById(userId);
    if (user && user.profile) {
      user.profile.currentWeight = Number(weight);
      if (user.profile.height) {
        const heightM = user.profile.height / 100;
        user.profile.bmi = Number((Number(weight) / (heightM * heightM)).toFixed(1));
      }
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Weight logged successfully.",
      log,
      updatedBmi: user?.profile?.bmi,
    });
  } catch (error) {
    console.error("Log Weight Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};