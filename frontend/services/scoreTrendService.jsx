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

/**
 * Pseudocode: fetchScoreTrend()
 *   TRY: GET /api/PlatformRegulation.php?action=score-trend (with session credentials)
 *   CATCH network error: THROW "Unable to reach the server"
 *   TRY: parse response body as JSON
 *   CATCH parse error: THROW "Received an invalid response from the server"
 *   IF response.ok is false: THROW Error(data.message OR "Failed to load score trend")
 *   RETURN parsed array of { period, averageScore }
 *
 * Test Plan: fetchScoreTrend()
 *   Intended input:
 *     - Valid admin session, endpoint returns 200 + array of weekly averages
 *       -> expect resolved array, each item having period (string) and averageScore (number)
 *   Incorrect input:
 *     - No quiz attempts exist yet -> expect resolved empty array (not an error)
 *     - Endpoint returns 401/500 -> expect rejection with server's message
 *     - Network failure -> expect rejection with "Unable to reach the server..."
 */