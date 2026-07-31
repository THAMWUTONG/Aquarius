export async function askChatbot(question) {
  const response = await fetch('/api/chatbot.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to contact the chatbot right now.');
  }

  return data;
}