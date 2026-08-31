import express from "express";
import { saveWorkoutSession } from "../controllers/sessionControllers.js";

const router = express.Router();
router.post("/save", saveWorkoutSession);

export default router;