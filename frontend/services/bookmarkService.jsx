export async function toggleBookmark(materialId) {
  const response = await fetch('/api/Bookmark.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ materialId })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to toggle bookmark.');
  }

  return data;
}
