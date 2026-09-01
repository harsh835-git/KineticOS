// backend/src/utils/kineticEngine.js

export class KineticEngine {
  /**
   * Safety Calorie Floor Enforcement
   * Men >= 1500 kcal | Women >= 1200 kcal
   */
  static applySafetyFloor(calories, biologicalSex = "male") {
    const floor = biologicalSex.toLowerCase() === "female" ? 1200 : 1500;
    return Math.max(floor, Math.round(calories));
  }

  /**
   * Habit Intelligence Engine
   * Formula: (Workout Adherence * 0.60) + (Diet Adherence * 0.40)
   * Scale: 0 - 100
   */
  static calculateHabitScore(logs = []) {
    if (!logs || !logs.length) {
      return { habitScore: 0, workoutAdherence: 0, dietAdherence: 0, dropOffRisk: false };
    }

    const recentLogs = logs.slice(-14);
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
   * Energy & Recovery Intelligence
   * Daily 4-state check-in & forced recovery threshold (3 flags in 7 days)
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

    const last7Logs = logs.slice(-7);
    const fatigueCount = last7Logs.filter(
      (l) => l.energyLevel === "Slightly Fatigued" || l.energyLevel === "Very Tired"
    ).length;

    const forceRecoveryDay = fatigueCount >= 3;
    const latestEnergy = logs[logs.length - 1]?.energyLevel || "Normal";

    let guidance = "Standard loading cleared.";
    if (forceRecoveryDay) {
      guidance = "Recovery threshold reached (3+ fatigue flags). Heavy lifts swapped for mobility & tissue recovery.";
    } else if (latestEnergy === "Very Tired") {
      guidance = "Fatigue flag active: Reduce working volume by 20% today.";
    }

    return {
      latestEnergy,
      fatigueCount,
      forceRecoveryDay,
      guidance,
    };
  }

  /**
   * Dynamic Goal Timeline Forecast Engine
   * Formula: Weeks = (Goal Weight - Current Weight) / Avg Weekly Change
   */
  static forecastTimeline(currentWeight, goalWeight, logs = []) {
    const validLogs = logs.filter((l) => typeof l.weight === "number" && l.weight > 0);

    if (validLogs.length < 2 || !goalWeight || !currentWeight) {
      return {
        projectedDate: "Collecting log baseline...",
        weeklyRate: 0,
        weeksRemaining: null,
      };
    }

    const firstLog = validLogs[0];
    const lastLog = validLogs[validLogs.length - 1];
    const daysDelta = Math.max(
      1,
      (new Date(lastLog.createdAt || lastLog.dateString) - new Date(firstLog.createdAt || firstLog.dateString)) /
        (1000 * 60 * 60 * 24)
    );

    const totalWeightDiff = lastLog.weight - firstLog.weight;
    const weeklyRate = (totalWeightDiff / daysDelta) * 7;
    const deltaRemaining = goalWeight - currentWeight;

    if ((deltaRemaining < 0 && weeklyRate >= 0) || (deltaRemaining > 0 && weeklyRate <= 0)) {
      return {
        projectedDate: "Trajectory recalibration needed",
        weeklyRate: Number(weeklyRate.toFixed(2)),
        weeksRemaining: null,
      };
    }

    const weeksRemaining = Math.max(1, Math.round(Math.abs(deltaRemaining / weeklyRate)));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeksRemaining * 7);

    return {
      projectedDate: targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      weeklyRate: Number(weeklyRate.toFixed(2)),
      weeksRemaining,
    };
  }

  /**
   * Smart Plan Adjustment & Progressive Overload Engine
   */
  static runWeeklyAudit(profile, currentPlan, logs = []) {
    const habit = this.calculateHabitScore(logs);
    const recovery = this.evaluateRecovery(logs);
    const adjustments = [];

    let targetCalories = currentPlan?.targetCalories || 2000;
    let volumeScale = 1.0;

    const validLogs = logs.filter((l) => typeof l.weight === "number" && l.weight > 0);
    if (validLogs.length >= 7) {
      const recentRate = validLogs[validLogs.length - 1].weight - validLogs[validLogs.length - 7].weight;

      if (profile.goal === "Weight Loss" || profile.primaryGoal === "Weight Loss") {
        if (recentRate > -0.3) {
          targetCalories = this.applySafetyFloor(targetCalories - 150, profile.gender);
          adjustments.push("Deficit increased by 150 kcal: weight loss velocity below 0.3 kg/week.");
        } else if (recentRate < -1.0) {
          targetCalories += 150;
          adjustments.push("Calories increased by 150 kcal: rapid weight loss exceeding safe threshold (>1.0 kg/week).");
        }
      }
    }

    if (habit.workoutAdherence >= 90) {
      volumeScale = 1.08;
      adjustments.push("Volume increased by 8%: workout adherence exceeded 90% threshold.");
    } else if (habit.workoutAdherence < 50) {
      volumeScale = 0.90;
      adjustments.push("Training load reduced by 10%: adherence dropped below 50%.");
    }

    return {
      targetCalories,
      volumeScale,
      adjustments,
      habitScore: habit.habitScore,
      dropOffRisk: habit.dropOffRisk,
      recovery,
    };
  }
}