<?php
/**
 * StSubmitQuizLogic.php
 *
 * Logic layer for submitting a quiz attempt.
 * Grading Here
 * 
 * 
 * Get data from DB -> filter data -> prevent student altering the data 
 * -> grade the attempt -> save the attempt to DB -> return the result to controller
 * 
 */

require_once __DIR__ . '/../repository/SubmitQuizRep.php';

/**
 * @param int   $studentId
 * @param int   $quizId
 * @param array $submittedAnswers  [ ['questionId' => int, 'answerId' => int|null], ... ]
 * @return array{success: bool, result?: array, error?: string}
 */
function submitQuizAttemptData(int $studentId, int $quizId, array $submittedAnswers): array
{
    $gradingResult = getQuizGradingData($studentId, $quizId);
    if (!$gradingResult['success']) {
        return ['success' => false, 'error' => $gradingResult['error']];
    }

    // Empty = quiz missing / unpublished / not approved / student not
    // enrolled. Controller turns this into a 404.
    if (empty($gradingResult['data'])) {
        return ['success' => false, 'error' => 'QUIZ_NOT_AVAILABLE'];
    }

    //verify the answer it valid 
    $answerKey = buildAnswerKey($gradingResult['data']);

    $selections = normaliseSubmittedAnswers($submittedAnswers, $answerKey);

    $grade = gradeAttempt($answerKey, $selections);

    $saveResult = saveQuizAttempt($studentId, $quizId, $grade['rawScore'], $grade['details']);
    if (!$saveResult['success']) {
        return ['success' => false, 'error' => $saveResult['error']];
    }

    return [
        'success' => true,
        'result' => [
            'attemptId' => $saveResult['attemptId'],
            'rawScore' => $grade['rawScore'],
            'totalScore' => $grade['totalScore'],
            'percentage' => $grade['totalScore'] > 0
                ? (int) round($grade['rawScore'] / $grade['totalScore'] * 100)
                : 0,
            'correctCount' => $grade['correctCount'],
            'totalQuestions' => count($answerKey),
        ],
    ];
}

/**
 * the joined rows  per question
 *   [ questionId => ['score' => float,
 *                    'correctAnswerId' => int&null,
 *                    'validAnswerIds' => int[]] ]
 * 
 * filter date from the DB, and make it easier to grade the attempt.
 *
 * @param array $rows
 * @return array
 */
function buildAnswerKey(array $rows): array
{
    $answerKey = [];

    foreach ($rows as $row) {
        $questionId = (int) $row['question_id'];

        if (!isset($answerKey[$questionId])) {
            $answerKey[$questionId] = [
                'score' => (float) $row['question_score'],
                'correctAnswerId' => null,
                'validAnswerIds' => [],
            ];
        }

        $answerId = (int) $row['answer_id'];
        $answerKey[$questionId]['validAnswerIds'][] = $answerId;

        if ((int) $row['is_correct'] === 1) {
            $answerKey[$questionId]['correctAnswerId'] = $answerId;
        }
    }

    return $answerKey;
}

/**
 * 
 *
 *   - question id not belonging to this quiz   -> dropped
 *     （questionid = first question, second question）
 * 
 *   - answer id not belonging to that question -> null (treated
 *     as skipped) and get logged
 *     （answerid = The specific option ID that the student selected and submitted,
 *       A/B/C/D, 101/102/103/104）
 * 
 *   - duplicate question id                    -> select last one, 
 *     which also protects the
 *     unique attempt question constraint
 *
 * @param array $submittedAnswers
 * @param array $answerKey
 * @return array
 */
function normaliseSubmittedAnswers(array $submittedAnswers, array $answerKey): array
{
    $selections = [];

    foreach ($submittedAnswers as $submitted) {
        if (!is_array($submitted) || !isset($submitted['questionId'])) {
            continue;
        }

        $questionId = (int) $submitted['questionId'];

        if (!isset($answerKey[$questionId])) {
            error_log("[SubmitQuizLogic] ignoring question {$questionId}  not part of this quiz");
            continue;
        }

        $answerId = $submitted['answerId'] ?? null;

        if ($answerId === null || $answerId === '') {
            $selections[$questionId] = null;
            continue; //mean ignore
        }

        $answerId = (int) $answerId;

        if (!in_array($answerId, $answerKey[$questionId]['validAnswerIds'], true)) {
            error_log("[SubmitQuizLogic] answer {$answerId} does not belong to question {$questionId} recorded as skipped");
            $selections[$questionId] = null;
            continue;
        }

        $selections[$questionId] = $answerId;
    }

    return $selections;
}

/**
 * Walk the answer key so every question of
 * the quiz gets a detail row —> unanswered ones are stored as “null”.
 * 
 * @param array $answerKey
 * @param array $selections
 * @return array{rawScore: float, totalScore: float, correctCount: int, details: array}
 */
function gradeAttempt(array $answerKey, array $selections): array
{
    $rawScore = 0.0;   // student's earned score
    $totalScore = 0.0; // total score of the quiz
    $correctCount = 0; // how many questions the student got right
    $details = [];

    foreach ($answerKey as $questionId => $question) {
        $totalScore += $question['score'];
        $selectedAnswerId = $selections[$questionId] ?? null;

        if ($selectedAnswerId !== null && $selectedAnswerId === $question['correctAnswerId']) {
            $rawScore += $question['score'];
            $correctCount++;
        }

        $details[] = [
            'questionId' => $questionId,
            'selectedAnswerId' => $selectedAnswerId,
        ];
    }

    return [
        'rawScore' => round($rawScore, 2), // two decimal places
        'totalScore' => round($totalScore, 2),
        'correctCount' => $correctCount,
        'details' => $details,
    ];
}