<?php
/**
 * LecDashboardLogic.php
 *
 * Combines the lecturer dashboard sections into ONE API response.
 *
 * Same resilience rule as the student dashboard: if one section fails we
 * degrade it to an empty/zero value and record it in partialErrors, rather
 * than failing the whole page with a 500.
 */

require_once __DIR__ . '/../repository/LecDashboardRep.php';

/**
 * @param int $lecturerUserId users.id of the logged-in lecturer
 * @return array{
 *   success: bool,
 *   stats: array,
 *   roster: array,
 *   partialErrors: array
 * }
 */
function getLecturerDashboardData(int $lecturerUserId): array
{
    $partialErrors = [];

    // 4 headline counts
    $statsResult = getLecturerStats($lecturerUserId);
    if (!$statsResult['success']) {
        $partialErrors[] = 'stats';
        $stats = formatLecturerStats([]);
    } else {
        $stats = formatLecturerStats($statsResult['data']);
    }

    // Classroom roster
    $rosterResult = getLecturerRoster($lecturerUserId);
    if (!$rosterResult['success']) {
        $partialErrors[] = 'roster';
        $roster = [];
    } else {
        $roster = formatLecturerRoster($rosterResult['data']);
    }

    if (!empty($partialErrors)) {
        error_log('[LecDashboardLogic] partial failure for lecturer ' . $lecturerUserId . ': ' . implode(',', $partialErrors));
    }

    return [
        'success' => true,
        'stats' => $stats,
        'roster' => $roster,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Converts snake_case DB counts into the camelCase keys React consumes.
 * Missing keys fall back to 0 so the stat cards always render a number.
 *
 * @param array $stats
 * @return array
 */
function formatLecturerStats(array $stats): array
{
    return [
        'totalStudents'  => (int) ($stats['total_students'] ?? 0),
        'totalQuizzes'   => (int) ($stats['total_quizzes'] ?? 0),
        'totalMaterials' => (int) ($stats['total_materials'] ?? 0),
        'totalFeedback'  => (int) ($stats['total_feedback'] ?? 0),
    ];
}

/**
 * Cleans up raw roster rows for the frontend.
 *
 * Two coercions matter here:
 *   - avg_progress is NULL when a student has attempted no quizzes in this
 *     lecturer's courses. AVG() over zero rows returns NULL, and "null%" is
 *     not a valid CSS width, so 0 attempts is normalised to 0 percent.
 *   - last_access is trimmed to its DATE part only, or null when the student
 *     has never logged in. Rendering that null as text is the frontend's job.
 *
 * programme and intake come straight off the students row. programme is
 * nullable in the schema and intake is a DATE, so both are normalised to a
 * plain string or null and the table renders the dash.
 *
 * @param array $rows
 * @return array
 */
function formatLecturerRoster(array $rows): array
{
    return array_map(function (array $row) {
        return [
            'studentId' => (int) $row['student_id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'programme' => $row['programme'] ?? null,
            'intake' => !empty($row['intake'])
                ? substr($row['intake'], 0, 10)
                : null,
            'classes' => $row['classes'] ?? '',
            'progress' => (int) round((float) ($row['avg_progress'] ?? 0)),
            'lastActive' => !empty($row['last_access'])
                ? substr($row['last_access'], 0, 10)
                : null,
        ];
    }, $rows);
}
