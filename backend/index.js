import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routers/authRoutes.js";
import userRoutes from "./src/routers/userRoutes.js"
import workoutRoutes from "./src/routers/workoutRoutes.js"
import dietRoutes from "./src/routers/dietRoutes.js"
import logRoutes from "./src/routers/logRoutes.js"

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
  
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workout",workoutRoutes);
app.use("/api/diet",dietRoutes);
app.use("/api/log",logRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "KineticOS backend is running",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
