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
