<?php
/**
 * LecPerformanceLogic.php
 *
 * Combines the 3 analytics sections into ONE response, and does the arithmetic
 * the repository deliberately left undone.
 */

require_once __DIR__ . '/../repository/LecPerformanceRep.php';

/**
 * @param int $lecturerUserId
 * @return array{
 *   success: bool,
 *   courseAverages: array,
 *   topicCompletion: array,
 *   gradebook: array,
 *   partialErrors: array
 * }
 */
function getLecturerPerformanceData(int $lecturerUserId, ?int $courseId = null, ?int $quizId = null): array
{
    $partialErrors = [];

    // Filter dropdown options. These describe everything the lecturer owns and
    // are intentionally NOT narrowed by the current selection - otherwise
    // picking a course would remove every other course from the dropdown and
    // strand the user with no way back.
    $filterResult = getLecturerFilterOptions($lecturerUserId);
    if (!$filterResult['success']) {
        $partialErrors[] = 'filters';
        $filters = ['courses' => [], 'quizzes' => []];
    } else {
        $filters = [
            'courses' => array_map(function (array $row) {
                return ['id' => (int) $row['id'], 'title' => $row['title']];
            }, $filterResult['courses']),
            'quizzes' => array_map(function (array $row) {
                return [
                    'id' => (int) $row['id'],
                    'title' => $row['title'],
                    'courseId' => (int) $row['course_id'],
                ];
            }, $filterResult['quizzes']),
        ];
    }

    // Average quiz score per course
    $averagesResult = getLecturerCourseAverages($lecturerUserId);
    if (!$averagesResult['success']) {
        $partialErrors[] = 'courseAverages';
        $courseAverages = [];
    } else {
        $courseAverages = formatCourseAverages($averagesResult['data']);
    }

    // Completion rate per topic
    $completionResult = getLecturerTopicCompletion($lecturerUserId);
    if (!$completionResult['success']) {
        $partialErrors[] = 'topicCompletion';
        $topicCompletion = [];
    } else {
        $topicCompletion = formatTopicCompletion($completionResult['data']);
    }

    // Per-student gradebook, narrowed by the selected course/quiz if any
    $gradebookResult = getLecturerGradebook($lecturerUserId, $courseId, $quizId);
    if (!$gradebookResult['success']) {
        $partialErrors[] = 'gradebook';
        $gradebook = [];
    } else {
        $gradebook = formatGradebook($gradebookResult['data']);
    }

    if (!empty($partialErrors)) {
        error_log('[LecPerformanceLogic] partial failure for lecturer ' . $lecturerUserId . ': ' . implode(',', $partialErrors));
    }

    return [
        'success' => true,
        'courseAverages' => $courseAverages,
        'topicCompletion' => $topicCompletion,
        'gradebook' => $gradebook,
        'filters' => $filters,
        'selected' => ['courseId' => $courseId, 'quizId' => $quizId],
        'partialErrors' => $partialErrors,
    ];
}

/**
 * A course with no attempts yet returns NULL from AVG(). The bar chart needs a
 * number for its CSS height, so NULL becomes 0 - and 'hasData' is exposed so
 * the UI can tell "genuinely 0%" apart from "nobody has attempted this".
 *
 * @param array $rows
 * @return array
 */
function formatCourseAverages(array $rows): array
{
    return array_map(function (array $row) {
        $hasData = $row['average'] !== null;
        return [
            'courseId' => (int) $row['id'],
            'course' => $row['course'],
            'average' => $hasData ? (int) round((float) $row['average']) : 0,
            'hasData' => $hasData,
        ];
    }, $rows);
}

/**
 * rate = attempted / enrolled * 100.
 *
 * The guard matters: a topic in a course with zero active students would be a
 * division by zero, which in PHP 8 throws DivisionByZeroError and would break
 * the whole endpoint. Zero enrolled students means a 0% rate by definition.
 *
 * @param array $rows
 * @return array
 */
function formatTopicCompletion(array $rows): array
{
    return array_map(function (array $row) {
        $attempted = (int) $row['attempted'];
        $enrolled = (int) $row['enrolled'];
        $rate = $enrolled > 0 ? (int) round($attempted / $enrolled * 100) : 0;

        return [
            'topicId' => (int) $row['id'],
            'topic' => $row['topic'],
            'course' => $row['course'],
            'attempted' => $attempted,
            'enrolled' => $enrolled,
            'rate' => $rate,
        ];
    }, $rows);
}

/**
 * Derives the status label the gradebook table shows.
 *
 * 'No Attempt' is a real state, not an error: a student enrolled in the course
 * who has not sat any quiz. MAX() returns NULL for them, so bestScore stays
 * null and the frontend renders a dash rather than '0%', which would wrongly
 * suggest they sat a quiz and failed it.
 *
 * The 50% pass mark is a business rule, which is why it lives in the logic
 * layer and not in SQL.
 *
 * @param array $rows
 * @return array
 */
function formatGradebook(array $rows): array
{
    $passMark = 50;

    return array_map(function (array $row) use ($passMark) {
        $attempts = (int) $row['attempts'];
        $hasAttempt = $attempts > 0 && $row['best_score'] !== null;
        $bestScore = $hasAttempt ? (int) round((float) $row['best_score']) : null;

        if (!$hasAttempt) {
            $status = 'No Attempt';
        } elseif ($bestScore >= $passMark) {
            $status = 'Passed';
        } else {
            $status = 'Failed';
        }

        return [
            'studentId' => (int) $row['student_id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'attempts' => $attempts,
            'bestScore' => $bestScore,
            'status' => $status,
        ];
    }, $rows);
}
