/**
 * Fetches all study materials (any regulation status) for the Platform
 * Regulation table.
 * @returns {Promise<Array>} Resolves with an array of normalized material objects.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchMaterials() {
  let response;

  try {
    response = await fetch('/api/PlatformRegulation.php?action=all-materials', {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load materials');
  }

  return data.map((m) => ({
    id: m.id,
    title: m.title,
    courseName: m.course_title,
    status: m.regulation_status,
  }));
}

/**
 * Updates a study material's regulation status.
 * @param {number} materialId
 * @param {"approved"|"rejected"} status - Materials do not support 'flagged' (schema constraint).
 * @returns {Promise<Object>}
 * @throws {Error} If materialId/status is invalid or the request fails.
 */
export async function updateMaterialStatus(materialId, status) {
  const validStatuses = ["approved", "rejected"];
  if (!Number.isInteger(materialId) || materialId <= 0) {
    throw new Error('A valid material ID is required.');
  }
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  let response;
  try {
    response = await fetch('/api/PlatformRegulation.php?action=regulate-material', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ material_id: materialId, status }),
    });
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update material status');
  }

  return data;
}