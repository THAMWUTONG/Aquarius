/**
 * Fetches all audit log entries.
 * @returns {Promise<Array>} Resolves with an array of normalized { timestamp, actor, action } entries.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchAuditLogs() {
  let response;

  try {
    response = await fetch('/api/UserManagement.php?action=audit-logs', {
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
    throw new Error(data.message || 'Failed to load audit logs');
  }

  return data.map((log) => ({
    timestamp: log.performed_at,
    actor: log.admin_name,
    action: log.action,
  }));
}