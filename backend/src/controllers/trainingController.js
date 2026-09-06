import DailyLog from "../models/dailyLog.js";

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
    const todayDate = new Date().toISOString().split("T")[0];

    const log = await DailyLog.findOneAndUpdate(
      { userId, dateString: todayDate },
      {
        $push: {
          completedExercises: {
            name: exerciseName,
            set: Number(setNumber) || 1,
            weight: Number(weight),
            targetReps: Number(targetReps),
            completedReps: Number(completedReps),
            rpe: Number(rpe),
            recommendation: feedback.recommendation,
            nextWeight: feedback.nextWeight,
            loggedAt: new Date()
          }
        }
      },
      { returnDocument: "after", upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Set logged successfully",
      feedback,
      dailyLog: log
    });
  } catch (err) {
    console.error("Progressive Overload Log Error:", err);
    return res.status(500).json({ success: false, message: "Error calculating overload recommendations." });
  }
};

export const getTodayLoggedSets = async (req, res) => {
  try {
    const { userId } = req.params;
    const todayDate = new Date().toISOString().split("T")[0];

    const log = await DailyLog.findOne({ userId, dateString: todayDate });
    return res.status(200).json({
      success: true,
      exercises: log?.completedExercises || []
    });
  } catch (err) {
    console.error("Fetch Logged Sets Error:", err);
    return res.status(500).json({ success: false, message: "Error loading today's logged sets." });
  }
};