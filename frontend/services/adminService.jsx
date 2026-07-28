/**
 * Fetches aggregate platform statistics for the admin dashboard
 * (total users, total courses, active users, pending approvals).
 * @returns {Promise<Object>} Resolves with the stats object returned by the backend.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchAdminStats() {
  let response;

  try {
    response = await fetch('/api/admin-stats.php', {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    // Covers offline / DNS / CORS-level failures where fetch() itself rejects.
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load admin stats');
  }

  return data;
}