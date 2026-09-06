import express from "express";
import { logExerciseSet, getTodayLoggedSets,applyIntervention } from "../controllers/trainingController.js";

const router = express.Router();

router.post("/log-set", logExerciseSet);
router.get("/today-sets/:userId", getTodayLoggedSets);
router.post("/apply-intervention", applyIntervention);

export default router;