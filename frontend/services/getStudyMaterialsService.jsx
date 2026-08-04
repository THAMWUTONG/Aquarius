export async function getStudyMaterials() {
  const response = await fetch('/api/StudyMt.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to retrieve study materials.');
  }

  return data;
}
