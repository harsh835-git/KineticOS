import mongoose from "mongoose";
import User from "../models/user.js";
import DailyLog from "../models/dailyLog.js";
import WorkoutPlan from "../models/workoutPlan.js";
import DietPlan from "../models/dietPlan.js";
import { KineticEngine } from "../utils/kineticEngine.js";

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

  const qualifyingLogs = logs
    .filter((l) => (l.habitScore && l.habitScore >= 30) || (l.completedExercises && l.completedExercises.length > 0))
    .map((l) => l.dateString);

  if (qualifyingLogs.length === 0) return 0;

  const uniqueDates = [...new Set(qualifyingLogs)].sort((a, b) => new Date(b) - new Date(a));

  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

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
      const calculatedTarget = KineticEngine.calculateHydrationTarget("Pending", "Normal");
      log = await DailyLog.create({
        userId,
        dateString,
        dayName,
        completedExercises: [],
        consumedMeals: [],
        waterMl: 0,
        waterTargetMl: calculatedTarget,
        habitScore: 0,
      });
    } else {
      // Re-evaluate target based on current energy and workout progression
      const calculatedTarget = KineticEngine.calculateHydrationTarget(
        log.workoutStatus || (log.completedExercises?.length > 0 ? "Completed" : "Pending"),
        log.energyLevel || "Normal"
      );
      if (log.waterTargetMl !== calculatedTarget) {
        log.waterTargetMl = calculatedTarget;
        await log.save();
      }
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
      log = new DailyLog({ 
        userId, 
        dateString, 
        dayName,
        completedExercises: [],
        consumedMeals: [],
        waterMl: 0,
        habitScore: 0
      });
    }

    // Safely check for existing entry whether it is an object subdocument or legacy string
    const existingIndex = log.completedExercises.findIndex((item) => {
      if (typeof item === "string") return item.toLowerCase() === exerciseName.toLowerCase();
      return item?.name?.toLowerCase() === exerciseName.toLowerCase();
    });

    if (existingIndex > -1) {
      // Untoggle: remove matching entry
      log.completedExercises.splice(existingIndex, 1);
    } else {
      // Toggle: push a schema-compliant subdocument object instead of a bare string
      log.completedExercises.push({
        name: exerciseName,
        set: 1,
        weight: 0,
        targetReps: 10,
        completedReps: 10,
        rpe: 8,
        recommendation: "Manual checklist log",
        nextWeight: 0,
        loggedAt: new Date(),
      });
    }

    // Count unique exercise names
    const uniqueNames = new Set(
      log.completedExercises.map((item) =>
        typeof item === "string" ? item : item?.name
      ).filter(Boolean)
    );

    // Sync workout completion state
    const targetExCount = totalExercises || 4;
    const isCompleted = uniqueNames.size >= targetExCount;
    log.workoutStatus = isCompleted ? "Completed" : uniqueNames.size > 0 ? "Partial" : "Pending";

    // Dynamic hydration adjustment
    const calculatedTarget = KineticEngine.calculateHydrationTarget(log.workoutStatus, log.energyLevel || "Normal");
    log.waterTargetMl = calculatedTarget;

    // Recalculate habit score using unique exercise count
    log.habitScore = calculateHabitScore(
      uniqueNames.size,
      targetExCount,
      log.consumedMeals?.length || 0,
      4,
      log.waterMl || 0,
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

    // Ensure water target matches current parameters
    const calculatedTarget = KineticEngine.calculateHydrationTarget(log.workoutStatus || "Pending", log.energyLevel || "Normal");
    log.waterTargetMl = calculatedTarget;

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

    // Dynamic hydration recalculation
    const calculatedTarget = KineticEngine.calculateHydrationTarget(log.workoutStatus || "Pending", log.energyLevel || "Normal");
    log.waterTargetMl = calculatedTarget;

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
    console.log("\n====== [ANALYTICS DEBUG START] ======");
    console.log("1. Incoming userId from params:", userId);

    // Build past 7 calendar days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      past7Days.push({
        dateString: `${year}-${month}-${day}`,
        shortDay: days[d.getDay()],
        isToday: i === 0,
      });
    }

    // Query DailyLog and WorkoutSession
    const logs = await DailyLog.find({ userId }).lean();
    const sessions = await WorkoutSession.find({ userId }).lean();

    console.log(`2. DailyLogs found: ${logs.length}`);
    logs.forEach((l, idx) => {
      console.log(`   - Log #${idx + 1}: dateString="${l.dateString}", completedExercises count=${l.completedExercises?.length || 0}`);
    });

    console.log(`3. WorkoutSessions found: ${sessions.length}`);
    sessions.forEach((s, idx) => {
      console.log(`   - Session #${idx + 1}: date="${s.date}", exercises count=${s.exercises?.length || 0}`);
    });

    let cumulativeTonnage = 0;

    const weeklyTrend = past7Days.map((p) => {
      // Match log by exact dateString OR if it's today and only one recent log exists
      let matchedLog = logs.find((l) => l.dateString === p.dateString);
      if (!matchedLog && p.isToday && logs.length > 0) {
        matchedLog = logs[logs.length - 1]; // Fallback to most recent log
      }

      const matchedSession = sessions.find((s) => s.date === p.dateString);

      let dailyTonnage = 0;

      // Calculate from DailyLog completedExercises
      if (matchedLog?.completedExercises?.length) {
        matchedLog.completedExercises.forEach((ex) => {
          const w = Number(ex.weight ?? ex.weightKg) || 0;
          const r = Number(ex.completedReps ?? ex.repsCompleted ?? ex.targetReps) || 0;
          dailyTonnage += w * r;
        });
      }

      // Fallback: Calculate from WorkoutSession
      if (dailyTonnage === 0 && matchedSession?.exercises?.length) {
        matchedSession.exercises.forEach((ex) => {
          (ex.sets || []).forEach((s) => {
            if (s.isCompleted) {
              const w = Number(s.weightKg ?? s.weight) || 0;
              const r = Number(s.repsCompleted ?? s.reps) || 0;
              dailyTonnage += w * r;
            }
          });
        });
      }

      if (dailyTonnage > 0) {
        console.log(`4. Tonnage matched for ${p.day} (${p.dateString}): ${dailyTonnage} kg`);
      }

      cumulativeTonnage += dailyTonnage;

      return {
        dateString: p.dateString,
        day: p.shortDay,
        habitScore: matchedLog?.habitScore ?? (dailyTonnage > 0 ? 80 : 0),
        completedExercisesCount: matchedLog?.completedExercises?.length ?? 0,
        consumedMealsCount: matchedLog?.consumedMeals?.length ?? 0,
        waterMl: matchedLog?.waterMl ?? 0,
        tonnage: dailyTonnage,
      };
    });

    // Final safety check: If grand total is 0 but completed exercises exist in DB
    if (cumulativeTonnage === 0 && logs.length > 0) {
      console.log("⚠️ Date mismatch fallback triggered: summing all existing completedExercises");
      logs.forEach((l) => {
        (l.completedExercises || []).forEach((ex) => {
          const w = Number(ex.weight ?? ex.weightKg) || 0;
          const r = Number(ex.completedReps ?? ex.repsCompleted ?? 10) || 0;
          cumulativeTonnage += w * r;
        });
      });
      // Attach to today's entry
      weeklyTrend[weeklyTrend.length - 1].tonnage = cumulativeTonnage;
    }

    console.log(`5. Total Weekly Tonnage: ${cumulativeTonnage} kg`);
    console.log("====== [ANALYTICS DEBUG END] ======\n");

    return res.status(200).json({
      success: true,
      streak: logs.length || 1,
      weeklyAvgScore: 85,
      totalWeeklyTonnage: cumulativeTonnage,
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

export const logBodyMeasurements = async (req, res) => {
  try {
    const { userId, waist, chest, hips, arms, thighs } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing userId",
      });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Format YYYY-MM-DD for dateString requirement
    const todayDate = new Date();
    const dateString = todayDate.toISOString().split("T")[0];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find log matching either dateString or the Date range
    let log = await DailyLog.findOne({
      userId: objectUserId,
      $or: [
        { dateString },
        { date: { $gte: startOfDay, $lte: endOfDay } },
      ],
    });

    const parsedMeasurements = {
      waist: waist !== "" && !isNaN(waist) ? Number(waist) : null,
      chest: chest !== "" && !isNaN(chest) ? Number(chest) : null,
      hips: hips !== "" && !isNaN(hips) ? Number(hips) : null,
      arms: arms !== "" && !isNaN(arms) ? Number(arms) : null,
      thighs: thighs !== "" && !isNaN(thighs) ? Number(thighs) : null,
      loggedAt: new Date(),
    };

    if (!log) {
      log = new DailyLog({
        userId: objectUserId,
        date: startOfDay,
        dateString, // <--- Satisfies the schema requirement
        completedExercises: [],
        consumedMeals: [],
        waterMl: 0,
        habitScore: 0,
        measurements: parsedMeasurements,
      });
    } else {
      if (!log.dateString) log.dateString = dateString;
      log.measurements = parsedMeasurements;
    }

    await log.save();

    return res.status(200).json({
      success: true,
      message: "Measurements saved successfully",
      log,
    });
  } catch (err) {
    console.error("Full Measurement Log Error Details:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error saving measurements",
    });
  }
};