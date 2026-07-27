<?php
/**
 * ProfileLogic.php
 *
 * 
 */

require_once __DIR__ . '/../repository/ProfileRep.php';

/**
 * Gets all profile data that are unique to the student.
 * Currently the only unique data are active enrolled courses.
 * If you are looking for non-derived unique data (programme, intake, etc.) refer to AuthLogic.php.
 * 
 * @param int $studentId
 * @return array{
 *   success: bool,
 *   enrolledCourses: array,
 *   partialErrors: array
 * }
 */
function getStProfileData(int $studentId): array
{
    $partialErrors = [];
    // Get Active Enrolled Courses For Profile
    $coursesResult = getEnlCourses($studentId);
    if (!$coursesResult['success']) {
        $partialErrors[] = 'enrolledCourses';
        $enrolledCourses = [];
    } else {
        $enrolledCourses = formatEnrlCourses($coursesResult['data']);
    }

    if (!empty($partialErrors)) {
        error_log('[ProfileLogic] partial failure for student ' . $studentId . ': ' . implode(',', $partialErrors));
    }

    return [
        'success' => true,
        'enrolledCourses' => $enrolledCourses,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Converts raw enrollment rows into the shape the frontend table expects
 * (Course Name / Enrolled At)
 *
 * @param array $courses
 * @return array
 */
function formatEnrlCourses(array $courses): array
{
    return array_map(function (array $course) {
        return [
            'id' => (int) $course['id'],
            'title' => $course['title'],
            'enrolledAt' => $course['enrolled_at'],
        ];
    }, $courses);
}