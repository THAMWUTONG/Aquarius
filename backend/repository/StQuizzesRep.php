<?php
/**
 * StQuizzesRep.php
 * 
 *
 *   1. getStudentQuizzes()        -> quiz basic info (course/topic/questions/duration)
 *   2. getStudentBestRawScores()  -> this student's highest raw score per quiz
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Fetch all published & approved quizzes belonging to courses the
 * student is actively enrolled in, with question count and total
 * possible score. 
 *
 * @param int $studentId
 * @return array{success: bool, data?: array, error?: string}
 */
function getStudentQuizzes(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                q.id,
                c.title AS course_name,
                q.title AS title,
                t.title AS topic_name,
                q.duration_min AS duration_in_minutes,
                COUNT(qq.id) AS number_of_questions,
                SUM(qq.score) AS total_score
            FROM quizzes q
            JOIN topics t ON q.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            JOIN enrollment e
                ON e.course_id = c.id
               AND e.student_id = :studentId
               AND e.status = 'active'
            JOIN quiz_questions qq ON qq.quiz_id = q.id
            WHERE q.is_published = 1
              AND q.regulation_status = 'approved'
            GROUP BY q.id, c.title, q.title, t.title, q.duration_min
            HAVING SUM(qq.score) > 0
            ORDER BY q.id ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[QuizzesRepository] getStudentQuizzes failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Fetch this student's highest raw score for every quiz they've
 * attempted at least once. Returned as [quiz_id => best_raw_score].
 * Percentage conversion happens in the Logic layer, once we have
 * total_score from getStudentQuizzes().
 *
 * @param int $studentId
 * @return array{success: bool, data?: array, error?: string}
 */
function getStudentBestRawScores(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT quiz_id, MAX(score) AS best_raw_score
            FROM quiz_attempts
            WHERE student_id = :studentId
            GROUP BY quiz_id";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        // Re-key by quiz_id for O(1) lookup in the Logic layer.
        $rows = $stmt->fetchAll();
        $byQuizId = [];
        foreach ($rows as $row) {
            //$row[
            //     0 => ['quiz_id' => 1, 'best_raw_score' => 80 ]
            //    ]
            //
            //$byQuizId[1] = 80
            $byQuizId[(int) $row['quiz_id']] = (float) $row['best_raw_score'];

            //$byQuizId = [ 1 => 80 ]
        }

        return ['success' => true, 'data' => $byQuizId];
    } catch (PDOException $e) {
        error_log('[QuizzesRepository] getStudentBestRawScores failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}