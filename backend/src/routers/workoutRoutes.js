import express from "express";
import { generateWorkoutPlan, getWorkoutPlan } from "../controllers/workoutController.js";

const router = express.Router();

router.post("/generate", generateWorkoutPlan);
router.get("/:userId", getWorkoutPlan);

export default router;