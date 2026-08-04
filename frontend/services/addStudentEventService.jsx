export async function addStudentEvent({ title, eventDate, eventType }) {
  const response = await fetch('/api/StCalendar.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, eventDate, eventType })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to add the event.');
  }

  return data.event;
}