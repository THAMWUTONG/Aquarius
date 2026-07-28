export async function fetchCourses() {
  const response = await fetch('/api/EnrollmentManagement.php?action=courses', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load courses');
  }
  return data;
}