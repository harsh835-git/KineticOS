import express from "express";
import { saveWorkoutSession,getRecentWeights } from "../controllers/sessionControllers.js";

const router = express.Router();
router.post("/save", saveWorkoutSession);
router.get("/recent-weights/:userId", getRecentWeights);

export default router;