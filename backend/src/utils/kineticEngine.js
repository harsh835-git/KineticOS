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
}


