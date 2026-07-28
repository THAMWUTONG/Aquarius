export async function fetchAuditLogs() {
  const response = await fetch('/api/UserManagement.php?action=audit-logs', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load audit logs');
  }
  return data.map((log) => ({ timestamp: log.performed_at, actor: log.admin_name, action: log.action }));
}