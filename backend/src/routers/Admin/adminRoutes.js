import express from "express";
import { verifyToken, verifyAdmin } from "../../middlewares/authMiddlewares.js";
import {
  getAdminMetrics,
  updateUserRole,
  getWorkoutTemplates,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
} from "../../controllers/Admin/adminController.js";

const router = express.Router();

// Apply auth & admin middlewares to all routes in this file
router.use(verifyToken, verifyAdmin);

router.get("/metrics", getAdminMetrics);
router.patch("/users/role", updateUserRole);

// MUST BE HERE:
router.get("/templates", getWorkoutTemplates);
router.post("/templates", createWorkoutTemplate);
router.delete("/templates/:id", deleteWorkoutTemplate);

export default router;