export async function getLecturerDashboardData() {
  const response = await fetch('/api/LecDashboard.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve lecturer dashboard data.');
  }

  return data;
}
