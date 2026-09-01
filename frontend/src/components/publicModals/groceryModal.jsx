import React, { useState, useMemo } from "react";
import {
  X,
  Printer,
  CheckCircle2,
  Circle,
  ShoppingCart,
  Apple,
  Dumbbell,
  Send,
  Mail,
  Check,
} from "lucide-react";
import { generateGroceryList,formatGroceryText } from "../../utils/groceryAggregator";

const GroceryModal = ({
  isOpen,
  onClose,
  fullData,
  dietPlan,
  workoutPlan,
  userProfile,
  userName,
}) => {
  // 1. All hooks inside component body
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  // 2. Data normalization
  const root = fullData || {};
  const resolvedDiet =
    dietPlan || root.dietPlan || root.diet || root.mealPlan || root.plan?.dietPlan || root;
  const resolvedWorkout =
    workoutPlan || root.workoutPlan || root.workout || root.exercisePlan || root.plan?.workoutPlan || root;
  const resolvedProfile =
    userProfile || root.profile || root.userProfile || root.user || {};

  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const resolvedName =
    userName || resolvedProfile.name || root.user?.name || localUser.name || "Athlete";

  // Biometric Weight Resolution
  const resolvedWeight = (() => {
    const candidates = [
      root.profile?.currentWeight,
      root.profile?.weight,
      root.user?.currentWeight,
      root.user?.weight,
      root.currentWeight,
      root.weight,
      resolvedProfile.currentWeight,
      resolvedProfile.weight,
      resolvedProfile.weightKg,
      resolvedProfile.bodyWeight,
      localUser.currentWeight,
      localUser.weight,
      localUser.profile?.weight,
    ];
    const found = candidates.find(
      (val) => val !== undefined && val !== null && val !== "" && val !== "--"
    );
    return found !== undefined ? found : "70";
  })();

  // Robust Non-Veg vs Veg detection
  const searchValues = [
    root.dietaryPreference,
    root.dietPreference,
    root.foodPreference,
    root.profile?.dietaryPreference,
    root.profile?.dietPreference,
    root.profile?.foodPreference,
    root.user?.dietaryPreference,
    root.user?.dietPreference,
    resolvedProfile.dietaryPreference,
    resolvedDiet.dietaryPreference,
    localUser.dietaryPreference,
    localUser.dietPreference,
    localUser.profile?.dietaryPreference,
  ];

  const fullTextScan = JSON.stringify(root).toLowerCase();
  const hasAnimalProteinsInMeals =
    fullTextScan.includes("chicken") ||
    fullTextScan.includes("egg") ||
    fullTextScan.includes("salmon") ||
    fullTextScan.includes("fish") ||
    fullTextScan.includes("meat");

  const rawPreference =
    searchValues.find((val) => typeof val === "string" && val.trim().length > 0) ||
    (hasAnimalProteinsInMeals ? "non-vegetarian" : "vegetarian");

  const normalized = rawPreference.toLowerCase();
  const isNonVeg =
    normalized.includes("non") ||
    normalized.includes("omni") ||
    normalized.includes("meat") ||
    hasAnimalProteinsInMeals;

  const userPreference = isNonVeg ? "Non-Vegetarian" : "Vegetarian";

  const resolvedCalories =
    resolvedProfile.targetCalories ||
    resolvedProfile.calories ||
    resolvedDiet.targetCalories ||
    localUser.targetCalories ||
    2000;

  const resolvedGoal =
    resolvedProfile.primaryGoal ||
    resolvedProfile.fitnessGoal ||
    resolvedProfile.goal ||
    localUser.primaryGoal ||
    "Fitness";

  const userEmail =
    resolvedProfile.email ||
    root.user?.email ||
    localUser.email ||
    "";

  const groceryCategories = useMemo(
    () => generateGroceryList(resolvedDiet, userPreference),
    [resolvedDiet, userPreference]
  );

  const toggleItem = (itemId) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const totalItems = groceryCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = Object.values(checkedItems).filter(Boolean).length;

  const workoutSchedule =
    resolvedWorkout.weeklySchedule ||
    resolvedWorkout.schedule ||
    resolvedWorkout.days ||
    [];

  const dietSchedule =
    resolvedDiet.weeklySchedule ||
    resolvedDiet.schedule ||
    resolvedDiet.days ||
    [];

  // 1. One-Click WhatsApp Deep Link
  const handleWhatsAppShare = () => {
    const text = formatGroceryText(groceryCategories, resolvedName, resolvedCalories);
    const encodedText = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, "_blank");
  };

  // 2. Email Dispatch via Backend API
  const handleEmailSend = async () => {
    const targetEmail = prompt("Enter your email address:", userEmail);
    if (!targetEmail) return;

    try {
      setEmailSending(true);
      const groceryText = formatGroceryText(groceryCategories, resolvedName, resolvedCalories);
      const token = localStorage.getItem("token");

         const response = await fetch("http://localhost:5000/api/plan/send-grocery-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                email: targetEmail,
                athleteName: resolvedName,
                groceryText,
            }),
        });

      const result = await response.json();
      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        alert(result.message || "Failed to dispatch email.");
      }
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Connection error sending email.");
    } finally {
      setEmailSending(false);
    }
  };

  // 3. Isolated Multi-Page Print Window
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=850,height=1000");
    if (!printWindow) {
      alert("Please allow popups to generate your PDF document.");
      return;
    }

    const categoriesHtml = groceryCategories
      .map(
        (cat) => `
        <div class="category-card">
          <div class="category-header">
            <strong>${cat.category}</strong>
            <span>${cat.items.length} items</span>
          </div>
          <div class="item-grid">
            ${cat.items
              .map(
                (item) => `
              <div class="item-row">
                <span>${item.name}</span>
                <span class="checkbox"></span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
      )
      .join("");

    const scheduleHtml = workoutSchedule
      .map((wDay, i) => {
        const dietDay = dietSchedule[i];
        return `
          <div class="matrix-card">
            <div class="matrix-header">
              <strong>${wDay.dayName || `Day ${i + 1}`}</strong>
              <span class="focus">${wDay.focus || "Session"}</span>
            </div>
            <p>🏋️ ${wDay.isRestDay ? "Rest & Recovery" : `${wDay.exercises?.length || 0} exercises`}</p>
            <p>🥗 ${dietDay?.meals?.[0]?.name || dietDay?.meals?.[0] || "Nutritional Meal"}</p>
          </div>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resolvedName} - KineticOS Protocol Blueprint</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header-box {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              border-radius: 12px;
              padding: 16px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
            }
            .header-box h1 {
              font-size: 18px;
              margin: 0 0 4px 0;
              color: #0f172a;
            }
            .header-box p {
              font-size: 13px;
              color: #64748b;
              margin: 0;
            }
            .badges {
              display: flex;
              gap: 8px;
            }
            .badge {
              border: 1px solid #cbd5e1;
              background: #ffffff;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
            }
            .section-title {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #475569;
              margin: 20px 0 12px 0;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            .category-card {
              border: 1px solid #cbd5e1;
              border-radius: 10px;
              padding: 14px;
              margin-bottom: 16px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: #ffffff;
            }
            .category-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 8px;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .item-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .item-row {
              border: 1px solid #f1f5f9;
              background: #f8fafc;
              padding: 7px 10px;
              border-radius: 6px;
              font-size: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .checkbox {
              width: 14px;
              height: 14px;
              border: 1px solid #94a3b8;
              border-radius: 3px;
            }
            .matrix-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .matrix-card {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 10px;
              background: #ffffff;
              font-size: 11px;
            }
            .matrix-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .matrix-header .focus {
              color: #7c3aed;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 10px;
            }
            .matrix-card p {
              margin: 3px 0;
              color: #475569;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              font-size: 10px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <h1>${resolvedName} • Protocol Blueprint</h1>
              <p>Target: <strong>${resolvedCalories} kcal/day</strong> • Goal: <strong style="text-transform: capitalize;">${resolvedGoal}</strong></p>
            </div>
            <div class="badges">
              <div class="badge">Weight: ${resolvedWeight} kg</div>
              <div class="badge">${userPreference}</div>
            </div>
          </div>

          <div class="section-title">Weekly Grocery Checklist</div>
          ${categoriesHtml}

          ${
            workoutSchedule.length > 0
              ? `
            <div class="section-title" style="margin-top: 24px;">7-Day Protocol Schedule</div>
            <div class="matrix-grid">
              ${scheduleHtml}
            </div>
          `
              : ""
          }

          <div class="footer">
            <span>KineticOS Biometric Intelligence Engine</span>
            <span>Generated: ${new Date().toLocaleDateString()}</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Guard after all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0d0d12] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Smart Grocery & 7-Day Protocol
              </h2>
              <p className="text-[11px] text-zinc-400">
                {completedItems} of {totalItems} items acquired • Calibrated for{" "}
                <span className="capitalize font-semibold text-violet-400">
                  {userPreference}
                </span>{" "}
                Diet
              </p>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40"
              title="Send to WhatsApp"
            >
              <Send size={14} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleEmailSend}
              disabled={emailSending}
              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-white/[0.08]"
              title="Send to Email"
            >
              {emailSent ? <Check size={14} className="text-emerald-400" /> : <Mail size={14} />}
              <span className="hidden sm:inline">
                {emailSent ? "Sent!" : emailSending ? "Sending..." : "Email"}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-violet-900/30"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Athlete Info Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {resolvedName} • Protocol Blueprint
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target: <strong className="text-amber-400">{resolvedCalories} kcal/day</strong> • Goal: <strong className="text-violet-400 capitalize">{resolvedGoal}</strong>
              </p>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-semibold">
                Weight: {resolvedWeight} kg
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-300 capitalize font-semibold">
                {userPreference}
              </span>
            </div>
          </div>

          {/* Grocery Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                <Apple size={16} /> Weekly Grocery Checklist
              </h3>
              <span className="text-[10px] text-zinc-500">
                Grouped by nutritional category
              </span>
            </div>

            {groceryCategories.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-zinc-500">
                No grocery items detected from current plan.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {groceryCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#121218] border border-white/[0.06] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                      <span className="text-xs font-bold text-zinc-200">
                        {cat.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {cat.items.length} items
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {cat.items.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                              isChecked
                                ? "bg-emerald-950/20 border-emerald-500/20 text-zinc-500 line-through"
                                : "bg-white/[0.02] border-white/[0.04] text-zinc-300 hover:bg-white/[0.05]"
                            }`}
                          >
                            <span className="text-xs">{item.name}</span>
                            <button className="text-emerald-400">
                              {isChecked ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <Circle size={16} className="text-zinc-600" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7-Day Matrix */}
          {workoutSchedule.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                <Dumbbell size={16} /> 7-Day Schedule Overview
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {workoutSchedule.map((wDay, i) => {
                  const dietDay = dietSchedule[i];
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-1.5"
                    >
                      <div className="flex justify-between font-bold text-white border-b border-white/[0.05] pb-1">
                        <span>{wDay.dayName || `Day ${i + 1}`}</span>
                        <span className="text-violet-400 text-[10px] uppercase font-mono">
                          {wDay.focus || "Session"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        🏋️ {wDay.isRestDay ? "Rest & Recovery" : `${wDay.exercises?.length || 0} exercises`}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        🥗 {dietDay?.meals?.[0]?.name || dietDay?.meals?.[0] || "Nutritional Meal"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-zinc-500">
          <span>KineticOS Biometric Intelligence Protocol</span>
          <button
            onClick={handlePrint}
            className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
          >
            Save as PDF / Print →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryModal;