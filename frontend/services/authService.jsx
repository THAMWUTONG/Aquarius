export async function login(email, password) {
  const response = await fetch('/api/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

/**
 * Destroys the server-side session. Best-effort: the caller clears local
 * session state (context + localStorage) regardless of whether this succeeds,
 * so a network failure here shouldn't block the user from logging out.
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await fetch('/api/logout.php', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // ignored — local logout already happened in the caller
  }
}