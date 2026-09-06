import express from "express";
import { getRoadmap } from "../controllers/roadmapController.js";

const router = express.Router();
router.get("/:userId", getRoadmap);
export default router;