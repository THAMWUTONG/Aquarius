/**
 * Fetches detailed platform statistics for the Platform Statistics page:
 * usage over time, system-wide weak topics, and overall performance trend.
 * @returns {Promise<Object>} Resolves with { usageOverTime, weakTopics, performanceTrend }.
 * @throws {Error} If the request fails.
 */
export async function fetchPlatformStatistics() {
  const response = await fetch('/api/platform-statistics.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load platform statistics');
  }
  return data;
}
