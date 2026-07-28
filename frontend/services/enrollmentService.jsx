export async function fetchEnrollments() {
  const response = await fetch('/api/EnrollmentManagement.php?action=enrollments', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load enrollments');
  }
  return data.map((e) => ({ id: e.id, studentName: e.student_name, courseName: e.course_title, status: e.status }));
}

export async function enrollStudent(studentId, courseId) {
  if (!Number.isInteger(studentId) || studentId <= 0) throw new Error('A valid student must be selected.');
  if (!Number.isInteger(courseId) || courseId <= 0) throw new Error('A valid course must be selected.');

  const response = await fetch('/api/EnrollmentManagement.php?action=enroll', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, course_id: courseId }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to enroll student');
  }
  return data;
}

export async function disenrollStudent(enrollmentId) {
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) throw new Error('A valid enrollment ID is required.');

  const response = await fetch('/api/EnrollmentManagement.php?action=update-enrollment', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enrollment_id: enrollmentId, status: 'disenrolled' }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to disenroll student');
  }
}