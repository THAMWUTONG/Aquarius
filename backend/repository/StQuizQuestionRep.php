<?php
/**
 * StQuizQuestionsRep.php
 *
 * Fetches every question + its 4 answer options for a given quiz.
 *
 *
 * Prevent users from changing url and overwiting. 
 * Check other courses IDOR over-of-the-right vulnerabilities
 */

require_once __DIR__ . '/../config/db.php';

/**
 * @param int $studentId
 * @param int $quizId
 * @return array{success: bool, data?: array, error?: string}
 */
function getQuizQuestionsForStudent(int $studentId, int $quizId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                qq.id AS question_id,
                qq.question,
                qq.order_index,
                qa.id AS answer_id,
                qa.answer_text
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
            ORDER BY qq.order_index ASC, qq.id ASC, qa.id ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[QuizQuestionsRepository] getQuizQuestionsForStudent failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}