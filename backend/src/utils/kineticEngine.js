// backend/src/utils/kineticEngine.js

export class KineticEngine {
  static calculateHabitScore(logs = []) {
    if (!logs || !logs.length) {
      return { habitScore: 0, workoutAdherence: 0, dietAdherence: 0, dropOffRisk: false };
    }

    const recentLogs = logs.slice(-14);
    let workoutPoints = 0;
    let dietPoints = 0;
    let consecutiveMissed = 0;

    recentLogs.forEach((log) => {
      // Workout points
      if (log.workoutStatus === "Completed") {
        workoutPoints += 100;
        consecutiveMissed = 0;
      } else if (log.workoutStatus === "Partial") {
        workoutPoints += 50;
        consecutiveMissed = 0;
      } else {
        consecutiveMissed++;
      }

      // Diet points
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
static evaluateRecovery(logs = []) {
    if (!logs || !logs.length) {
      return {
        latestEnergy: "Normal",
        fatigueCount: 0,
        forceRecoveryDay: false,
        guidance: "Optimal metabolic readiness cleared.",
      };
    }

    // Always sort by date / updatedAt descending to ensure index 0 is the newest
    const sortedLogs = [...logs].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.dateString || a.createdAt);
      const dateB = new Date(b.updatedAt || b.dateString || b.createdAt);
      return dateB - dateA;
    });

    const latestLog = sortedLogs[0];
    const latestEnergy = latestLog?.energyLevel || "Normal";

    // Check rolling 7 days for fatigue accumulation
    const last7Logs = sortedLogs.slice(0, 7);
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
}