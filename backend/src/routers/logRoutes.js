import express from "express";
import {
  getTodayLog,
  toggleExercise,
  toggleMeal,
  logWater,
  getWeeklyAnalytics,
  logWeight,
} from "../controllers/logController.js";

const router = express.Router();

router.get("/today/:userId", getTodayLog);
router.get("/analytics/:userId", getWeeklyAnalytics);
router.post("/toggle-exercise", toggleExercise);
router.post("/toggle-meal", toggleMeal);
router.post("/water", logWater);
router.post("/weight", logWeight);

export default router;