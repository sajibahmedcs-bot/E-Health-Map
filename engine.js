/* ============================================================
   engine.js — Health Score Calculation Engine
============================================================ */


/**
 * Parse a sleep window (HH:mm strings) into decimal hours.
 * Handles overnight sleep correctly (e.g. 22:30 → 06:30 = 8h).
 */
function parseSleep(start, end) {
  const s = new Date('2000-01-01T' + start);
  let   e = new Date('2000-01-01T' + end);
  if (e < s) e.setDate(e.getDate() + 1);   // crosses midnight
  return (e - s) / 3_600_000;              // ms → hours
}


/**
 * Calculate a full weekly health report from an array of DayData objects.
 * Returns scores, averages, risk level, insights, and patterns.
 */
function calculateScore(week) {
  if (!week.length) {
    return {
      overallScore: 0,
      factors:  { sleep: 0, water: 0, activity: 0, stress: 0, balance: 0 },
      averages: { sleep: 0, water: 0, activity: 0, stress: 0, screen: 0, work: 0 },
      riskLevel: 'Low',
      insights: [], patterns: [],
      cognitiveLoad: 0, recoveryScore: 0
    };
  }

  const n = week.length;

  // ── Averages ──────────────────────────────────────────────
  const avgSleep    = week.reduce((a, d) => a + parseSleep(d.sleepStart, d.sleepEnd), 0) / n;
  const avgWater    = week.reduce((a, d) => a + d.water,       0) / n;
  const avgExercise = week.reduce((a, d) => a + d.exercise,    0) / n;
  const avgStress   = week.reduce((a, d) => a + d.stress,      0) / n;
  const avgScreen   = week.reduce((a, d) => a + d.screenTime,  0) / n;
  const avgWork     = week.reduce((a, d) => a + d.workHours,   0) / n;

  // ── Normalised factor scores (0-100) ──────────────────────
  const sleepScore    = Math.min(100, Math.max(0, (avgSleep    / 8)   * 100));
  const waterScore    = Math.min(100, Math.max(0, (avgWater    / 2.5) * 100));
  const activityScore = Math.min(100, Math.max(0, (avgExercise / 30)  * 100));
  const stressScore   = Math.max(0, 100 - avgStress * 10);
  const balanceScore  = Math.max(0, 100 - (Math.abs(avgWork - 8) * 10 + Math.abs(avgScreen - 3) * 5));

  const overallScore = Math.round(
    (sleepScore + waterScore + activityScore + stressScore + balanceScore) / 5
  );

  // ── Risk level ────────────────────────────────────────────
  let riskLevel = 'Low';
  if      (overallScore < 40) riskLevel = 'Higher';
  else if (overallScore < 70) riskLevel = 'Moderate';

  // ── Insight engine ────────────────────────────────────────
  const insights = [];
  if (avgSleep    < 7)  insights.push("Consistently low sleep may impact your cognitive clarity.");
  if (avgWater    < 2)  insights.push("Consider increasing your daily water intake for better metabolic function.");
  if (avgExercise < 20) insights.push("Short bursts of movement can significantly boost your heart health.");
  if (avgStress   > 7)  insights.push("Your stress levels have been high; prioritizing recovery is essential.");

  // ── Pattern engine ────────────────────────────────────────
  const patterns = [];
  const lateNights = week.filter(d => {
    const h = parseInt(d.sleepStart.split(':')[0]);
    return h >= 23 || h < 4;
  }).length;
  if (lateNights > 3) patterns.push("Late-night routine identified: This may shift your circadian rhythm.");

  const sedentary = week.filter(d => d.screenTime > 6 && d.exercise < 15).length;
  if (sedentary > 2)  patterns.push("Sedentary trend detected: Try 'movement snacks' during work hours.");

  // ── Cognitive load & recovery ─────────────────────────────
  const cognitiveLoad = Math.min(100, Math.round(avgWork * 6 + avgScreen * 4 + avgStress * 2));
  const recoveryScore = Math.min(100, Math.max(0,
    Math.round(avgSleep * 10 + avgWater * 5 - avgStress * 3)
  ));

  return {
    overallScore,
    factors:  {
      sleep:    Math.round(sleepScore),
      water:    Math.round(waterScore),
      activity: Math.round(activityScore),
      stress:   Math.round(stressScore),
      balance:  Math.round(balanceScore)
    },
    averages: {
      sleep: avgSleep, water: avgWater, activity: avgExercise,
      stress: avgStress, screen: avgScreen, work: avgWork
    },
    riskLevel, insights, patterns, cognitiveLoad, recoveryScore
  };
}


/**
 * Calculate a single day's habit score and return display metadata.
 * Used by the Routine Check live preview and history cards.
 */
function calculateDailyScore(day) {
  const sleepHrs = parseSleep(day.sleepStart, day.sleepEnd);

  const sScore  = Math.min(100, (sleepHrs        / 8)   * 100);
  const wScore  = Math.min(100, (day.water        / 2.5) * 100);
  const eScore  = Math.min(100, (day.exercise     / 30)  * 100);
  const stScore = Math.max(0,   100 - day.stress  * 10);
  const bScore  = Math.max(0,   100 - (Math.abs(day.workHours - 8) * 10 + Math.abs(day.screenTime - 3) * 5));

  const total = Math.round((sScore + wScore + eScore + stScore + bScore) / 5);

  // Default: Optimal
  let condition = "Optimal";
  let color     = "#10b981";
  let bg        = "rgba(16,185,129,.08)";

  if      (total <= 30) { condition = "Very Poor"; color = "#dc2626"; bg = "rgba(220,38,38,.08)"; }
  else if (total <= 50) { condition = "Poor";      color = "#fb7185"; bg = "rgba(251,113,133,.08)"; }
  else if (total <= 70) { condition = "Fair";      color = "#f97316"; bg = "rgba(249,115,22,.08)"; }
  else if (total <= 85) { condition = "Good";      color = "#4DA6A6"; bg = "rgba(77,166,166,.08)"; }

  return { score: total, condition, color, bg };
}
