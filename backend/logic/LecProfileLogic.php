<?php
/**
 * LecProfileLogic.php
 *
 * Supplies the DERIVED half of the lecturer profile page (courses taught).
 * Static fields come from the login payload - see LecProfileRep.php.
 */

require_once __DIR__ . '/../repository/LecProfileRep.php';

/**
 * @param int $lecturerUserId
 * @return array{success: bool, courses: array, partialErrors: array}
 */
function getLecProfileData(int $lecturerUserId): array
{
    $partialErrors = [];

    $result = getLecturerCourses($lecturerUserId);
    if (!$result['success']) {
        $partialErrors[] = 'courses';
        $courses = [];
        error_log('[LecProfileLogic] courses failed for lecturer ' . $lecturerUserId);
    } else {
        $courses = formatLecturerCourses($result['data']);
    }

    return [
        'success' => true,
        'courses' => $courses,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Changes the lecturer's password.
 *
 * Name, email and department are deliberately NOT updatable here even though
 * the form posts them: they are rendered read-only on the page, and accepting
 * them would let a crafted request rewrite identity fields the UI never
 * intended to expose. Only the password is acted on.
 *
 * The current password is always re-verified server-side. The frontend already
 * checks that the two new-password boxes match, but that check protects against
 * typos, not against a request that skips the form entirely.
 *
 * @param int   $lecturerUserId
 * @param array $payload currentPassword, newPassword, confirmPassword
 * @return array{success: bool, status: int, message: string}
 */
function updateLecturerProfile(int $lecturerUserId, array $payload): array
{
    $currentPassword = (string) ($payload['currentPassword'] ?? '');
    $newPassword = (string) ($payload['newPassword'] ?? '');
    $confirmPassword = (string) ($payload['confirmPassword'] ?? '');

    // Submitting the form with the password boxes blank is a no-op, not an
    // error - the other fields are read-only, so there is nothing else to save.
    if ($newPassword === '') {
        return ['success' => true, 'status' => 200, 'message' => 'No changes to save.'];
    }

    if ($currentPassword === '') {
        return [
            'success' => false,
            'status' => 400,
            'message' => 'Please enter your current password to set a new password.',
        ];
    }

    if ($newPassword !== $confirmPassword) {
        return [
            'success' => false,
            'status' => 400,
            'message' => 'New password and confirmation password do not match.',
        ];
    }

    if (strlen($newPassword) < 8) {
        return [
            'success' => false,
            'status' => 400,
            'message' => 'Your new password must be at least 8 characters long.',
        ];
    }

    $hash = getUserPasswordHash($lecturerUserId);
    if ($hash === null) {
        return ['success' => false, 'status' => 401, 'message' => 'Your account could not be found.'];
    }

    if (!password_verify($currentPassword, $hash)) {
        return ['success' => false, 'status' => 403, 'message' => 'Your current password is incorrect.'];
    }

    $result = updateUserPassword($lecturerUserId, password_hash($newPassword, PASSWORD_DEFAULT));
    if (!$result['success']) {
        return [
            'success' => false,
            'status' => 500,
            'message' => "We couldn't update your password. Please try again later.",
        ];
    }

    return ['success' => true, 'status' => 200, 'message' => 'Password updated successfully.'];
}

/**
 * @param array $rows
 * @return array
 */
function formatLecturerCourses(array $rows): array
{
    return array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'studentCount' => (int) $row['student_count'],
            'topicCount' => (int) $row['topic_count'],
            'createdAt' => !empty($row['created_at'])
                ? substr($row['created_at'], 0, 10)
                : null,
        ];
    }, $rows);
}
