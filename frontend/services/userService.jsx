/**
 * Fetches the full list of platform users (all roles).
 * @returns {Promise<Array>} Resolves with an array of normalized user objects.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchUsers() {
  let response;

  try {
    response = await fetch('/api/UserManagement.php?action=users', {
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
    throw new Error(data.message || 'Failed to load users');
  }

  return data.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    last_access: u.last_access,
  }));
}

/**
 * Creates a new user account (student, lecturer, or admin).
 * @param {Object} userData - { name, email, password, role }.
 * @returns {Promise<Object>} Resolves with the created user record.
 * @throws {Error} If required fields are missing or the request fails.
 */
export async function createUser(userData) {
  if (!userData?.name || !userData?.email || !userData?.role || !userData?.password) {
    throw new Error('Name, email, password, and role are all required.');
  }

  let response;
  try {
    response = await fetch('/api/UserManagement.php?action=create-user', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
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
    throw new Error(data.message || 'Failed to create user');
  }

  return data;
}

/**
 * Updates an existing user's name and email.
 * @param {number} userId - The user's ID.
 * @param {Object} userData - { name, email }.
 * @returns {Promise<Object>} Resolves with the updated user record.
 * @throws {Error} If userId is invalid or the request fails.
 */
export async function updateUser(userId, userData) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('A valid user ID is required.');
  }

  let response;
  try {
    response = await fetch('/api/UserManagement.php?action=update-user', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name: userData.name, email: userData.email }),
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

  let response;
  try {
    response = await fetch(`/api/UserManagement.php?action=delete-user&user_id=${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Received an invalid response from the server.');
    }
    throw new Error(data.message || 'Failed to delete user');
  }
}