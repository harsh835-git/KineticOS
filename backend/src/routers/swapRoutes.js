import express from "express";
import { getSwapSuggestions, applySwap } from "../controllers/swapController.js";

const router = express.Router();

router.post("/suggestions", getSwapSuggestions);
router.post("/apply", applySwap);

export default router;