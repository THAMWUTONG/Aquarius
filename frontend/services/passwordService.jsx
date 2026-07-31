/**
 * Changes the currently logged-in user's password. Works for any role
 * (student, lecturer, admin) — the backend identifies the user via session.
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {string} confirmPassword
 * @returns {Promise<Object>}
 * @throws {Error} If any field is missing, passwords don't match, or the request fails.
 */
export async function changePassword(currentPassword, newPassword, confirmPassword) {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('Current password, new password, and confirmation are all required.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('New password and confirmation do not match.');
  }

  let response;
  try {
    response = await fetch('/api/ChangePassword.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
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
    throw new Error(data.message || 'Failed to change password');
  }

  return data;
}