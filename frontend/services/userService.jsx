/**
 * Fetches the full list of platform users.
 * @returns {Promise<Array>} Resolves with an array of user objects.
 * @throws {Error} If the request fails.
 */
export async function fetchUsers() {
  const response = await fetch('/api/users.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load users');
  }
  return data;
}

/**
 * Creates a new user account.
 * @param {Object} userData - { name, email, role }.
 * @returns {Promise<Object>} Resolves with the created user record.
 * @throws {Error} If name, email, or role is missing, or the request fails.
 */
export async function createUser(userData) {
  // Input validation: catch obviously invalid input before hitting the network.
  if (!userData?.name || !userData?.email || !userData?.role) {
    throw new Error('Name, email, and role are all required.');
  }

  const response = await fetch('/api/users.php', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create user');
  }
  return data;
}

/**
 * Updates an existing user's details.
 * @param {number} userId - The user's ID.
 * @param {Object} userData - Fields to update, e.g. { name, email, role }.
 * @returns {Promise<Object>} Resolves with the updated user record.
 * @throws {Error} If userId is invalid or the request fails.
 */
export async function updateUser(userId, userData) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('A valid user ID is required.');
  }

  const response = await fetch(`/api/users.php?id=${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user');
  }
  return data;
}

/**
 * Deletes a user account.
 * @param {number} userId - The user's ID.
 * @returns {Promise<void>}
 * @throws {Error} If userId is invalid or the request fails.
 */
export async function deleteUser(userId) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('A valid user ID is required.');
  }

  const response = await fetch(`/api/users.php?id=${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to delete user');
  }
}
