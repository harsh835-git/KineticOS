export class KineticEngine {
  /**
   * Calculates points for a single log entry: (Workout * 0.60) + (Diet * 0.40)
   */
  static getDailyScore(log) {
    if (!log) return 0;

    let workoutPts = 0;
    if (log.workoutStatus === "Completed") workoutPts = 100;
    else if (log.workoutStatus === "Partial") workoutPts = 50;

    let dietPts = 20;
    if (log.dietStatus === "Followed") dietPts = 100;
    else if (log.dietStatus === "Mostly") dietPts = 60;

    return Math.round(workoutPts * 0.6 + dietPts * 0.4);
  }

  /**
   * 14-day rolling window habit adherence computation
   */
  static calculateHabitScore(logs = []) {
    if (!logs || !logs.length) {
      return { habitScore: 0, workoutAdherence: 0, dietAdherence: 0, dropOffRisk: false };
    }

    // Sort ascending (oldest to newest) to process rolling window and streaks accurately
    const sortedAsc = [...logs].sort((a, b) => {
      const dateA = new Date(a.dateString || a.createdAt || a.updatedAt);
      const dateB = new Date(b.dateString || b.createdAt || b.updatedAt);
      return dateA - dateB;
    });

    // Grab the most recent 14 calendar records
    const recentLogs = sortedAsc.slice(-14);
    let workoutPoints = 0;
    let dietPoints = 0;
    let consecutiveMissed = 0;

    recentLogs.forEach((log) => {
      if (log.workoutStatus === "Completed") {
        workoutPoints += 100;
        consecutiveMissed = 0;
      } else if (log.workoutStatus === "Partial") {
        workoutPoints += 50;
        consecutiveMissed = 0;
      } else {
        consecutiveMissed++;
      }

      if (log.dietStatus === "Followed") {
        dietPoints += 100;
      } else if (log.dietStatus === "Mostly") {
        dietPoints += 60;
      } else {
        dietPoints += 20;
      }
    });

    const workoutAdherence = Math.round(workoutPoints / recentLogs.length);
    const dietAdherence = Math.round(dietPoints / recentLogs.length);
    const habitScore = Math.round(workoutAdherence * 0.6 + dietAdherence * 0.4);
    const dropOffRisk = consecutiveMissed >= 3 || dietAdherence < 40;

    return {
      habitScore: Math.min(100, Math.max(0, habitScore)),
      workoutAdherence,
      dietAdherence,
      dropOffRisk,
    };
  }

  /**
   * 7-day fatigue monitoring and recovery state evaluation
   */
  static evaluateRecovery(logs = []) {
    if (!logs || !logs.length) {
      return {
        latestEnergy: "Normal",
        fatigueCount: 0,
        forceRecoveryDay: false,
        guidance: "Optimal metabolic readiness cleared.",
      };
    }

    // Sort descending (newest first)
    const sortedDesc = [...logs].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.dateString || a.createdAt);
      const dateB = new Date(b.updatedAt || b.dateString || b.createdAt);
      return dateB - dateA;
    });

    const latestLog = sortedDesc[0];
    const latestEnergy = latestLog?.energyLevel || "Normal";

    // 7-day fatigue window
    const last7Logs = sortedDesc.slice(0, 7);
    const fatigueFlags = ["Fatigued", "Exhausted", "Slightly Fatigued", "Very Tired"];
    const fatigueCount = last7Logs.filter((l) => fatigueFlags.includes(l.energyLevel)).length;

    const forceRecoveryDay = fatigueCount >= 3;

    let guidance = "Standard loading cleared.";
    if (forceRecoveryDay) {
      guidance = "Recovery threshold reached (3+ fatigue flags). Heavy lifts swapped for mobility & tissue recovery.";
    } else if (latestEnergy === "Exhausted" || latestEnergy === "Very Tired") {
      guidance = "Central fatigue detected: Reduce working volume by 20% today.";
    } else if (latestEnergy === "Fatigued" || latestEnergy === "Slightly Fatigued") {
      guidance = "Mild recovery lag: Maintain hydration and monitor intra-set rest times.";
    } else if (latestEnergy === "Energized") {
      guidance = "Peak nervous system readiness: Clear for progressive overload attempt.";
    }

    return {
      latestEnergy,
      fatigueCount,
      forceRecoveryDay,
      guidance,
    };
  }


  /**
   * Modulates workout exercises dynamically based on recovery status.
   * If forced recovery or high fatigue is active, reduce volume and mark recovery tags.
   */
  static modulateWorkout(exercises = [], recoveryData = {}) {
    if (!exercises || !exercises.length) return [];

    const isForced = recoveryData.forceRecoveryDay;
    const isFatigued =
      recoveryData.latestEnergy === "Exhausted" ||
      recoveryData.latestEnergy === "Very Tired";

    if (!isForced && !isFatigued) {
      return exercises.map((ex) => ({
        ...ex,
        isModulated: false,
        displaySets: ex.sets,
        displayReps: ex.reps,
      }));
    }

    return exercises.map((ex) => {
      const originalSets = parseInt(ex.sets, 10) || 3;
      // Halve sets on forced recovery (min 1-2 sets), reduce by 1 on moderate fatigue
      const reducedSets = isForced
        ? Math.max(1, Math.floor(originalSets / 2))
        : Math.max(2, originalSets - 1);

      return {
        ...ex,
        isModulated: true,
        originalSets: ex.sets,
        displaySets: `${reducedSets}`,
        displayReps: isForced ? "10-12 (RPE 6 Active Flush)" : ex.reps,
        modulationTag: isForced ? "Deload Active" : "Volume Scaled -20%",
      };
    });
  }

  /**
   * Forecasts the projected completion date based on goal delta, caloric deficit/surplus,
   * and habit adherence velocity.
   */
  static forecastGoalDate(profile = {}, logs = [], habitScore = 80) {
    const currentWeight = Number(profile.currentWeight) || 65;
    const targetWeight = Number(profile.targetWeight) || currentWeight;
    const weightDiff = Math.abs(currentWeight - targetWeight);

    // Goal already reached or no target variance
    if (weightDiff <= 0.2) {
      return "Goal Met";
    }

    // 1 kg of fat mass ≈ 7700 kcal
    const targetCalories = Number(profile.targetCalories) || 2860;
    const maintenanceCalories = Number(profile.maintenanceCalories) || 2560;
    const dailyDelta = Math.abs(targetCalories - maintenanceCalories);

    // Minimum baseline progress rate if calories are at maintenance (0.25 kg/week)
    const baseDaysNeeded = dailyDelta > 100
      ? (weightDiff * 7700) / dailyDelta
      : (weightDiff / 0.25) * 7;

    // Adherence factor: Lower adherence velocity extends the projected timeline
    const velocityFactor = habitScore > 0 ? 100 / Math.max(30, habitScore) : 1.5;
    const projectedDays = Math.round(baseDaysNeeded * velocityFactor);

    // Compute future calendar date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + projectedDays);

    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  /**
   * Computes a dynamic daily hydration goal based on activity and fatigue.
   */
  static calculateHydrationTarget(workoutStatus = "Pending", energyLevel = "Normal") {
    let target = 3000;

    if (workoutStatus === "Completed") {
      target += 500;
    }

    const highFatigueFlags = ["Fatigued", "Exhausted", "Very Tired", "Slightly Fatigued"];
    if (highFatigueFlags.includes(energyLevel)) {
      target += 250;
    }

    return target;
  }

  /**
   * Analyzes trailing logs to detect habit drop-off risk.
   * Triggers an intervention if adherence slips or multiple days are skipped.
   */
  static assessDropOffRisk(logs = [], habitScore = 0) {
    if (!logs || logs.length === 0) {
      return { isAtRisk: false, reason: null, interventionType: null };
    }

    const last3Logs = logs.slice(-3);
    const consecutiveMissedWorkouts = last3Logs.filter(
      (l) => l.workoutStatus === "Skipped" || (l.completedExercises && l.completedExercises.length === 0)
    ).length;

    // Trigger condition 1: Low adherence velocity
    if (habitScore > 0 && habitScore < 45) {
      return {
        isAtRisk: true,
        reason: "Adherence velocity dropped below 45%",
        interventionType: "VOLUME_RESET",
        actionText: "Activate Emergency 15-Minute Micro-Workout",
      };
    }

    // Trigger condition 2: 2+ missed workouts in a row
    if (consecutiveMissedWorkouts >= 2) {
      return {
        isAtRisk: true,
        reason: "Multiple consecutive training sessions missed",
        interventionType: "STREAK_SHIELD",
        actionText: "Claim Streak Freeze & Scale Down Plan",
      };
    }

    return { isAtRisk: false, reason: null, interventionType: null };
  }
}


