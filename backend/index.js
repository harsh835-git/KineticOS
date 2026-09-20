import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routers/authRoutes.js";
import userRoutes from "./src/routers/userRoutes.js";
import workoutRoutes from "./src/routers/workoutRoutes.js";
import dietRoutes from "./src/routers/dietRoutes.js";
import logRoutes from "./src/routers/logRoutes.js";
import swapRoutes from "./src/routers/swapRoutes.js";
import coachRoutes from "./src/routers/coachRoutes.js";
import sessionRoutes from "./src/routers/sessionRoutes.js";
import planRoutes from "./src/routers/planRoutes.js";
import roadmapRoutes from "./src/routers/roadmapRoutes.js";
import trainingRoutes from "./src/routers/trainingRoutes.js";
import riskRoutes from "./src/routers/riskRoutes.js";
import { submitContactMessage } from "./src/controllers/contactController.js";

import adminRoutes from "./src/routers/Admin/adminRoutes.js";
import { getActiveAnnouncement } from "./src/controllers/Admin/adminController.js";

dotenv.config();

const app = express();

// Normalize origins and support both local dev and production client domains
const allowedOrigins = [
  "http://localhost:5173",
  "https://kinetic-os-ten.vercel.app",
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, mobile, or server health checks)
      if (!origin) return callback(null, true);

      // Clean trailing slashes if present in the incoming origin header
      const formattedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(formattedOrigin)) {
        return callback(null, true);
      }

      // Pass null, false instead of throwing a raw Error to prevent server crashes
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/log", logRoutes);
app.use("/api/swap", swapRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/roadMap", roadmapRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/risk", riskRoutes);
app.post("/api/contact", submitContactMessage);
app.get("/api/announcements/active", getActiveAnnouncement);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Root health-check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "KineticOS backend is running",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Bind to 0.0.0.0 for containerized/cloud platform compatibility
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });