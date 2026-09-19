import express from "express";
import { verifyToken, verifyAdmin } from "../../middlewares/authMiddlewares.js";
import {
  getAdminMetrics,
  updateUserRole,
  getUserDetails,

  getWorkoutTemplates,
  createWorkoutTemplate,
  deleteWorkoutTemplate,

  
  getDietTemplates,
  createDietTemplate,
  deleteDietTemplate,

  toggleBlockUser,
  deleteUser,
  

markMessageAsRead,
  deleteContactMessage,
  replyToContactMessage,

  assignTemplateToUser,
  deleteUserWorkoutPlan,

  getAnnouncements,
  createAnnouncement,
  toggleAnnouncementStatus,
  deleteAnnouncement,
  getActiveAnnouncement,

  assignDietTemplateToUser,
  deleteUserDietPlan,
} from "../../controllers/Admin/adminController.js";

const router = express.Router();

// Apply auth & admin middlewares to all routes in this file
router.use(verifyToken, verifyAdmin);

router.get("/metrics", getAdminMetrics);
router.patch("/users/role", updateUserRole);
router.get("/users/:id", getUserDetails);


router.get("/templates", getWorkoutTemplates);
router.post("/templates", createWorkoutTemplate);
router.delete("/templates/:id", deleteWorkoutTemplate);

router.get("/diet-templates", getDietTemplates);
router.post("/diet-templates", createDietTemplate);
router.delete("/diet-templates/:id", deleteDietTemplate);

router.patch("/users/:userId/block", toggleBlockUser);
router.delete("/users/:userId", deleteUser);


// Contact Inquiries Routes
router.patch("/contact/:id/read", markMessageAsRead);
router.post("/contact/:id/reply", replyToContactMessage);
router.delete("/contact/:id", deleteContactMessage);

// Add template assignment endpoint:
router.post("/users/:userId/assign-template", assignTemplateToUser);
router.delete("/users/:userId/workout-plan", deleteUserWorkoutPlan);

// Admin broadcast management
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:id/toggle", toggleAnnouncementStatus);
router.delete("/announcements/:id", deleteAnnouncement);

router.post("/users/:userId/assign-diet", assignDietTemplateToUser);
router.delete("/users/:userId/diet-plan", deleteUserDietPlan);


export default router;