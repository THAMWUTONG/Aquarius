export async function getLecturerProfileData() {
  const response = await fetch('/api/LecProfile.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve profile data.');
  }

  return data;
}
