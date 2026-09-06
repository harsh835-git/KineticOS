import express from "express";
import { evaluateDropoffRisk } from "../controllers/riskController.js";

const router = express.Router();

router.get("/status/:userId", evaluateDropoffRisk);

export default router;