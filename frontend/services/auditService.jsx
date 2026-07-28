/**
 * Fetches all audit log entries.
 * @returns {Promise<Array>} Resolves with an array of { timestamp, actor, action }.
 * @throws {Error} If the request fails.
 */
export async function fetchAuditLogs() {
  const response = await fetch('/api/audit-logs.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load audit logs');
  }
  return data;
}
