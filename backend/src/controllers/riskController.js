import DailyLog from "../models/dailyLog.js";

export const evaluateDropoffRisk = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the last 7 calendar days of logs sorted chronologically
    const logs = await DailyLog.find({ userId })
      .sort({ dateString: -1 })
      .limit(7);

    // Default baseline state if user is brand new (< 2 logs)
    if (!logs || logs.length < 2) {
      return res.status(200).json({
        success: true,
        riskScore: 10,
        riskLevel: "Low",
        streakDays: logs.length,
        intervention: null
      });
    }

    let missedWorkouts = 0;
    let highRpeSetsCount = 0;
    let loggedDays = logs.length;
    let totalHabitScore = 0;

    logs.forEach((log) => {
      totalHabitScore += Number(log.habitScore) || 0;

      // Missed workout detection
      if (log.workoutStatus === "Skipped" || log.workoutStatus === "Pending") {
        missedWorkouts += 1;
      }

      // Check for systemic CNS fatigue indicators (sets with RPE >= 9)
      if (Array.isArray(log.completedExercises)) {
        log.completedExercises.forEach((set) => {
          if (Number(set.rpe) >= 9) {
            highRpeSetsCount += 1;
          }
        });
      }
    });

    const avgHabitScore = Math.round(totalHabitScore / loggedDays);

    // Calculate normalized heuristic risk score (0 to 100)
    let computedScore = 0;
    computedScore += missedWorkouts * 18;
    computedScore += (100 - avgHabitScore) * 0.35;
    if (highRpeSetsCount >= 4 && missedWorkouts >= 1) computedScore += 20;

    // Constrain within bounds
    const riskScore = Math.min(100, Math.max(0, Math.round(computedScore)));

    let riskLevel = "Low";
    let intervention = null;

    if (riskScore >= 65 || missedWorkouts >= 3) {
      riskLevel = "High";
      if (highRpeSetsCount >= 3) {
        intervention = {
          type: "FATIGUE_DELOAD",
          title: "Systemic Fatigue Detected",
          description: "High exertion (RPE ≥ 9) combined with skipped workouts indicates CNS overload. Apply an immediate 40% volume reduction taper for 5 days.",
          actionText: "Schedule Deload Week",
          badgeColor: "rose"
        };
      } else {
        intervention = {
          type: "SCHEDULE_COMPRESSION",
          title: "Adherence Friction Warning",
          description: "Multiple missed sessions detected over the last week. Switch from your 5-day split to an adaptive 3-day full-body maintenance routine.",
          actionText: "Switch to 3-Day Split",
          badgeColor: "rose"
        };
      }
    } else if (riskScore >= 35 || missedWorkouts >= 2) {
      riskLevel = "Moderate";
      intervention = {
        type: "MOMENTUM_RESTORE",
        title: "Consistency Slip Detected",
        description: "2 recent sessions were missed. Complete a 15-minute quick-readiness session today to maintain training momentum.",
        actionText: "Log Quick Session",
        badgeColor: "amber"
      };
    }

    return res.status(200).json({
      success: true,
      riskScore,
      riskLevel,
      loggedDays,
      missedWorkouts,
      avgHabitScore,
      intervention
    });
  } catch (error) {
    console.error("Drop-off Risk Evaluation Error:", error);
    return res.status(500).json({ success: false, message: "Failed to evaluate adherence risk." });
  }
};