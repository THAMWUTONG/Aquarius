/**
 * Write operations for the lecturer's quizzes and materials, plus the topic
 * list that feeds the modal dropdowns.
 *
 * Every URL here is RELATIVE ('/api/...'). The three modals used to call
 * 'http://localhost/api/...' instead, which broke twice over: it bypassed the
 * vite proxy (so it missed the /Aquarius/backend path prefix entirely) and it
 * was a cross-origin request from the dev server on :7777, so the PHP session
 * cookie was never attached and the endpoint saw an anonymous caller.
 */

/**
 * Shared response handling: surface the server's message, which the lecturer
 * endpoints always send as `message`.
 */
async function readJson(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed. Please try again.');
  }

  return data;
}

/**
 * Topics under the lecturer's own courses, for the Create Quiz and Upload
 * Material dropdowns.
 */
export async function getLecturerTopics() {
  return readJson(await fetch('/api/LecTopics.php'));
}

export async function createQuiz(payload) {
  return readJson(
    await fetch('/api/LecQuizzes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

/** Passing an `id` in the payload turns the same endpoint into an update. */
export async function updateQuiz(id, payload) {
  return readJson(
    await fetch('/api/LecQuizzes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id }),
    })
  );
}

export async function deleteQuiz(id) {
  return readJson(
    await fetch('/api/LecQuizzes.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  );
}

export async function getQuizFeedback(quizId) {
  return readJson(await fetch(`/api/LecQuizFeedback.php?quiz_id=${encodeURIComponent(quizId)}`));
}

/**
 * Uploads a material. Takes a FormData because it carries a file - do NOT set
 * a Content-Type header here, the browser must add the multipart boundary.
 */
export async function uploadMaterial(formData) {
  return readJson(
    await fetch('/api/LecMaterials.php', {
      method: 'POST',
      body: formData,
    })
  );
}

export async function updateMaterial(id, fields) {
  const formData = new FormData();
  formData.append('id', id);
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

  return readJson(
    await fetch('/api/LecMaterials.php', {
      method: 'POST',
      body: formData,
    })
  );
}

export async function deleteMaterial(id) {
  return readJson(
    await fetch('/api/LecMaterials.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  );
}

/** Changes the lecturer's password. */
export async function updateLecturerProfile(payload) {
  return readJson(
    await fetch('/api/LecProfile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}
