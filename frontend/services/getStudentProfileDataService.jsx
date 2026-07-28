export async function getActiveCourses() {
  const response = await fetch('/api/Profile.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve courses data.');
  }
  
  return data;
}