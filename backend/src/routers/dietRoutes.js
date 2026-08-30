import express from "express";
import { generateDietPlan, getDietPlan } from "../controllers/dietControllers.js"

const router = express.Router();

router.post("/generate", generateDietPlan);
router.get("/:userId", getDietPlan);

export default router;