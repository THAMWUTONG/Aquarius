<?php
/**
 * StGenScheduleRep.php  (Repository Layer)
 *
 *   1. getWeakTopicsForScheduling() -> quiz_attempts + quiz_questions + topics (avg < threshold)
 *   2. insertStudySchedule()        -> INSERT one row into study_schedule
 *
 * Note: getWeakTopicsForScheduling() is the same query as
 * StDashboardRep.php::getWeakTopics(), just renamed to avoid
 * "Cannot redeclare function" if both repo files were ever
 * required in the same request.
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Fetch the student's weak topics, weakest first (ASC), so the
 * earliest free date gets paired with the topic that needs the
 * most attention.
 *
 * @param int   $studentId
 * @param float $threshold  average % below which a topic counts as "weak"
 * @return array{success: bool, data?: array, error?: string}
 */
function getWeakTopicsForScheduling(int $studentId, float $threshold = 70.0): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                t.id AS topic_id,
                t.title AS topic_title,
                AVG(qa.score / qmax.max_score * 100) AS avg_percentage
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN topics t ON q.topic_id = t.id
            JOIN enrollment e
                ON e.course_id = t.course_id
               AND e.student_id = qa.student_id
               AND e.status = 'active'
            JOIN (
                SELECT quiz_id, SUM(score) AS max_score
                FROM quiz_questions
                GROUP BY quiz_id
            ) qmax ON qmax.quiz_id = q.id
            WHERE qa.student_id = :studentId
              AND qmax.max_score > 0
            GROUP BY t.id, t.title
            HAVING AVG(qa.score / qmax.max_score * 100) < :threshold
            ORDER BY avg_percentage ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':threshold', $threshold);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StGenScheduleRep] getWeakTopicsForScheduling failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Insert one (topic, date) pair into study_schedule.
 *
 * @param int    $studentId
 * @param int    $topicId
 * @param string $scheduledDate  'YYYY-MM-DD'
 * @return array{success: bool, data?: int, error?: string}  data = new insert id
 */
function insertStudySchedule(int $studentId, int $topicId, string $scheduledDate): array
{
    $pdo = getDbConnection();

    $sql = "INSERT INTO study_schedule (student_id, topic_id, scheduled_date)
            VALUES (:studentId, :topicId, :scheduledDate)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':topicId', $topicId, PDO::PARAM_INT);
        $stmt->bindValue(':scheduledDate', $scheduledDate, PDO::PARAM_STR);
        $stmt->execute();

        return ['success' => true, 'data' => (int) $pdo->lastInsertId()];
    } catch (PDOException $e) {
        error_log('[StGenScheduleRep] insertStudySchedule failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_INSERT_FAILED'];
    }
}