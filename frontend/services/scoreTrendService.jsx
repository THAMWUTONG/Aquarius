/**
 * Fetches the platform-wide average quiz score trend (most recent weeks),
 * used by both the Admin Dashboard mini-chart and Platform Statistics.
 * @returns {Promise<Array<{period: string, averageScore: number}>>}
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchScoreTrend() {
  let response;

  try {
    response = await fetch('/api/PlatformRegulation.php?action=score-trend', {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load score trend');
  }

  return data;
}