/**
 * Fetches aggregate platform statistics for the admin dashboard, including
 * user/role breakdown percentages and pending-approval counts.
 * @returns {Promise<Object>} Normalized stats object for the dashboard UI.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchAdminStats() {
  let response;

  try {
    response = await fetch('/api/PlatformRegulation.php?action=stats', {
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
    throw new Error(data.message || 'Failed to load admin stats');
  }

  return {
    totalUsers: data.total_users,
    totalStudents: data.total_students,
    totalLecturers: data.total_lecturers,
    totalAdmins: data.total_admins,
    studentPercentage: data.student_percentage,
    lecturerPercentage: data.lecturer_percentage,
    adminPercentage: data.admin_percentage,
    totalCourses: data.total_courses,
    activeUsers: data.active_users_today,
    pendingMaterials: data.pending_materials,
    pendingQuizzes: data.pending_quizzes,
    pendingApprovals: (data.pending_materials || 0) + (data.pending_quizzes || 0),
  };
}