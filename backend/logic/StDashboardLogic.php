<?php
/**
 * DashboardLogic.php
 * 
 * total 4 function & query
 *   
 */

require_once __DIR__ . '/../repository/StDashboardRep.php';

/**
 * Combines 4 different dashboard sections into ONE single API response
 * 
 * If one query fails, it returns an empty array [] 
 * instead of throwing 500 error.
 *
 * @param int $studentId
 * @return array{
 *   success: bool,
 *   enrolledCourses?: array,
 *   totalQuizzesAttempted?: int,
 *   upcomingEvents?: array,
 *   weakTopics?: array,
 *   partialErrors?: array
 * }
 */
function getStudentDashboardData(int $studentId): array
{
    $partialErrors = [];

    // Enrolled Course 
    $coursesResult = getEnrolledCourses($studentId);
    if (!$coursesResult['success']) {
        $partialErrors[] = 'enrolledCourses';
        $enrolledCourses = [];
    } else {
        $enrolledCourses = formatEnrolledCourses($coursesResult['data']);
    }

    // total Quiz excluded duplicate attempts
    $quizCountResult = getTotalQuizzesAttempted($studentId);
    if (!$quizCountResult['success']) {
        $partialErrors[] = 'totalQuizzesAttempted';
        $totalQuizzesAttempted = 0;
    } else {
        $totalQuizzesAttempted = $quizCountResult['data'];
    }

    // Upcoming Events（3）
    $eventsResult = getUpcomingEvents($studentId, 4);
    if (!$eventsResult['success']) {
        $partialErrors[] = 'upcomingEvents';
        $upcomingEvents = [];
    } else {
        $upcomingEvents = formatUpcomingEvents($eventsResult['data']);
    }

    // Weak Topic（< 70%）
    $weakTopicsResult = getWeakTopics($studentId, 70.0);
    if (!$weakTopicsResult['success']) {
        $partialErrors[] = 'weakTopics';
        $weakTopics = [];
    } else {
        $weakTopics = formatWeakTopics($weakTopicsResult['data']);
    }

    if (!empty($partialErrors)) {
        error_log('[DashboardLogic] partial failure for student ' . $studentId . ': ' . implode(',', $partialErrors));
    }

    return [
        'success' => true,
        'enrolledCourses' => $enrolledCourses,
        'totalQuizzesAttempted' => $totalQuizzesAttempted,
        'upcomingEvents' => $upcomingEvents,
        'weakTopics' => $weakTopics,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Converts raw database course data into a clean format
 * Casts ID from string to integer to prevent React type mismatches.
 * @param array $courses
 * @return array
 */
function formatEnrolledCourses(array $courses): array
{
    return array_map(function (array $course) {
        return [
            'id' => (int) $course['id'],
            'title' => $course['title'],
            'description' => $course['description'],
        ];
    }, $courses);
}

/**
 * @param array $events
 * @return array
 */
function formatUpcomingEvents(array $events): array
{
    return array_map(function (array $event) {
        return [
            'id' => (int) $event['id'],
            'title' => $event['title'],
            'eventDate' => $event['event_date'],
            'eventType' => $event['event_type'],
        ];
    }, $events);
}

/**
 * @param array $topics
 * @return array
 */
function formatWeakTopics(array $topics): array
{
    return array_map(function (array $topic) {
        return [
            'topicId' => (int) $topic['topic_id'],
            'topicTitle' => $topic['topic_title'],
            'averagePercentage' => round((float) $topic['avg_percentage'], 1),
        ];
    }, $topics);
}