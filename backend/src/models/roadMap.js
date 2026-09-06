import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema({
  phaseNumber: { type: Number, required: true },
  title: { type: String, required: true }, // e.g., "Hypertrophy Accumulation"
  durationWeeks: { type: Number, default: 4 },
  focus: { type: String, required: true }, // e.g., "Volume & Form Conditioning"
  targetMetric: { type: String, default: "3x10 @ 65-70% 1RM" },
  status: { 
    type: String, 
    enum: ["completed", "in-progress", "upcoming"], 
    default: "upcoming" 
  },
  milestoneMarker: { type: String, default: "Check-in: Body Tape & 1RM test" }
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentWeek: { type: Number, default: 1 },
  totalWeeks: { type: Number, default: 8 },
  phases: [phaseSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Roadmap", roadmapSchema);