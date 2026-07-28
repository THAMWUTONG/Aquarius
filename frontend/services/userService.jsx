/**
 * Fetches the full list of platform users.
 * @returns {Promise<Array>} Resolves with an array of user objects.
 * @throws {Error} If the request fails.
 */
export async function fetchUsers() {
  const response = await fetch('/api/UserManagement.php?action=users', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
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

export async function createUser(userData) {
  if (!userData?.name || !userData?.email || !userData?.role || !userData?.password) {
    throw new Error('Name, email, password, and role are all required.');
  }

  const response = await fetch('/api/UserManagement.php?action=create-user', {
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

export async function updateUser(userId, userData) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('A valid user ID is required.');
  }

  const response = await fetch('/api/UserManagement.php?action=update-user', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, name: userData.name, email: userData.email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user');
  }
  return data;
}

export async function deleteUser(userId) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('A valid user ID is required.');
  }

  const response = await fetch(`/api/UserManagement.php?action=delete-user&user_id=${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to delete user');
  }
}