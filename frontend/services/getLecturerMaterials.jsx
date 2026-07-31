export async function getLecturerMaterials() {
  const response = await fetch('/api/LecMaterials.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve materials.');
  }

  return data;
}
