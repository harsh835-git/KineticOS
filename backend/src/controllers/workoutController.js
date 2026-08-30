import WorkoutPlan from "../models/workoutPlan.js";
import User from "../models/user.js";
// Helper to construct routines across all 5 FitAI goals
const buildWeeklyRoutine = (goal, experience) => {
  const isBeginner = experience === "beginner";
  const baseSets = isBeginner ? 3 : 4; // Beginner: Lower volume | Intermediate: Moderate volume

  switch (goal) {
    // ==========================================
    // 1. MUSCLE GAIN (Hypertrophy & Progressive Overload)
    // ==========================================
    case "Muscle Gain":
      return [
        {
          dayName: "Monday",
          focus: "Chest, Shoulders & Triceps (Push)",
          isRestDay: false,
          exercises: [
            { name: "Barbell Bench Press", sets: baseSets, reps: "8-10", restSeconds: 90, formGuidance: "Retract scapula and keep feet planted firmly on the floor." },
            { name: "Incline Dumbbell Press", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Control descent; press upwards in an arc over the chest." },
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15", restSeconds: 60, formGuidance: "Lead with elbows, keeping hands neutral to protect rotators." },
            { name: "Rope Triceps Pushdown", sets: 3, reps: "12-15", restSeconds: 60, formGuidance: "Flay rope outward at contraction; keep elbows stationary." },
          ],
        },
        {
          dayName: "Tuesday",
          focus: "Back & Biceps (Pull)",
          isRestDay: false,
          exercises: [
            { name: "Lat Pulldown / Wide-Grip Pull-ups", sets: baseSets, reps: "8-10", restSeconds: 90, formGuidance: "Initiate movement by depressing shoulders; pull to clavicle." },
            { name: "Barbell Bent-Over Row", sets: baseSets, reps: "8-10", restSeconds: 90, formGuidance: "Hinge at 45 degrees, bracing core to prevent spinal flexion." },
            { name: "Incline Dumbbell Bicep Curl", sets: 3, reps: "10-12", restSeconds: 60, formGuidance: "Keep upper arm behind torso to emphasize the long head." },
            { name: "Face Pulls", sets: 3, reps: "15", restSeconds: 60, formGuidance: "Pull rope to brow level to isolate rear delts and external rotators." },
          ],
        },
        {
          dayName: "Wednesday",
          focus: "Active Recovery & Mobility",
          isRestDay: true,
          exercises: [],
        },
        {
          dayName: "Thursday",
          focus: "Quads, Hamstrings & Calves (Legs)",
          isRestDay: false,
          exercises: [
            { name: "Barbell Back Squat", sets: baseSets, reps: "8-10", restSeconds: 120, formGuidance: "Descend until hip crease is parallel to kneecap; keep chest up." },
            { name: "Romanian Deadlift (RDL)", sets: baseSets, reps: "10-12", restSeconds: 90, formGuidance: "Push hips directly backward; maintain neutral cervical spine." },
            { name: "Leg Extension", sets: 3, reps: "12-15", restSeconds: 60, formGuidance: "Hold peak contraction for 1 second before lowering under control." },
            { name: "Standing Calf Raises", sets: 4, reps: "15", restSeconds: 45, formGuidance: "Full stretch at bottom; squeeze calf at full ankle extension." },
          ],
        },
        {
          dayName: "Friday",
          focus: "Upper Body Hypertrophy",
          isRestDay: false,
          exercises: [
            { name: "Seated Overhead Dumbbell Press", sets: baseSets, reps: "10-12", restSeconds: 90, formGuidance: "Do not arch lumbar spine; press straight to full overhead lockout." },
            { name: "Chest-Supported T-Bar Row", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Drive elbows back while keeping chest pinned against pad." },
            { name: "Cable Chest Flyes", sets: 3, reps: "12-15", restSeconds: 60, formGuidance: "Focus on deep chest stretch and squeeze along midline." },
            { name: "Hammer Curls", sets: 3, reps: "12", restSeconds: 60, formGuidance: "Neutral grip targeting the brachioradialis and brachialis." },
          ],
        },
        {
          dayName: "Saturday",
          focus: "Lower Body & Core Hypertrophy",
          isRestDay: false,
          exercises: [
            { name: "Leg Press", sets: baseSets, reps: "10-12", restSeconds: 90, formGuidance: "Do not lock knees completely at top lockout." },
            { name: "Lying Hamstring Curls", sets: 3, reps: "12-15", restSeconds: 60, formGuidance: "Keep hips glued to the pad to avoid momentum." },
            { name: "Hanging Leg Raises", sets: 3, reps: "12-15", restSeconds: 60, formGuidance: "Posteriorly tilt pelvis to fully engage lower rectus abdominis." },
          ],
        },
        {
          dayName: "Sunday",
          focus: "Rest & Muscle Repair",
          isRestDay: true,
          exercises: [],
        },
      ];

    // ==========================================
    // 2. BODY RECOMPOSITION (Strength & Hypertrophy Split)
    // ==========================================
    case "Body Recomposition":
      return [
        {
          dayName: "Monday",
          focus: "Upper Body Strength",
          isRestDay: false,
          exercises: [
            { name: "Barbell Bench Press", sets: baseSets, reps: "6-8", restSeconds: 90, formGuidance: "Heavy compound load; maintain tight arch and scapular depression." },
            { name: "Pendlay / Barbell Row", sets: baseSets, reps: "6-8", restSeconds: 90, formGuidance: "Reset on the floor each rep for explosive pulling power." },
            { name: "Overhead Dumbbell Press", sets: 3, reps: "8-10", restSeconds: 75, formGuidance: "Strict press without using leg momentum." },
            { name: "Dips / Weighted Dips", sets: 3, reps: "8-12", restSeconds: 75, formGuidance: "Lean forward slightly to keep load centered on the lower pecs." },
          ],
        },
        {
          dayName: "Tuesday",
          focus: "Lower Body Strength",
          isRestDay: false,
          exercises: [
            { name: "Barbell Squats", sets: baseSets, reps: "6-8", restSeconds: 120, formGuidance: "Brace abdominal wall with valsalva maneuver before descent." },
            { name: "Conventional / Trap Bar Deadlift", sets: 3, reps: "5-6", restSeconds: 120, formGuidance: "Pull slack out of bar; drive floor away through heel and midfoot." },
            { name: "Bulgarian Split Squats", sets: 3, reps: "8-10/leg", restSeconds: 75, formGuidance: "Keep torso upright to emphasize quad activation." },
            { name: "Cable Woodchoppers", sets: 3, reps: "12/side", restSeconds: 45, formGuidance: "Pivot back foot and control rotational deceleration." },
          ],
        },
        {
          dayName: "Wednesday",
          focus: "Low-Intensity Steady State (LISS) & Recovery",
          isRestDay: true,
          exercises: [],
        },
        {
          dayName: "Thursday",
          focus: "Upper Body Hypertrophy & Density",
          isRestDay: false,
          exercises: [
            { name: "Incline Dumbbell Press", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Focus on continuous tension and stretch at bottom." },
            { name: "Neutral-Grip Cable Pulls", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Keep elbows tucked close to rib cage." },
            { name: "Lateral Raises Supersetted with Face Pulls", sets: 3, reps: "15 each", restSeconds: 60, formGuidance: "High-density shoulder conditioning." },
            { name: "EZ-Bar Skullcrushers", sets: 3, reps: "10-12", restSeconds: 60, formGuidance: "Lower bar to forehead; keep elbows tucked inward." },
          ],
        },
        {
          dayName: "Friday",
          focus: "Lower Body Hypertrophy & Core",
          isRestDay: false,
          exercises: [
            { name: "Dumbbell Romanian Deadlift", sets: baseSets, reps: "10-12", restSeconds: 90, formGuidance: "Hinge until hamstrings are on high stretch; avoid spinal rounding." },
            { name: "Walking Lunges", sets: 3, reps: "12/leg", restSeconds: 60, formGuidance: "Stride out with a 90-degree bend in both knees." },
            { name: "Plank to Pike", sets: 3, reps: "12", restSeconds: 45, formGuidance: "Elevate hips using lower abdominal compression." },
          ],
        },
        {
          dayName: "Saturday",
          focus: "Conditioning & Core Interval",
          isRestDay: false,
          exercises: [
            { name: "Rowing Machine Intervals", sets: 5, reps: "500m row / 90s rest", restSeconds: 90, formGuidance: "Drive hard with legs first, then hinge and pull arms." },
            { name: "Abdominal Hollow Body Hold", sets: 3, reps: "30-45s", restSeconds: 45, formGuidance: "Flatten lower back into the mat." },
          ],
        },
        {
          dayName: "Sunday",
          focus: "Rest & Total Regeneration",
          isRestDay: true,
          exercises: [],
        },
      ];

    // ==========================================
    // 3. IMPROVE ENDURANCE (Cardiovascular Stamina & Muscular Endurance)
    // ==========================================
    case "Improve Endurance":
      return [
        {
          dayName: "Monday",
          focus: "Aerobic Capacity & High-Rep Circuit",
          isRestDay: false,
          exercises: [
            { name: "Bodyweight Air Squats", sets: 4, reps: "20-25", restSeconds: 45, formGuidance: "Maintain cadence and consistent depth on every rep." },
            { name: "Push-ups", sets: 4, reps: "15-20", restSeconds: 45, formGuidance: "Strict tempo; pause briefly at chest lockout." },
            { name: "Kettlebell / Dumbbell Swings", sets: 4, reps: "20", restSeconds: 45, formGuidance: "Explosive hip extension to drive stamina." },
            { name: "Jumping Lunges", sets: 3, reps: "12/leg", restSeconds: 45, formGuidance: "Soft landing to protect knee joints during deceleration." },
          ],
        },
        {
          dayName: "Tuesday",
          focus: "Threshold Cardio / Tempo Intervals",
          isRestDay: false,
          exercises: [
            { name: "Interval Running or Cycling", sets: 8, reps: "1 min hard effort / 1 min recovery", restSeconds: 60, formGuidance: "Sustain effort at 85% maximum heart rate during intervals." },
            { name: "Plank Shoulder Taps", sets: 3, reps: "20 total", restSeconds: 30, formGuidance: "Lock hips still; avoid swaying side-to-side." },
          ],
        },
        {
          dayName: "Wednesday",
          focus: "Muscular Endurance Full Body",
          isRestDay: false,
          exercises: [
            { name: "Dumbbell Step-Ups", sets: 3, reps: "15/leg", restSeconds: 45, formGuidance: "Drive through whole foot of lead leg on bench." },
            { name: "Inverted Rows / Banded Rows", sets: 4, reps: "15", restSeconds: 45, formGuidance: "Maintain horizontal hollow body position." },
            { name: "Dumbbell Thrusters", sets: 3, reps: "15", restSeconds: 60, formGuidance: "Squat into fluid overhead press without hesitation." },
            { name: "Bicycle Crunches", sets: 3, reps: "25", restSeconds: 30, formGuidance: "Continuous steady rotations to build core stamina." },
          ],
        },
        {
          dayName: "Thursday",
          focus: "Active Recovery & Mobility Flow",
          isRestDay: true,
          exercises: [],
        },
        {
          dayName: "Friday",
          focus: "Lactate Threshold & MetCon",
          isRestDay: false,
          exercises: [
            { name: "Burpees", sets: 4, reps: "12-15", restSeconds: 45, formGuidance: "Drop chest to floor, explode upward through feet." },
            { name: "Mountain Climbers", sets: 4, reps: "45 seconds", restSeconds: 30, formGuidance: "High knee drive rate while maintaining straight spine." },
            { name: "Farmer's Walk", sets: 4, reps: "40 meters", restSeconds: 60, formGuidance: "Stand tall, pin shoulders back, and avoid tilting." },
          ],
        },
        {
          dayName: "Saturday",
          focus: "Long Slow Distance (LSD) Steady Cardio",
          isRestDay: false,
          exercises: [
            { name: "Long Run / Cycling / Rowing", sets: 1, reps: "45-60 mins continuous", restSeconds: 0, formGuidance: "Maintain steady Zone 2 heart rate (conversational pace)." },
          ],
        },
        {
          dayName: "Sunday",
          focus: "Rest & Tissue Regeneration",
          isRestDay: true,
          exercises: [],
        },
      ];

    // ==========================================
    // 4. MAINTAIN (Balanced Functional Fitness & Mobility)
    // ==========================================
    case "Maintain":
      return [
        {
          dayName: "Monday",
          focus: "Upper Body Balance & Posture",
          isRestDay: false,
          exercises: [
            { name: "Dumbbell Bench Press", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Controlled cadence for steady joint health." },
            { name: "Seated Cable Row", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Squeeze scapula for postural reinforcement." },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: "12", restSeconds: 60, formGuidance: "Smooth overhead motion with neutral grip." },
            { name: "Plank Hold", sets: 3, reps: "45s", restSeconds: 45, formGuidance: "Maintain neutral spine alignment." },
          ],
        },
        {
          dayName: "Tuesday",
          focus: "Lower Body Functional Strength",
          isRestDay: false,
          exercises: [
            { name: "Goblet Squats", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Deep squat targeting hip mobility." },
            { name: "Dumbbell Romanian Deadlift", sets: baseSets, reps: "10-12", restSeconds: 75, formGuidance: "Posterior chain maintenance." },
            { name: "Standing Calf Raises", sets: 3, reps: "15", restSeconds: 45, formGuidance: "Full range of motion." },
          ],
        },
        {
          dayName: "Wednesday",
          focus: "Active Recovery & Dynamic Stretching",
          isRestDay: true,
          exercises: [],
        },
        {
          dayName: "Thursday",
          focus: "Full Body Resistance",
          isRestDay: false,
          exercises: [
            { name: "Push-ups", sets: 3, reps: "12-15", restSeconds: 60, formGuidance: "Strict form with locked core." },
            { name: "Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 60, formGuidance: "Smooth pull to upper chest." },
            { name: "Bodyweight Reverse Lunges", sets: 3, reps: "12/leg", restSeconds: 60, formGuidance: "Maintain balance and upright torso." },
          ],
        },
        {
          dayName: "Friday",
          focus: "Cardiovascular Maintenance",
          isRestDay: false,
          exercises: [
            { name: "Zone 2 Jogging / Cycling", sets: 1, reps: "30 mins", restSeconds: 0, formGuidance: "Comfortable aerobic rhythm." },
            { name: "Bird-Dog Core Stability", sets: 3, reps: "10/side", restSeconds: 45, formGuidance: "Reach opposite arm and leg straight." },
          ],
        },
        {
          dayName: "Saturday",
          focus: "Outdoor Recreation / Mobility",
          isRestDay: true,
          exercises: [],
        },
        {
          dayName: "Sunday",
          focus: "Full Rest & Recovery",
          isRestDay: true,
          exercises: [],
        },
      ];

    // ==========================================
    // 5. WEIGHT LOSS (Metabolic Conditioning & Fat Oxidation)
    // ==========================================
    case "Weight Loss":
    default:
      return [
        {
          dayName: "Monday",
          focus: "Full Body Circuit & High Caloric Burn",
          isRestDay: false,
          exercises: [
            { name: "Goblet Squats", sets: baseSets, reps: "12-15", restSeconds: 60, formGuidance: "Keep a smooth, continuous tempo." },
            { name: "Push-Ups / Incline Push-Ups", sets: baseSets, reps: "10-15", restSeconds: 60, formGuidance: "Maintain rigid core alignment without sagging hips." },
            { name: "Dumbbell Bent-Over Row", sets: baseSets, reps: "12-15", restSeconds: 60, formGuidance: "Keep back flat and pull weights to lower rib cage." },
            { name: "Mountain Climbers", sets: 3, reps: "30s", restSeconds: 45, formGuidance: "Fast knees to chest with hands firmly under shoulders." },
          ],
        },
        {
          dayName: "Tuesday",
          focus: "Cardio Intervals & Core",
          isRestDay: false,
          exercises: [
            { name: "Interval Treadmill / Bike Sprint", sets: 6, reps: "30s sprint / 60s walk", restSeconds: 60, formGuidance: "Max effort during work phase; steady recovery." },
            { name: "Bicycle Crunches", sets: 3, reps: "20", restSeconds: 45, formGuidance: "Slow rotation, bringing opposite elbow towards knee." },
            { name: "Side Plank", sets: 3, reps: "30s/side", restSeconds: 45, formGuidance: "Stack shoulders over elbow and lift hips high." },
          ],
        },
        {
          dayName: "Wednesday",
          focus: "Full Body Functional Strength",
          isRestDay: false,
          exercises: [
            { name: "Dumbbell Romanian Deadlift", sets: baseSets, reps: "12-15", restSeconds: 60, formGuidance: "Soft knees, hinge back until hamstrings load." },
            { name: "Dumbbell Overhead Press", sets: baseSets, reps: "12", restSeconds: 60, formGuidance: "Maintain upright posture without backward leaning." },
            { name: "Bodyweight Reverse Lunges", sets: 3, reps: "12/leg", restSeconds: 45, formGuidance: "Step back softly and drop back knee towards floor." },
            { name: "Deadbug Hold", sets: 3, reps: "12 total", restSeconds: 45, formGuidance: "Press lower back firmly into the floor." },
          ],
        },
        {
          dayName: "Thursday",
          focus: "Active Recovery & Mobility",
          isRestDay: true,
          exercises: [],
        },
        {
          dayName: "Friday",
          focus: "Metabolic Conditioning (MetCon)",
          isRestDay: false,
          exercises: [
            { name: "Kettlebell / Dumbbell Swings", sets: 4, reps: "15", restSeconds: 60, formGuidance: "Explosive hip drive; power comes from hips, not arms." },
            { name: "Dumbbell Renegade Rows", sets: 3, reps: "10/arm", restSeconds: 60, formGuidance: "Widen feet to prevent hips from twisting." },
            { name: "Jump Squats / Air Squats", sets: 3, reps: "15", restSeconds: 45, formGuidance: "Land softly through the midfoot." },
            { name: "Plank to Push-Up", sets: 3, reps: "10 total", restSeconds: 60, formGuidance: "Alternate leading arms and resist hip rotation." },
          ],
        },
        {
          dayName: "Saturday",
          focus: "Steady State Zone 2 Cardio",
          isRestDay: false,
          exercises: [
            { name: "Brisk Incline Walk / Cycling", sets: 1, reps: "35-45 mins", restSeconds: 0, formGuidance: "Maintain conversational pace (Zone 2 cardio)." },
          ],
        },
        {
          dayName: "Sunday",
          focus: "Rest & Total Regeneration",
          isRestDay: true,
          exercises: [],
        },
      ];
  }
};

// POST /api/workout/generate
export const generateWorkoutPlan = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: "User profile not found. Complete onboarding first." });
    }

    const { primaryGoal, experienceLevel, activityLevel } = user.profile;

    const weeklySchedule = buildWeeklyRoutine(
      primaryGoal || "Weight Loss",
      experienceLevel || "beginner"
    );

    // Upsert workout plan for user
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        goal: primaryGoal || "Weight Loss",
        experienceLevel: experienceLevel || "beginner",
        activityLevel: activityLevel || "moderate",
        schedule: weeklySchedule,
        weekNumber: 1,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Weekly workout plan generated successfully.",
      workoutPlan,
    });
  } catch (error) {
    console.error("Generate Workout Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate workout plan." });
  }
};

// GET /api/workout/:userId
export const getWorkoutPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const plan = await WorkoutPlan.findOne({ userId });

    if (!plan) {
      return res.status(404).json({ success: false, message: "No workout plan found for this user." });
    }

    return res.status(200).json({ success: true, workoutPlan: plan });
  } catch (error) {
    console.error("Get Workout Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve workout plan." });
  }
};