<?php
/**
 * StPerfOverviewRep.php
 *
 *
 *   1. getCourseProgress()    -> enrollment + topics + quizzes + quiz_attempts
 *   2. getScoreHistory()      -> quiz_attempts + quizzes + quiz_questions
 *   3. getImprovementTrends() -> quiz_attempts + quizzes + topics + quiz_questions (window functions)
 *
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Course Progress: 
 * for every ACTIVE enrollment of the student,
 * count total APPROVED quizzes under that course vs. quizzes the
 * student has attempted at least once (DISTINCT quiz_id).
 *
 * @param int $studentId
 * @return array{success: bool, data?: array, error?: string}
 */
function getCourseProgress(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                c.id AS course_id,
                c.title AS course_title,
                COUNT(DISTINCT q.id) AS total_quizzes,
                COUNT(DISTINCT CASE WHEN qa.id IS NOT NULL THEN q.id END) AS completed_quizzes
            FROM enrollment e
            JOIN courses c ON e.course_id = c.id
            JOIN topics t ON t.course_id = c.id
            JOIN quizzes q ON q.topic_id = t.id AND q.regulation_status = 'approved'
            LEFT JOIN quiz_attempts qa
                ON qa.quiz_id = q.id AND qa.student_id = :studentId1
            WHERE e.student_id = :studentId2
              AND e.status = 'active'
            GROUP BY c.id, c.title
            ORDER BY c.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId1', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':studentId2', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[PerfOverviewRepository] getCourseProgress failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Score History: the student's last quiz attempts, most recent first.
 * Score is returned as raw + max so Logic layer can compute the percentage.
 *
 * @param int $studentId
 * @param int $limit
 * @return array{success: bool, data?: array, error?: string}
 */
function getScoreHistory(int $studentId, int $limit = 8): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                qa.id AS attempt_id,
                q.title AS quiz_title,
                qa.completed_at,
                qa.score,
                qmax.max_score
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN (
                SELECT quiz_id, SUM(score) AS max_score
                FROM quiz_questions
                GROUP BY quiz_id
            ) qmax ON qmax.quiz_id = q.id
            WHERE qa.student_id = :studentId
              AND qmax.max_score > 0
            ORDER BY qa.completed_at DESC
            LIMIT :limit";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[PerfOverviewRepository] getScoreHistory failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Improvement Trends: 
 * per topic, how many attempts the student made
 * across all quizzes under that topic, + the percentage of the
 * FIRST (earliest completed_at) and LAST (latest completed_at) attempt.
 *
 * Uses ROW_NUMBER() identify first/last attempt per topic
 * Without an extra DB trip.
 *
 * @param int $studentId
 * @return array{success: bool, data?: array, error?: string}
 */
function getImprovementTrends(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                x.topic_id,
                x.topic_title,
                COUNT(*) AS attempts,
                MAX(CASE WHEN x.rn_asc = 1 THEN x.percentage END) AS first_score,
                MAX(CASE WHEN x.rn_desc = 1 THEN x.percentage END) AS last_score
            FROM (
                SELECT
                    t.id AS topic_id,
                    t.title AS topic_title,
                    (qa.score / qmax.max_score * 100) AS percentage,
                    qa.completed_at,

                    ROW_NUMBER() OVER (
                        PARTITION BY t.id ORDER BY qa.completed_at ASC, qa.id ASC
                    ) AS rn_asc,
                    -- First (earliest completed_at) 
                    ROW_NUMBER() OVER (
                        PARTITION BY t.id ORDER BY qa.completed_at DESC, qa.id DESC
                    ) AS rn_desc
                    -- LAST (latest completed_at) 
                
                FROM quiz_attempts qa
                JOIN quizzes q ON qa.quiz_id = q.id
                JOIN topics t ON q.topic_id = t.id
                JOIN (
                    SELECT quiz_id, SUM(score) AS max_score
                    FROM quiz_questions
                    GROUP BY quiz_id
                ) qmax ON qmax.quiz_id = q.id
                WHERE qa.student_id = :studentId
                  AND qmax.max_score > 0
            ) x
            GROUP BY x.topic_id, x.topic_title
            ORDER BY x.topic_title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[PerfOverviewRepository] getImprovementTrends failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}