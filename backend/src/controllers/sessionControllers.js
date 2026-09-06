import WorkoutSession from "../models/workoutSessions.js";
import DailyLog from "../models/dailyLog.js";

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// POST /api/session/save
export const saveWorkoutSession = async (req, res) => {
  try {
    const { userId, dayName, focus, exercises = [], durationMinutes = 0 } = req.body;
    const dateStr = getTodayString();

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    // 1. Save or update the active workout session collection
    const session = await WorkoutSession.findOneAndUpdate(
      { userId, date: dateStr },
      {
        userId,
        date: dateStr,
        dayName: dayName || "Today",
        focus: focus || "Workout",
        exercises,
        durationMinutes,
        isFinished: true,
      },
      { upsert: true, returnDocument: "after" }
    );

    // 2. Map completed sets into the exact shape expected by DailyLog subdocuments
    const setsToLog = [];
    let completedExerciseTypesCount = 0;

    exercises.forEach((ex) => {
      const finishedSets = (ex.sets || []).filter((s) => s.isCompleted);
      if (finishedSets.length > 0) {
        completedExerciseTypesCount += 1;
      }

      finishedSets.forEach((s) => {
        setsToLog.push({
          name: ex.exerciseName,
          set: Number(s.setNumber) || 1,
          weight: Number(s.weightKg) || 0,
          targetReps: Number(s.repsCompleted) || 10,
          completedReps: Number(s.repsCompleted) || 10,
          rpe: 8,
          recommendation: "Completed in Active Session",
          nextWeight: Number(s.weightKg) || 0,
          loggedAt: new Date(),
        });
      });
    });

    // 3. Find today's DailyLog using the correct key: dateString
    let dailyLog = await DailyLog.findOne({ userId, dateString: dateStr });

    if (!dailyLog) {
      dailyLog = new DailyLog({
        userId,
        dateString: dateStr,
        dayName: dayName || "Today",
        completedExercises: [],
      });
    }

    // Append new sets and mark status
    dailyLog.completedExercises.push(...setsToLog);
    dailyLog.workoutStatus = "Completed";

    // 4. Recalculate Habit Score: Workout 50%, Meals 35%, Hydration 15%
    const totalPlanned = exercises.length > 0 ? exercises.length : 1;
    const workoutAdherence = Math.min(completedExerciseTypesCount / totalPlanned, 1);
    const mealAdherence = Math.min((dailyLog.consumedMeals?.length || 0) / 3, 1);
    const waterAdherence = Math.min((dailyLog.waterMl || 0) / (dailyLog.waterTargetMl || 3000), 1);

    dailyLog.habitScore = Math.round(
      workoutAdherence * 50 + mealAdherence * 35 + waterAdherence * 15
    );

    await dailyLog.save();

    return res.status(200).json({
      success: true,
      message: "Session successfully saved and synced to daily log.",
      session,
      dailyLog,
    });
  } catch (error) {
    console.error("Save Session Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};