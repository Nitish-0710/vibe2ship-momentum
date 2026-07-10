const Task = require('../models/Task');
const Insight = require('../models/Insight');
const Reflection = require('../models/Reflection');
const Schedule = require('../models/Schedule');

/**
 * Analytics Service.
 * Computes structured productivity analytics for the user from MongoDB collections.
 */

/**
 * Retrieves and computes comprehensive productivity metrics for a user.
 *
 * @param {string} userId
 * @returns {Promise<Object>} The computed analytics payload
 */
async function getUserAnalytics(userId) {
  const now = new Date();

  // Default fallback values
  const defaultAnalytics = {
    completionRate: 0,
    estimatedHours: 0,
    actualHoursCompleted: 0,
    overdueTasksCount: 0,
    focusConsistencyScore: 100,
    preferredWorkWindow: 'Flexible',
    recurringBlockers: [],
    weeklyCompletionTrend: [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ],
    reflectionSummary: 'No reflections completed yet. Take some time at the end of the day to reflect.',
  };

  try {
    // 1. Fetch Tasks
    const tasks = await Task.find({ userId });

    // 2. Fetch Insights
    const insightDoc = await Insight.findOne({ userId });

    // 3. Fetch Reflections
    const reflections = await Reflection.find({ userId }).sort({ createdAt: -1 }).limit(7);

    // 4. Fetch Schedules
    const schedules = await Schedule.find({ userId }).sort({ date: -1 }).limit(7);

    if (tasks.length === 0) {
      return defaultAnalytics;
    }

    // ── Metric 1: Completion Rate ────────────────────────────
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const activeTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
    const completionRate = Math.round((completedTasks.length / tasks.length) * 100);

    // ── Metric 2: Estimated vs Actual Workload ───────────────
    const estimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const actualHoursCompleted = completedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    // ── Metric 3: Overdue Trends ─────────────────────────────
    const overdueTasksCount = activeTasks.filter((t) => {
      if (!t.deadline) return false;
      return new Date(t.deadline) < now;
    }).length;

    // ── Metric 4: Preferred Work Window ─────────────────────
    const preferredWorkWindow = insightDoc?.preferredWorkWindow || 'Flexible';

    // ── Metric 5: Focus Consistency & Weekly Focus Hours ─────
    const focusConsistencyScore = insightDoc?.averageCompletionRate || completionRate;

    // ── Metric 6: Recurring Blockers ─────────────────────────
    const recurringBlockers = insightDoc?.commonBlockers || [];

    // ── Metric 7: Weekly Completion Trend (Mon-Sun counts) ────
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyCompletionTrend = [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ];

    // Fill completion counts by day for tasks completed in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    completedTasks.forEach((t) => {
      if (t.updatedAt) {
        const completedDate = new Date(t.updatedAt);
        if (completedDate >= sevenDaysAgo) {
          const dayName = daysOfWeek[completedDate.getDay()];
          const dayObj = weeklyCompletionTrend.find((d) => d.day === dayName);
          if (dayObj) {
            dayObj.count++;
          }
        }
      }
    });

    // ── Metric 8: Last Reflection Summary ────────────────────
    const reflectionSummary = reflections.length > 0
      ? reflections[0].notes || `Daily reflection rated ${reflections[0].productivityRating}/5.`
      : defaultAnalytics.reflectionSummary;

    return {
      completionRate,
      estimatedHours,
      actualHoursCompleted,
      overdueTasksCount,
      focusConsistencyScore,
      preferredWorkWindow,
      recurringBlockers,
      weeklyCompletionTrend,
      reflectionSummary,
    };
  } catch (err) {
    console.error('[Analytics Service] Failure building user analytics:', err.message);
    // Shield error, return default fallback structure
    return defaultAnalytics;
  }
}

module.exports = { getUserAnalytics };
