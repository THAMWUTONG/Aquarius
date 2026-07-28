export async function getStudentDashboardData() {
  const response = await fetch('/api/StDashboard.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve dashboard data.');
  }
  
  console.log(data)
  return data;
}