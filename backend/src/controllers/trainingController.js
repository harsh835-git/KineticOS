import DailyLog from "../models/dailyLog.js";
import WorkoutPlan from "../models/workoutPlan.js";

// Helper: Standardized Local YYYY-MM-DD (Matches logController & sessionController)
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDayName = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
};

export const calculateNextTarget = (currentWeight, targetReps, actualReps, rpe) => {
  const weight = Number(currentWeight) || 0;
  const target = Number(targetReps) || 0;
  const actual = Number(actualReps) || 0;
  const userRpe = Number(rpe) || 8;

  if (actual >= target && userRpe <= 7.5) {
    return {
      nextWeight: weight + 2.5,
      recommendation: "Target achieved with clean reserve. Increment load by +2.5 kg.",
      action: "INCREMENT_LOAD"
    };
  } else if (actual >= target && userRpe <= 9) {
    return {
      nextWeight: weight,
      recommendation: "Target achieved near capacity. Hold weight and aim for +1 rep next session.",
      action: "INCREMENT_VOLUME"
    };
  } else {
    return {
      nextWeight: weight,
      recommendation: "High exertion threshold reached. Maintain current load to solidify motor control.",
      action: "HOLD"
    };
  }
};

export const logExerciseSet = async (req, res) => {
  try {
    const { userId, exerciseName, setNumber, weight, targetReps, completedReps, rpe } = req.body;

    if (!userId || !exerciseName || weight === undefined || !targetReps || !completedReps || !rpe) {
      return res.status(400).json({ success: false, message: "Missing required workout metrics." });
    }

    const feedback = calculateNextTarget(weight, targetReps, completedReps, rpe);
    const dateString = getTodayDateString();

    const setPayload = {
      name: exerciseName,
      exerciseName: exerciseName,
      set: Number(setNumber) || 1,
      setNumber: Number(setNumber) || 1,
      weight: Number(weight),
      weightKg: Number(weight),
      targetReps: Number(targetReps),
      completedReps: Number(completedReps),
      repsCompleted: Number(completedReps),
      rpe: Number(rpe),
      recommendation: feedback.recommendation,
      nextWeight: feedback.nextWeight,
      loggedAt: new Date()
    };

    const log = await DailyLog.findOneAndUpdate(
      { userId, dateString },
      {
        $push: { completedExercises: setPayload },
        $set: { workoutStatus: "In Progress" }
      },
      { returnDocument: "after", upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Set logged successfully",
      feedback,
      dailyLog: log,
      exercises: log.completedExercises
    });
  } catch (err) {
    console.error("Progressive Overload Log Error:", err);
    return res.status(500).json({ success: false, message: "Error calculating overload recommendations." });
  }
};

export const getTodayLoggedSets = async (req, res) => {
  try {
    const { userId } = req.params;
    const dateString = getTodayDateString();

    const log = await DailyLog.findOne({ userId, dateString });

    return res.status(200).json({
      success: true,
      exercises: log?.completedExercises || []
    });
  } catch (err) {
    console.error("Fetch Logged Sets Error:", err);
    return res.status(500).json({ success: false, message: "Error loading today's logged sets." });
  }
};

export const applyIntervention = async (req, res) => {
  try {
    const { userId, interventionType } = req.body;

    if (!userId || !interventionType) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    const todayDate = getTodayDateString();
    const currentDayName = getTodayDayName();

    const workoutPlan = await WorkoutPlan.findOne({ userId });
    if (!workoutPlan || !workoutPlan.schedule || workoutPlan.schedule.length === 0) {
      return res.status(404).json({ success: false, message: "Workout plan not found." });
    }

    // Case-insensitive lookup with fallback to day 0
    let todayDayIndex = workoutPlan.schedule.findIndex(
      (d) => d.dayName && d.dayName.toLowerCase() === currentDayName.toLowerCase()
    );

    if (todayDayIndex === -1) {
      todayDayIndex = 0;
    }

    let modifiedSchedule = [...workoutPlan.schedule];
    let interventionMessage = "";

    if (interventionType === "MOMENTUM_RESTORE") {
      const baseExercises = modifiedSchedule[todayDayIndex].exercises || [];
      const trimmedExercises = baseExercises.slice(0, 2).map((ex) => ({
        ...ex,
        sets: Math.min(ex.sets || 3, 2),
        notes: "Quick momentum session: Focused effort, controlled tempo."
      }));

      modifiedSchedule[todayDayIndex].exercises = trimmedExercises;
      modifiedSchedule[todayDayIndex].sessionTitle = `Quick Readiness: ${modifiedSchedule[todayDayIndex].sessionTitle || "Compound Lifts"}`;
      interventionMessage = "Workout trimmed to a 15-minute quick-readiness session.";
    } 
    else if (interventionType === "FATIGUE_DELOAD") {
      modifiedSchedule = modifiedSchedule.map((day) => ({
        ...day,
        exercises: (day.exercises || []).map((ex) => ({
          ...ex,
          sets: Math.max(1, Math.round((ex.sets || 3) * 0.6)),
          targetRpe: Math.min(ex.targetRpe || 8, 6.5),
          notes: "Active Deload: 40% volume reduction to reset CNS."
        }))
      }));
      interventionMessage = "Deload applied: 40% volume taper activated.";
    } 
    else if (interventionType === "SCHEDULE_COMPRESSION") {
      const allowedDays = ["Monday", "Wednesday", "Friday"];
      modifiedSchedule = modifiedSchedule.map((day) => {
        if (!allowedDays.includes(day.dayName)) {
          return { ...day, isRestDay: true, exercises: [] };
        }
        return day;
      });
      interventionMessage = "Schedule adjusted: Shifted to a compressed 3-day split.";
    }

    workoutPlan.schedule = modifiedSchedule;
    await workoutPlan.save();

    await DailyLog.findOneAndUpdate(
      { userId, dateString: todayDate },
      { $set: { notes: `Intervention active: ${interventionType}` } },
      { returnDocument: "after", upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: interventionMessage,
      updatedTodayWorkout: modifiedSchedule[todayDayIndex],
      fullPlan: workoutPlan
    });
  } catch (error) {
    console.error("Apply Intervention Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to adjust workout." });
  }
};