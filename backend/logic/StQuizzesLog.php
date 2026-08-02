<?php
/**
 * StQuizzesLogic.php
 *
 * 1. Merges the two repository queries 
 * 2. converts raw DB rows into
 * 
 * 
 *  （id, courseName, title, topicName, bestScore,
 *   numberOfQuestions, durationInMinute )
 */

require_once __DIR__ . '/../repository/StQuizzesRep.php';

/**
 * @param int $studentId
 * @return array{success: bool, quizzes?: array, error?: string}
 */
function getStudentQuizzesData(int $studentId): array
{
    $quizzesResult = getStudentQuizzes($studentId);
    if (!$quizzesResult['success']) {
        return ['success' => false, 'error' => $quizzesResult['error']];
    }

    $scoresResult = getStudentBestRawScores($studentId);
    if (!$scoresResult['success']) {
        // Best-score lookup failing shouldn't block the whole list —
        // just fall back to showing every quiz as "not attempted".
        error_log('[QuizzesLogic] best scores lookup failed for student ' . $studentId);
        $bestRawScoresByQuizId = [];
    } else {
        $bestRawScoresByQuizId = $scoresResult['data'];
    }

    return [
        'success' => true,
        'quizzes' => formatStudentQuizzes($quizzesResult['data'], $bestRawScoresByQuizId),
    ];
}

/**
 * bestScore is rounded to the nearest whole percent 
 * (matches the "50%","70%", "100%" shown on ui). 
 * It stays null when the student hasn't attempted the quiz yet
 * 
 * (Example show "Not attempted" instead of a progress bar).
 *
 * @param array $rows                     rows from getStudentQuizzes()
 * @param array $bestRawScoresByQuizId    [quiz_id => best_raw_score] from getStudentBestRawScores()
 * @return array
 */
function formatStudentQuizzes(array $rows, array $bestRawScoresByQuizId): array
{
    return array_map(function (array $row) use ($bestRawScoresByQuizId) {
        $quizId = (int) $row['id'];
        $totalScore = (float) $row['total_score'];
        $bestRawScore = $bestRawScoresByQuizId[$quizId] ?? null;

        $bestScore = $bestRawScore !== null
            ? (int) round($bestRawScore / $totalScore * 100)
            : null;

        return [
            'id' => $quizId,
            'courseName' => $row['course_name'],
            'title' => $row['title'],
            'topicName' => $row['topic_name'],
            'bestScore' => $bestScore,
            'numberOfQuestions' => (int) $row['number_of_questions'],
            'durationInMinutes' => $row['duration_in_minutes'] !== null ? (int) $row['duration_in_minutes'] : null,
        ];
    }, $rows);
}