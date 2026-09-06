// backend/src/routers/logRoutes.js
import express from "express";
import {
  getTodayLog,
  toggleExercise,
  toggleMeal,
  logWater,
  logWeight,
  logBodyMeasurements
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
router.post("/measurements", logBodyMeasurements);

// GET /api/log/analytics/:userId
// GET /api/log/analytics/:userId
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await DailyLog.find({ userId }).sort({ dateString: 1 });

    const habitData = KineticEngine.calculateHabitScore(logs);
    const recoveryData = KineticEngine.evaluateRecovery(logs);

    const latestLog = logs.length ? logs[logs.length - 1] : null;
    const last7Logs = logs.slice(-7);

    // Compute dynamic goal forecast
    const goalForecastDate = KineticEngine.forecastGoalDate(
      {
        currentWeight: latestLog?.loggedWeight || latestLog?.weight,
        targetWeight: 50,
        targetCalories: 2860,
        maintenanceCalories: 2560,
      },
      logs,
      habitData.habitScore
    );

    // Calculate daily tonnage and grand cumulative total
    let totalWeeklyTonnage = 0;

    const weeklyTrend = last7Logs.map((log) => {
      let dayTonnage = 0;

      if (Array.isArray(log.completedExercises)) {
        log.completedExercises.forEach((ex) => {
          const w = Number(ex.weight ?? ex.weightKg ?? 0);
          const r = Number(ex.completedReps ?? ex.repsCompleted ?? ex.targetReps ?? 10);
          dayTonnage += w * r;
        });
      }

      totalWeeklyTonnage += dayTonnage;

      return {
        dateString: log.dateString,
        day: log.dayName ? log.dayName.slice(0, 3) : "Day",
        habitScore: KineticEngine.getDailyScore(log),
        tonnage: dayTonnage, // 👈 Required for AreaChart dataKey="tonnage"
      };
    });

    const riskAssessment = KineticEngine.assessDropOffRisk(logs, habitData.habitScore);

    return res.status(200).json({
      success: true,
      logs,
      streak: logs.length,
      weeklyAvgScore: habitData.habitScore,
      habitData,
      riskAssessment,
      recoveryData,
      goalForecastDate,
      totalWeeklyTonnage, // 👈 Required for the top-right badge
      weeklyTrend: weeklyTrend.length
        ? weeklyTrend
        : [{ day: "Today", habitScore: habitData.habitScore || 0, tonnage: 0 }],
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;