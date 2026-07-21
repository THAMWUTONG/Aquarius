export async function login(email, password) {
  const loginResponse = await fetch('/api/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await loginResponse.json();

  if (!loginResponse.ok) {
    throw new Error(data.message || 'Login failed');
  }
  
  return data;
}