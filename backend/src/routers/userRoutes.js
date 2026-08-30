import express from "express";
import { completeOnboarding, getUserProfile, getDashboardOverview } from "../controllers/userController.js";

const router = express.Router();

router.post("/onboarding", completeOnboarding);
router.get("/profile/:userId", getUserProfile);
router.get("/dashboard/:userId", getDashboardOverview);

export default router;