import express from "express";
import { completeOnboarding, getUserProfile, getDashboardOverview } from "../controllers/userController.js";
import { getActiveAnnouncement } from "../controllers/Admin/adminController.js";

const router = express.Router();

router.post("/onboarding", completeOnboarding);
router.get("/profile/:userId", getUserProfile);
router.get("/dashboard/:userId", getDashboardOverview);
router.get("/announcement/active", getActiveAnnouncement);

export default router;