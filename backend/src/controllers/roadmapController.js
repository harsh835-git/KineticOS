import Roadmap from "../models/roadMap.js";
import User from "../models/User.js"; // Adjust path if your User model is elsewhere

export const roadmapTemplates = {
  // 1. MUSCLE GAIN (Hypertrophy)
  "Muscle Gain": [
    {
      phaseNumber: 1,
      title: "Phase 1: Hypertrophy & Work Capacity",
      durationWeeks: 3,
      focus: "High training volume, 8–12 rep ranges to establish motor patterns and muscle fullness.",
      targetMetric: "65–72.5% 1RM load base",
      status: "in-progress",
      milestoneMarker: "Week 3: Circumference & weight check-in"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Progressive Overload & Density",
      durationWeeks: 3,
      focus: "Intensification shifting to 6–8 reps with incremental weekly load additions.",
      targetMetric: "75–82.5% 1RM working sets",
      status: "upcoming",
      milestoneMarker: "Week 6: Mid-cycle strength evaluation"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Realization & Active Deload",
      durationWeeks: 2,
      focus: "Peak output testing followed by a 50% volume reduction to reset CNS fatigue.",
      targetMetric: "85%+ 1RM test → 50% recovery taper",
      status: "upcoming",
      milestoneMarker: "Week 8: Full fitness reset & plan renewal"
    }
  ],

  // 2. FAT LOSS / CUTTING
  "Fat Loss": [
    {
      phaseNumber: 1,
      title: "Phase 1: Metabolic Conditioning Base",
      durationWeeks: 3,
      focus: "Moderate loads, 12–15 reps, shortened rest intervals to maximize caloric expenditure.",
      targetMetric: "60–65% 1RM, high training density",
      status: "in-progress",
      milestoneMarker: "Week 3: Body fat & waist circumference delta"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Strength Retention in Deficit",
      durationWeeks: 3,
      focus: "Heavy compound preservation (6–8 reps) to signal muscle retention while cutting.",
      targetMetric: "75–80% 1RM preservation load",
      status: "upcoming",
      milestoneMarker: "Week 6: Deficit adherence & energy audit"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Re-feed & Active Taper",
      durationWeeks: 2,
      focus: "Low-impact recovery, maintenance calorie re-feed to normalize metabolic rate.",
      targetMetric: "Maintenance volume flush",
      status: "upcoming",
      milestoneMarker: "Week 8: Goal re-evaluation & reverse diet setup"
    }
  ],

  // 3. STRENGTH / POWERLIFTING
  "Strength": [
    {
      phaseNumber: 1,
      title: "Phase 1: Structural Hypertrophy Base",
      durationWeeks: 3,
      focus: "Volume accumulation (6–8 reps) to build tendon integrity and muscle cross-section.",
      targetMetric: "70–75% 1RM submaximal volume",
      status: "in-progress",
      milestoneMarker: "Week 3: Form review on big 3 compounds"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Heavy Neural Loading",
      durationWeeks: 3,
      focus: "Intensification (3–5 reps), longer rest periods (3–5 min), maximizing force production.",
      targetMetric: "80–87.5% 1RM working sets",
      status: "upcoming",
      milestoneMarker: "Week 6: Rep max test under fatigue"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Peaking & CNS Restoration",
      durationWeeks: 2,
      focus: "Testing new 1–3 rep maximums followed by a structured low-intensity deload week.",
      targetMetric: "90%+ 1RM singles → 40% deload",
      status: "upcoming",
      milestoneMarker: "Week 8: New 1RM baseline logged"
    }
  ],

  // 4. BODY RECOMPOSITION
  "Body Recomposition": [
    {
      phaseNumber: 1,
      title: "Phase 1: Movement Economy & Base",
      durationWeeks: 3,
      focus: "Compound movements (8–10 reps) paired with steady-state conditioning.",
      targetMetric: "65–70% 1RM load base",
      status: "in-progress",
      milestoneMarker: "Week 3: Body measurement baseline check"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Undulating Intensity Progression",
      durationWeeks: 3,
      focus: "Alternating heavy strength days with high-density superset days.",
      targetMetric: "75–80% 1RM alternating loads",
      status: "upcoming",
      milestoneMarker: "Week 6: Lean mass vs fat delta audit"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Consolidation & Peak Flush",
      durationWeeks: 2,
      focus: "Consolidating motor adaptations, active cardio recovery, and volume taper.",
      targetMetric: "Moderate load maintenance",
      status: "upcoming",
      milestoneMarker: "Week 8: Full body recomp comparison review"
    }
  ],

  // 5. ENDURANCE & CONDITIONING
  "Endurance": [
    {
      phaseNumber: 1,
      title: "Phase 1: Aerobic Capacity & Lactate Base",
      durationWeeks: 3,
      focus: "High-rep circuit resistance (15–20 reps) + Zone 2 aerobic base building.",
      targetMetric: "50–60% 1RM, minimal rest (<45s)",
      status: "in-progress",
      milestoneMarker: "Week 3: Resting HR & VO2 estimate check"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Threshold & Muscular Stamina",
      durationWeeks: 3,
      focus: "Tempo training, EMOMs, and high-density work capacity under fatigue.",
      targetMetric: "60–70% 1RM sustained intervals",
      status: "upcoming",
      milestoneMarker: "Week 6: Time-trial performance benchmark"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Taper & Output Peak",
      durationWeeks: 2,
      focus: "Volume drop by 40% while preserving sharpness, peaking stamina for test day.",
      targetMetric: "Active recovery and peak endurance test",
      status: "upcoming",
      milestoneMarker: "Week 8: Final endurance benchmark evaluation"
    }
  ],
  "Weight Maintenance": [
    {
      phaseNumber: 1,
      title: "Phase 1: Baseline Strength & Caloric Equilibrium",
      durationWeeks: 3,
      focus: "Sustainable compound resistance (8–10 reps) while holding caloric maintenance balance.",
      targetMetric: "70% 1RM steady load",
      status: "in-progress",
      milestoneMarker: "Week 3: Weight stability check (±0.5 kg)"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Movement Quality & Density",
      durationWeeks: 3,
      focus: "Form refinement, tempo control, and moderate intensity without systemic fatigue.",
      targetMetric: "70–75% 1RM steady sets",
      status: "upcoming",
      milestoneMarker: "Week 6: Energy & recovery audit"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Active Flush & Deload",
      durationWeeks: 2,
      focus: "Low-impact recovery, joint preservation, and long-term consistency maintenance.",
      targetMetric: "Active movement & 50% recovery taper",
      status: "upcoming",
      milestoneMarker: "Week 8: Mesocycle maintenance review"
    }
  ],

  // 6. GENERAL FITNESS / HEALTH
  "General Fitness": [
    {
      phaseNumber: 1,
      title: "Phase 1: Habit Foundation & Mobility",
      durationWeeks: 3,
      focus: "Full-body workouts (10–12 reps), mobility flows, and establishing a regular schedule.",
      targetMetric: "60–65% 1RM controlled tempo",
      status: "in-progress",
      milestoneMarker: "Week 3: Consistency & habit adherence check"
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Functional Strength & Core",
      durationWeeks: 3,
      focus: "Multi-joint compound movements (8–10 reps) plus core stability and balance.",
      targetMetric: "70–75% 1RM steady progression",
      status: "upcoming",
      milestoneMarker: "Week 6: Movement efficiency & recovery audit"
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Sustainability & Lifestyle Reset",
      durationWeeks: 2,
      focus: "Light recreational activity, active recovery, and establishing long-term routines.",
      targetMetric: "50% deload & active movement",
      status: "upcoming",
      milestoneMarker: "Week 8: 8-week health scorecard review"
    }

  ]
  
};

export const getRoadmap = async (req, res) => {
  const { userId } = req.params;
  try {
    let roadmap = await Roadmap.findOne({ userId });

    // Seed default 8-week mesocycle matched to user's goal if not initialized
    if (!roadmap) {
      const user = await User.findById(userId);
      const userGoal = user?.goal || "Muscle Gain";

      // Match goal or fallback to Muscle Gain
      const matchedPhases =
        roadmapTemplates[userGoal] || roadmapTemplates["Muscle Gain"];

      roadmap = await Roadmap.create({
        userId,
        currentWeek: 1,
        totalWeeks: 8,
        phases: matchedPhases
      });
    }

    return res.status(200).json({ success: true, roadmap });
  } catch (err) {
    console.error("Roadmap Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching roadmap" });
  }
};