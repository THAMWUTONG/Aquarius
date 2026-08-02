<?php
/**
 * StPerfOverviewLogic.php
 *
 * Combines the 3 Performance Overview sections into ONE API response.
 * Same "partial failure" 
 * if one query fails, it degrades to an empty array instead of a 500.
 */

require_once __DIR__ . '/../repository/StPerOverviewRep.php';

/**
 * @param int $studentId
 * @return array{
 *   success: bool,
 *   courseProgress?: array,
 *   scoreHistory?: array,
 *   improvementTrends?: array,
 *   partialErrors?: array
 * }
 */
function getPerformanceOverviewData(int $studentId): array
{
    $partialErrors = [];

    // Course Progress
    $progressResult = getCourseProgress($studentId);
    if (!$progressResult['success']) {
        $partialErrors[] = 'courseProgress';
        $courseProgress = [];
    } else {
        $courseProgress = formatCourseProgress($progressResult['data']);
    }

    // Score History (last 8 attempts)
    $historyResult = getScoreHistory($studentId, 8);
    if (!$historyResult['success']) {
        $partialErrors[] = 'scoreHistory';
        $scoreHistory = [];
    } else {
        $scoreHistory = formatScoreHistory($historyResult['data']);
    }

    // Improvement Trends
    $trendsResult = getImprovementTrends($studentId);
    if (!$trendsResult['success']) {
        $partialErrors[] = 'improvementTrends';
        $improvementTrends = [];
    } else {
        $improvementTrends = formatImprovementTrends($trendsResult['data']);
    }

    if (!empty($partialErrors)) {
        error_log('[PerfOverviewLogic] partial failure for student ' . $studentId . ': ' . implode(',', $partialErrors));
    }

    return [
        'success' => true,
        'courseProgress' => $courseProgress,
        'scoreHistory' => $scoreHistory,
        'improvementTrends' => $improvementTrends,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Course Progress: completed / total quizzes -> percentage.
 * A course with 0 published quizzes returns 0% instead of NAN.
 *
 * @param array $courses
 * @return array
 */
function formatCourseProgress(array $courses): array
{
    return array_map(function (array $course) {
        $total = (int) $course['total_quizzes'];
        $completed = (int) $course['completed_quizzes'];
        $percentage = $total > 0 ? round(($completed / $total) * 100, 0) : 0;

        return [
            'courseId' => (int) $course['course_id'],
            'courseTitle' => $course['course_title'],
            'completedQuizzes' => $completed,
            'totalQuizzes' => $total,
            'percentage' => (int) $percentage,
        ];
    }, $courses);
}

/**
 * Score History: raw score / max_score -> percentage.
 *
 * @param array $attempts
 * @return array
 */
function formatScoreHistory(array $attempts): array
{
    return array_map(function (array $attempt) {
        $maxScore = (float) $attempt['max_score'];
        $rawScore = (float) $attempt['score'];
        $percentage = $maxScore > 0 ? round(($rawScore / $maxScore) * 100, 0) : 0;

        return [
            'attemptId' => (int) $attempt['attempt_id'],
            'quizTitle' => $attempt['quiz_title'],
            'attemptedAt' => $attempt['completed_at'],
            'score' => (int) $percentage,
        ];
    }, $attempts);
}

/**
 * Improvement Trends: first/last attempt percentage per topic -> trend delta.
 *
 * @param array $topics
 * @return array
 */
function formatImprovementTrends(array $topics): array
{
    return array_map(function (array $topic) {
        $first = round((float) $topic['first_score'], 0);
        $last = round((float) $topic['last_score'], 0);

        return [
            'topicId' => (int) $topic['topic_id'],
            'topicTitle' => $topic['topic_title'],
            'attempts' => (int) $topic['attempts'],
            'firstScore' => (int) $first,
            'lastScore' => (int) $last,
            'trend' => (int) ($last - $first),
        ];
    }, $topics);
}