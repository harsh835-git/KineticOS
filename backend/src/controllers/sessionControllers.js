import WorkoutSession from "../models/workoutSessions.js";
import DailyLog from "../models/dailyLog.js";

const getTodayString = () => new Date().toISOString().split("T")[0];

// POST /api/session/save
export const saveWorkoutSession = async (req, res) => {
  try {
    const { userId, dayName, focus, exercises, durationMinutes } = req.body;
    const dateStr = getTodayString();

    const session = await WorkoutSession.findOneAndUpdate(
      { userId, date: dateStr },
      {
        userId,
        date: dateStr,
        dayName,
        focus,
        exercises,
        durationMinutes,
        isFinished: true,
      },
      { upsert: true, new: true }
    );

    // Sync completed exercise names to DailyLog for habit score computation
    const completedExerciseNames = exercises
      .filter((ex) => ex.sets.some((s) => s.isCompleted))
      .map((ex) => ex.exerciseName);

    let dailyLog = await DailyLog.findOne({ userId, date: dateStr });
    if (dailyLog) {
      dailyLog.completedExercises = Array.from(
        new Set([...dailyLog.completedExercises, ...completedExerciseNames])
      );
      // Recalculate score (Workout 50%, Meals 35%, Hydration 15%)
      const workoutAdherence =
        exercises.length > 0
          ? Math.min(dailyLog.completedExercises.length / exercises.length, 1)
          : 1;
      const mealAdherence = Math.min((dailyLog.consumedMeals?.length || 0) / 3, 1);
      const waterAdherence = Math.min((dailyLog.waterMl || 0) / 3000, 1);
      dailyLog.habitScore = Math.round(
        workoutAdherence * 50 + mealAdherence * 35 + waterAdherence * 15
      );
      await dailyLog.save();
    }

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Save Session Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};