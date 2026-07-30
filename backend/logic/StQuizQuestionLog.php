<?php
/**
 * StQuizQuestionsLogic.php
 *
 * Repackage the data retrieved from the database into the 
 * 'one question, four options' format.
 * (answer1id/answer1 ...., answer4id/answer4,) 
 */

require_once __DIR__ . '/../repository/StQuizQuestionRep.php';

/**
 * @param int $studentId
 * @param int $quizId
 * @return array{success: bool, questionList?: array, error?: string}
 */
function getQuizQuestionsData(int $studentId, int $quizId): array
{
    $result = getQuizQuestionsForStudent($studentId, $quizId);

    if (!$result['success']) {
        return ['success' => false, 'error' => $result['error']];
    }

    // Empty result means either the quiz doesn't exist, isn't published/
    // approved yet, or this student isn't enrolled in its course —
    // the controller decides how to respond to that.
    return [
        'success' => true,
        'questionList' => formatQuestionList($result['data']),
    ];
}

/**
 * @param array $rows one row per (question, answer) pair, already
 *                     ordered by order_index -> question id -> answer id
 * @return array list of questions, each with answer1..answer4 flattened
 */
function formatQuestionList(array $rows): array
{
    $questionsById = [];

    foreach ($rows as $row) {
        $questionId = (int) $row['question_id'];

        if (!isset($questionsById[$questionId])) {
            $questionsById[$questionId] = [
                'id' => $questionId,
                'question' => $row['question'],
                'answers' => [], // temporary, flattened below
            ];
        }

        // Only keep the first 4 options per question, in case a question
        // ever ends up with more than 4 answer rows in the DB.
        if (count($questionsById[$questionId]['answers']) < 4) {
            $questionsById[$questionId]['answers'][] = [
                'id' => (int) $row['answer_id'],
                'text' => $row['answer_text'],
            ];
        }
    }

    if (empty($questionsById)) {
        return [];
    }

    return array_values(array_map(function (array $q) {
        $flat = [
            'id' => $q['id'],
            'question' => $q['question'],
        ];

        for ($i = 0; $i < 4; $i++) {
            $slot = $i + 1;
            $answer = $q['answers'][$i] ?? null;
            $flat["answer{$slot}id"] = $answer['id'] ?? null;
            $flat["answer{$slot}"] = $answer['text'] ?? null;

            if ($answer === null) {
                error_log("[QuizQuestionsLogic] question {$q['id']} has fewer than 4 answers");
            }
        }

        return $flat;
    }, $questionsById));
}