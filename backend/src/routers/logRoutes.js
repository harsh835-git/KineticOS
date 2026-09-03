// backend/src/routers/logRoutes.js
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

const getTodayMeta = () => {
  const now = new Date();
  const dateString = now.toISOString().split("T")[0];
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  return { dateString, dayName };
};

router.get("/today/:userId", getTodayLog);
router.post("/toggle-exercise", toggleExercise);
router.post("/toggle-meal", toggleMeal);
router.post("/water", logWater);
router.post("/weight", logWeight);

// GET /api/log/analytics/:userId
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await DailyLog.find({ userId }).sort({ dateString: 1 });

    const habitData = KineticEngine.calculateHabitScore(logs);
    const recoveryData = KineticEngine.evaluateRecovery(logs);

    const weeklyTrend = logs.slice(-7).map((log) => ({
      day: log.dayName ? log.dayName.slice(0, 3) : "Day",
      habitScore:
        log.workoutStatus === "Completed" && log.dietStatus === "Followed"
          ? 100
          : log.workoutStatus === "Completed" || log.dietStatus === "Followed"
          ? 75
          : log.workoutStatus === "Partial" || log.dietStatus === "Mostly"
          ? 50
          : 20,
    }));

    return res.status(200).json({
      success: true,
      logs,
      streak: logs.length,
      weeklyAvgScore: habitData.habitScore,
      habitData,
      recoveryData,
      weeklyTrend: weeklyTrend.length ? weeklyTrend : [{ day: "Today", habitScore: habitData.habitScore }],
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/log/check-in
router.post("/check-in", async (req, res) => {
  try {
    const { userId, weight, workoutStatus, dietStatus, energyLevel, measurements, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
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
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;