import WorkoutSession from "../models/workoutSessions.js";
import DailyLog from "../models/dailyLog.js";

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Overload calculator
const calculateNextLoadTarget = (weight, reps, rpe = 8) => {
  const load = Number(weight) || 0;
  const userRpe = Number(rpe) || 8;

  if (userRpe <= 7.5) {
    return {
      nextWeight: load > 0 ? load + 2.5 : 2.5,
      recommendation: "Exceeded target with reserve. +2.5 kg next session.",
      status: "INCREMENT"
    };
  } else if (userRpe <= 8.5) {
    return {
      nextWeight: load,
      recommendation: "Target achieved near threshold. Maintain load & build reps.",
      status: "HOLD_VOLUME"
    };
  } else {
    return {
      nextWeight: load,
      recommendation: "High exertion threshold reached. Solidify current load.",
      status: "RECOVERY"
    };
  }
};

// POST /api/session/save
export const saveWorkoutSession = async (req, res) => {
  try {
    const { userId, dayName, focus, exercises = [], durationMinutes = 0 } = req.body;
    const dateStr = getTodayString();

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    // 1. Persist active workout session
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

    // 2. Metrics calculation
    const setsToLog = [];
    let totalTonnage = 0;
    let completedSetsCount = 0;
    let completedExerciseTypesCount = 0;
    const exerciseOverloadSummary = [];

    exercises.forEach((ex) => {
      const finishedSets = (ex.sets || []).filter((s) => s.isCompleted);
      if (finishedSets.length > 0) completedExerciseTypesCount++;

      let maxLoad = 0;
      let lastReps = 10;

      finishedSets.forEach((s) => {
        const w = Number(s.weightKg) || 0;
        const r = Number(s.repsCompleted) || 10;
        totalTonnage += w * r;
        completedSetsCount++;
        if (w > maxLoad) maxLoad = w;
        lastReps = r;

        setsToLog.push({
          name: ex.exerciseName,
          exerciseName: ex.exerciseName,
          set: Number(s.setNumber) || 1,
          setNumber: Number(s.setNumber) || 1,
          weight: w,
          weightKg: w,
          targetReps: r,
          completedReps: r,
          repsCompleted: r,
          rpe: 8,
          recommendation: "Logged from Active Session",
          nextWeight: w,
          loggedAt: new Date(),
        });
      });

      if (finishedSets.length > 0) {
        const target = calculateNextLoadTarget(maxLoad, lastReps, 8);
        exerciseOverloadSummary.push({
          exerciseName: ex.exerciseName,
          setsDone: finishedSets.length,
          topWeight: maxLoad,
          nextWeight: target.nextWeight,
          recommendation: target.recommendation,
          status: target.status
        });
      }
    });

    // 3. Find or create today's DailyLog
    let dailyLog = await DailyLog.findOne({ userId, dateString: dateStr });
    if (!dailyLog) {
      dailyLog = new DailyLog({
        userId,
        dateString: dateStr,
        dayName: dayName || "Today",
        completedExercises: [],
      });
    }

    // Append sets and complete workout
    dailyLog.completedExercises.push(...setsToLog);
    dailyLog.workoutStatus = "Completed";

    // 4. Update adherence score (Workout 50%, Meals 35%, Hydration 15%)
    const totalPlanned = exercises.length > 0 ? exercises.length : 1;
    const workoutAdherence = Math.min(completedExerciseTypesCount / totalPlanned, 1);
    const mealAdherence = Math.min((dailyLog.consumedMeals?.length || 0) / 3, 1);
    const waterAdherence = Math.min((dailyLog.waterMl || 0) / (dailyLog.waterTargetMl || 3000), 1);

    dailyLog.habitScore = Math.round(
      workoutAdherence * 50 + mealAdherence * 35 + waterAdherence * 15
    );

    await dailyLog.save();

    const summary = {
      totalTonnage,
      completedSetsCount,
      durationMinutes: Math.max(durationMinutes, 1),
      density: Math.round(totalTonnage / Math.max(durationMinutes, 1)),
      habitScore: dailyLog.habitScore,
      exerciseProgressions: exerciseOverloadSummary,
    };

    return res.status(200).json({
      success: true,
      message: "Session logged successfully.",
      session,
      dailyLog,
      summary,
    });
  } catch (error) {
    console.error("Save Session Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};