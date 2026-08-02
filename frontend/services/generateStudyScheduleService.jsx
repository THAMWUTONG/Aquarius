export async function generateStudySchedule({ freeDates }) {
  const response = await fetch('/api/StGenSchedule.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ freeDates })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate the study schedule.');
  }

  return data;
}
