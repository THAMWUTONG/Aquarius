/**
 * Fetches all study materials for regulation review.
 * @returns {Promise<Array>}
 * @throws {Error} If the request fails.
 */
export async function fetchMaterials() {
  const response = await fetch('/api/materials.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load materials');
  }
  return data;
}

/**
 * Updates a study material's regulation status.
 * @param {number} materialId
 * @param {"approved"|"rejected"|"flagged"} status
 * @returns {Promise<Object>}
 * @throws {Error} If materialId/status is invalid or the request fails.
 */
export async function updateMaterialStatus(materialId, status) {
  const validStatuses = ["approved", "rejected", "flagged"];
  if (!Number.isInteger(materialId) || materialId <= 0) {
    throw new Error('A valid material ID is required.');
  }
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  const response = await fetch(`/api/materials.php?id=${materialId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update material status');
  }
  return data;
}
