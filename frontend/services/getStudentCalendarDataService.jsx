export async function getStudentCalendarData() {
  const response = await fetch('/api/StCalender.php', {
    method: 'GET'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve calendar data.');
  }

  return data;
}
