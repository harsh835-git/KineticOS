import { GoogleGenAI } from "@google/genai";
import User from "../models/user.js";
import WorkoutPlan from "../models/workoutPlan.js";
import DietPlan from "../models/dietPlan.js";

const apiKey = process.env.GEMINI_API_KEY;

export const chatWithCoach = async (req, res) => {
  try {
    const { userId, message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // Fetch user context
    const user = await User.findById(userId);
    const profile = user?.profile || {};

    const [workoutPlan, dietPlan] = await Promise.all([
      WorkoutPlan.findOne({ userId }),
      DietPlan.findOne({ userId }),
    ]);

    const systemContext = `
You are "Kinetic Coach", an elite, empathetic, and evidence-based strength coach and sports nutritionist built into KineticOS.
You provide concise, actionable, and science-backed answers.

User Biometric Context:
- Name: ${user?.name || "Athlete"}
- Primary Goal: ${profile.primaryGoal || "General Fitness"}
- Experience Level: ${profile.experienceLevel || "Intermediate"}
- Diet Preference: ${profile.dietaryPreference || "Non-Vegetarian"}
- Current Weight: ${profile.currentWeight || "N/A"} kg | Target Weight: ${profile.targetWeight || "N/A"} kg
- Daily Calorie Target: ${profile.targetCalories || 2000} kcal (Maintenance: ${profile.maintenanceCalories || 2500} kcal)
- BMI: ${profile.bmi || "N/A"}

Guidelines:
1. Always align advice with their goal (${profile.primaryGoal}) and dietary preference (${profile.dietaryPreference}).
2. Keep responses focused, encouraging, and easy to read (use short bullet points when necessary).
3. If they ask to substitute an exercise, modify sets, or ask about meal adjustments, give direct and practical instructions.
4. Keep answers under 3-4 short paragraphs unless depth is explicitly requested.
`;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        reply: "Kinetic Coach is currently offline. Please verify that your GEMINI_API_KEY is configured in your backend environment.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for context
    const formattedHistory = (history || [])
      .slice(-6)
      .map((msg) => `${msg.sender === "user" ? "User" : "Coach"}: ${msg.text}`)
      .join("\n");

    const prompt = `
${systemContext}

Previous Conversation:
${formattedHistory}

User: ${message}
Coach:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const reply = response.text ? response.text.trim() : "I'm here to help optimize your training and nutrition. What's on your mind?";

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Coach Chat Error:", error);
    return res.status(200).json({
      success: true,
      reply: "I'm experiencing a brief calibration delay. In the meantime, stick to your hydration target and keep your form strict on your primary lifts!",
    });
  }
};