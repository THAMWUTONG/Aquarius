export async function fetchPlatformStatistics() {
  const [statsRes, weakTopicsRes, trendRes] = await Promise.all([
    fetch('/api/PlatformRegulation.php?action=stats', { credentials: 'include' }),
    fetch('/api/PlatformRegulation.php?action=weak-topics', { credentials: 'include' }),
    fetch('/api/PlatformRegulation.php?action=score-trend', { credentials: 'include' }),
  ]);

  const stats = await statsRes.json();
  const weakTopics = await weakTopicsRes.json();
  const performanceTrend = await trendRes.json();

  if (!statsRes.ok) throw new Error(stats.message || 'Failed to load platform statistics');

  return {
    averageScore: null,
    activeUsersToday: stats.active_users_today,
    usageOverTime: [],
    weakTopics: weakTopicsRes.ok ? weakTopics : [],
    performanceTrend: trendRes.ok ? performanceTrend : [],
  };
}