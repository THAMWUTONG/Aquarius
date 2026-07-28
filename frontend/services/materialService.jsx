/**
 * Fetches all study materials for regulation review.
 * @returns {Promise<Array>}
 * @throws {Error} If the request fails.
 */
export async function fetchMaterials() {
  const response = await fetch('/api/PlatformRegulation.php?action=all-materials', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load materials');
  }
  return data.map((m) => ({ id: m.id, title: m.title, courseName: m.course_title, status: m.regulation_status }));
}

export async function updateMaterialStatus(materialId, status) {
  const validStatuses = ["approved", "rejected"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  const response = await fetch('/api/PlatformRegulation.php?action=regulate-material', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material_id: materialId, status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update material status');
  }
  return data;
}
