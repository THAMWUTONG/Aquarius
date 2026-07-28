export async function getLecturerPerformanceData() {
  const response = await fetch('/api/LecPerformance.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve performance analytics.');
  }

  return data;
}
