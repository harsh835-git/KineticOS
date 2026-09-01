import express from "express";
import {
  getTodayLog,
  toggleExercise,
  toggleMeal,
  logWater,
  logWeight,
} from "../controllers/logController.js";
import DailyLog from "../models/dailyLog.js";
import { KineticEngine } from "../utils/kineticEngine.js";

const router = express.Router();

// Helper to get formatted date string & day name
const getTodayMeta = () => {
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  return { dateString, dayName };
};

// Standard logging endpoints
router.get("/today/:userId", getTodayLog);
router.post("/toggle-exercise", toggleExercise);
router.post("/toggle-meal", toggleMeal);
router.post("/water", logWater);
router.post("/weight", logWeight);

// GET /api/log/analytics/:userId (Unified Habit & Recovery Engine)
// GET /api/log/analytics/:userId
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Find all logs for this user sorted by date
    const logs = await DailyLog.find({ userId }).sort({ dateString: 1, updatedAt: 1 });

    const habitData = KineticEngine.calculateHabitScore(logs);
    const recoveryData = KineticEngine.evaluateRecovery(logs);
    const latestLog = logs[logs.length - 1];

    const weeklyTrend = logs.slice(-7).map((log) => ({
      day: log.dayName ? log.dayName.slice(0, 3) : "Day",
      habitScore:
        log.workoutStatus === "Completed" && log.dietStatus === "Followed"
          ? 100
          : log.workoutStatus === "Completed" || log.dietStatus === "Followed"
          ? 70
          : log.workoutStatus === "Partial" || log.dietStatus === "Mostly"
          ? 50
          : 15,
    }));

    return res.status(200).json({
      success: true,
      logs,
      streak: logs.length,
      weeklyAvgScore: habitData.habitScore,
      habitData,
      recoveryData,
      latestLog,
      weeklyTrend: weeklyTrend.length
        ? weeklyTrend
        : [{ day: "Today", habitScore: habitData.habitScore || 50 }],
    });
  } catch (error) {
    console.error("Analytics pipeline error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to compile analytics.",
    });
  }
});
// POST /api/log/check-in
router.post("/check-in", async (req, res) => {
  try {
    const { userId, weight, workoutStatus, dietStatus, energyLevel, measurements, notes } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const { dateString, dayName } = getTodayMeta();

    const updatedLog = await DailyLog.findOneAndUpdate(
      { userId, dateString },
      {
        $set: {
          userId,
          dateString,
          dayName,
          energyLevel: energyLevel || "Normal",
          workoutStatus: workoutStatus || "Completed",
          dietStatus: dietStatus || "Followed",
          ...(weight ? { weight: Number(weight) } : {}),
          ...(measurements ? { measurements } : {}),
          ...(notes ? { notes } : {}),
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Daily biometrics logged successfully!",
      log: updatedLog,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to log check-in.",
    });
  }
});

export default router;