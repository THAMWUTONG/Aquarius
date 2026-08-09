<?php
/**
 * StSubmitQuizRep.php
 *
 * Repository layer for submitting a quiz attempt.
 *
 *   1. getQuizGradingData()  -> every question of a quiz + its score +
 *                               its correct answer id (server-side grading)
 * 
 *   2. saveQuizAttempt()     -> INSERT quiz_attempts + quiz_attempt_details
 *                               inside a single transaction
 *
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Fetch the grading key for a quiz: for every question, its own
 * weight (score), its correct answer id, and every valid answer id
 * belonging to it.
 *
 * Access control is baked into the JOIN chain — returns nothing if
 * the quiz isn't published/approved, or if the student isn't actively
 * enrolled in the course it belongs to. Same guard as the
 * quiz-questions endpoint, so a student can't submit to a quiz they
 * were never allowed to open.
 *
 * @param int $studentId
 * @param int $quizId
 * @return array{success: bool, data?: array, error?: string}
 */
function getQuizGradingData(int $studentId, int $quizId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                qq.id AS question_id,
                qq.score AS question_score,
                qq.explanation AS question_explanation,
                qa.id AS answer_id,
                qa.is_correct
            FROM quiz_questions qq
            JOIN quizzes q ON qq.quiz_id = q.id
            JOIN topics t ON q.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            JOIN enrollment e
                ON e.course_id = c.id
               AND e.student_id = :studentId
               AND e.status = 'active'
            JOIN quiz_answers qa ON qa.question_id = qq.id
            WHERE qq.quiz_id = :quizId
              AND q.is_published = 1
              AND q.regulation_status = 'approved'
            ORDER BY qq.id ASC, qa.id ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[SubmitQuizRepository] getQuizGradingData failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Write one attempt + one detail row per question, atomically.
 * If any detail row fails, the whole attempt is rolled back so
 * never end up with a scored attempt that has no answer records.
 * Also updates quiz feedback.
 *
 * @param int   $studentId
 * @param int   $quizId
 * @param float $score       raw score (NOT a percentage)
 * @param array $details     [ ['questionId' => int, 'selectedAnswerId' => int|null], ... ]
 * @return array{success: bool, attemptId?: int, error?: string}
 */
function saveQuizAttempt(int $studentId, int $quizId, float $score, array $details, string $feedback): array
{
    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $attemptSql = "INSERT INTO quiz_attempts (student_id, quiz_id, score, completed_at)
                       VALUES (:studentId, :quizId, :score, NOW())";

        $attemptStmt = $pdo->prepare($attemptSql);
        $attemptStmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $attemptStmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        $attemptStmt->bindValue(':score', $score);
        $attemptStmt->execute();

        $attemptId = (int) $pdo->lastInsertId();

        $detailSql = "INSERT INTO quiz_attempt_details (attempt_id, question_id, selected_answer_id)
                      VALUES (:attemptId, :questionId, :selectedAnswerId)";
        $detailStmt = $pdo->prepare($detailSql);

        foreach ($details as $detail) {
            $detailStmt->bindValue(':attemptId', $attemptId, PDO::PARAM_INT);
            $detailStmt->bindValue(':questionId', $detail['questionId'], PDO::PARAM_INT);

            // NULL means the student skipped this question.
            if ($detail['selectedAnswerId'] === null) {
                $detailStmt->bindValue(':selectedAnswerId', null, PDO::PARAM_NULL);
            } else {
                $detailStmt->bindValue(':selectedAnswerId', $detail['selectedAnswerId'], PDO::PARAM_INT);
            }

            $detailStmt->execute();
        }

        if (!empty($feedback)) {
            $updateFeedbackSql = "INSERT INTO quiz_feedback (student_id, quiz_id, comment)
                                  VALUES (:studentId, :quizId, :feedback1)
                                  ON DUPLICATE KEY UPDATE comment = :feedback2";

            $updateFeedbackStmt = $pdo->prepare($updateFeedbackSql);
            $updateFeedbackStmt->bindValue(':feedback1', $feedback, PDO::PARAM_STR);
            $updateFeedbackStmt->bindValue(':feedback2', $feedback, PDO::PARAM_STR);
            $updateFeedbackStmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
            $updateFeedbackStmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
            $updateFeedbackStmt->execute();
        }

        $pdo->commit();

        return ['success' => true, 'attemptId' => $attemptId];

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[SubmitQuizRepository] saveQuizAttempt failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_WRITE_FAILED'];
    }
}