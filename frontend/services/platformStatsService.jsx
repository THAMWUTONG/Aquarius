/**
 * Fetches detailed platform statistics for the Platform Statistics page by
 * combining three endpoints: overall stats, system-wide weak topics, and
 * the average-score trend.
 * @returns {Promise<Object>} { averageScore, activeUsersToday, usageOverTime, weakTopics, performanceTrend }
 * @throws {Error} If the primary stats request fails; weak-topics/trend failures degrade to empty arrays instead.
 */
export async function fetchPlatformStatistics() {
  let statsRes, weakTopicsRes, trendRes;

  try {
    [statsRes, weakTopicsRes, trendRes] = await Promise.all([
      fetch('/api/PlatformRegulation.php?action=stats', { credentials: 'include' }),
      fetch('/api/PlatformRegulation.php?action=weak-topics', { credentials: 'include' }),
      fetch('/api/PlatformRegulation.php?action=score-trend', { credentials: 'include' }),
    ]);
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let stats, weakTopics, performanceTrend;
  try {
    stats = await statsRes.json();
    weakTopics = await weakTopicsRes.json();
    performanceTrend = await trendRes.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!statsRes.ok) {
    throw new Error(stats.message || 'Failed to load platform statistics');
  }

  return {
    averageScore: null, // not available from any current endpoint — see note in adminService.jsx history
    activeUsersToday: stats.active_users_today,
    usageOverTime: [], // not derivable from current schema (no login-history table)
    weakTopics: weakTopicsRes.ok ? weakTopics : [],
    performanceTrend: trendRes.ok ? performanceTrend : [],
  };
}