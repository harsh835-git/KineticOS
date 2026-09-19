import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFullLifestylePDF = ({
  user = {},
  dailyLog = {},
  activePhase = {},
  workoutSummary = {},
  exercises = [],
  sessionLogs = {},
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryDark = [15, 15, 23];
  const accentViolet = [124, 58, 237];
  const emeraldSuccess = [16, 185, 129];
  const mutedText = [113, 113, 122];

  const dateStr = dailyLog.dateString || new Date().toISOString().split("T")[0];
  const userName = user.name || user.fullName || "Athlete";

  // 1. Header Banner
  doc.setFillColor(...primaryDark);
  doc.rect(0, 0, 210, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("KineticOS", 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(167, 139, 250);
  doc.text("FULL ADAPTIVE HEALTH & TRAINING REPORT", 14, 24);

  doc.setFontSize(9);
  doc.setTextColor(228, 228, 231);
  doc.text(`Athlete: ${userName}  •  Date: ${dateStr}`, 14, 33);

  doc.setTextColor(161, 161, 170);
  doc.text(
    `Phase ${activePhase?.phaseNumber || 1}: ${activePhase?.title || "Accumulation"}`,
    196,
    33,
    { align: "right" }
  );

  // 2. High-Level KPI Cards (Habit Score, Workout Density, Water, Calories)
  const habitScore = dailyLog.habitScore ?? workoutSummary.habitScore ?? 0;
  const waterMl = dailyLog.waterMl || 0;
  const waterTarget = dailyLog.waterTargetMl || 3000;
  const consumedMeals = dailyLog.consumedMeals || [];
  
  const totalCalories = consumedMeals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);
  const totalProtein = consumedMeals.reduce((acc, m) => acc + (Number(m.proteinGrams) || Number(m.protein) || 0), 0);

  const kpis = [
    { label: "HABIT SCORE", value: `${habitScore}/100`, highlight: emeraldSuccess },
    { label: "WORKOUT VOLUME", value: `${workoutSummary.totalTonnage || 0} kg`, highlight: accentViolet },
    { label: "CALORIES LOGGED", value: `${totalCalories} kcal`, highlight: primaryDark },
    { label: "HYDRATION", value: `${(waterMl / 1000).toFixed(1)}L / ${(waterTarget / 1000).toFixed(1)}L`, highlight: primaryDark },
  ];

  let cardX = 14;
  kpis.forEach((kpi) => {
    doc.setFillColor(244, 244, 245);
    doc.roundedRect(cardX, 46, 43, 20, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text(kpi.label, cardX + 4, 53);

    doc.setFontSize(11);
    doc.setTextColor(...kpi.highlight);
    doc.text(String(kpi.value), cardX + 4, 61);

    cardX += 46;
  });

  let currentY = 74;

  // 3. Section: Habit Score Engine Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryDark);
  doc.text("1. HABIT SCORE ENGINE BREAKDOWN", 14, currentY);

  const workoutStatus = dailyLog.workoutStatus || (workoutSummary.completedCount > 0 ? "Completed (50/50)" : "Pending (0/50)");
  const nutritionWeight = `${Math.min(consumedMeals.length * 12, 35)}/35 pts (${consumedMeals.length} meals)`;
  const waterWeight = `${Math.min(Math.round((waterMl / waterTarget) * 15), 15)}/15 pts`;

  autoTable(doc, {
    startY: currentY + 3,
    head: [["Category", "Target", "Logged Today", "Score Contribution"]],
    body: [
      ["Training Adherence", "1 Scheduled Session", workoutStatus, "50% Weight"],
      ["Nutritional Adherence", "3 Whole Meals Logged", `${consumedMeals.length} Meals Logged`, "35% Weight"],
      ["Fluid Balance", `${waterTarget} ml`, `${waterMl} ml`, "15% Weight"],
    ],
    theme: "striped",
    headStyles: { fillColor: primaryDark, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 9;

  // 4. Section: Nutrition & Meal Log
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryDark);
  doc.text(`2. NUTRITION & MACROS LOG (${totalCalories} kcal • ${totalProtein}g Protein)`, 14, currentY);

  const mealRows = consumedMeals.length > 0
    ? consumedMeals.map((m, idx) => [
        m.name || `Meal #${idx + 1}`,
        m.type || "Meal",
        m.calories ? `${m.calories} kcal` : "—",
        m.proteinGrams || m.protein ? `${m.proteinGrams || m.protein}g` : "—",
        m.carbsGrams || m.carbs ? `${m.carbsGrams || m.carbs}g` : "—",
        m.fatGrams || m.fat ? `${m.fatGrams || m.fat}g` : "—",
      ])
    : [["No meals logged for this date", "—", "—", "—", "—", "—"]];

  autoTable(doc, {
    startY: currentY + 3,
    head: [["Item / Meal", "Slot", "Energy", "Protein", "Carbs", "Fats"]],
    body: mealRows,
    theme: "grid",
    headStyles: { fillColor: [55, 65, 81], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 9;

  // Check if we need a page break before workout table
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Section: Workout Movements & Sets
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryDark);
  doc.text("3. WORKOUT EXECUTION & OVERLOAD PROGRESSION", 14, currentY);

  const workoutRows = [];
  exercises.forEach((ex) => {
    const sets = sessionLogs[ex.name] || [];
    sets.forEach((s) => {
      workoutRows.push([
        ex.name,
        `Set #${s.setNumber}`,
        s.weightKg ? `${s.weightKg} kg` : "—",
        s.repsCompleted || "—",
        s.isCompleted ? "Completed" : "Skipped",
      ]);
    });
  });

  if (workoutRows.length === 0 && dailyLog.completedExercises?.length > 0) {
    dailyLog.completedExercises.forEach((item) => {
      workoutRows.push([
        item.exerciseName || item.name || "Exercise",
        `Set #${item.setNumber || item.set || 1}`,
        `${item.weightKg || item.weight || 0} kg`,
        String(item.completedReps || item.repsCompleted || 10),
        "Completed",
      ]);
    });
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [["Exercise Movement", "Set", "Prescribed / Actual Load", "Reps Completed", "Status"]],
    body: workoutRows.length > 0 ? workoutRows : [["No workout completed today", "—", "—", "—", "—"]],
    theme: "striped",
    headStyles: { fillColor: accentViolet, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2.5 },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.cell.raw === "Completed") {
        data.cell.styles.textColor = emeraldSuccess;
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text(
      `KineticOS Comprehensive Lifestyle Audit • Page ${i} of ${totalPages}`,
      105,
      290,
      { align: "center" }
    );
  }

  doc.save(`KineticOS_FullReport_${dateStr}.pdf`);
};