/**
 * Dynamically extracts percentage from targetMetric string
 * e.g., "65–72.5% 1RM load base" -> 68.75% (midpoint 0.6875)
 * e.g., "85%+ 1RM test" -> 85% (0.85)
 * e.g., "50% recovery taper" -> 50% (0.50)
 */
export const extractTargetPercentage = (targetMetric = "") => {
  if (!targetMetric) return 0.70;

  // Match range like "65-72.5%" or "65–72.5%"
  const rangeMatch = targetMetric.match(/(\d+(?:\.\d+)?)\s*[–\-]\s*(\d+(?:\.\d+)?)\s*%/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return ((low + high) / 2) / 100;
  }

  // Match single percentage like "85%+" or "50%"
  const singleMatch = targetMetric.match(/(\d+(?:\.\d+)?)\s*%/);
  if (singleMatch) {
    return parseFloat(singleMatch[1]) / 100;
  }

  return 0.70;
};

/**
 * Calculates prescribed working weight dynamically based on
 * live phase metrics from DB and user PRs.
 */
export const calculateDynamicPrescribedWeight = (exerciseName, personalRecords = [], activePhase = null) => {
  if (!exerciseName || !activePhase) return "";

  const pr = personalRecords.find(
    (item) => item.name?.toLowerCase().trim() === exerciseName?.toLowerCase().trim()
  );

  const oneRepMax = Number(pr?.oneRepMax || pr?.est1RM || 0);
  if (!oneRepMax || oneRepMax <= 0) return "";

  const targetRatio = extractTargetPercentage(activePhase.targetMetric);
  const calculatedWeight = oneRepMax * targetRatio;

  // Round to standard 2.5 kg gym plate steps
  return String(Math.max(2.5, Math.round(calculatedWeight / 2.5) * 2.5));
};