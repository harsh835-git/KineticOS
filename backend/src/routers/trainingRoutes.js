import express from "express";
import { logExerciseSet, getTodayLoggedSets } from "../controllers/trainingController.js";

const router = express.Router();

router.post("/log-set", logExerciseSet);
router.get("/today-sets/:userId", getTodayLoggedSets);

export default router;