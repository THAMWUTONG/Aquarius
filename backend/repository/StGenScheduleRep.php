<?php
/**
 * StGenScheduleRep.php 
 *
 *   1. getWeakTopicsForScheduling() -> quiz_attempts + quiz_questions + topics (avg < threshold)
 *   2. getNonWeakTopicsForScheduling() -> >= threshold first, then never-attempted last
 *   3. insertStudySchedule()        -> Insert into study_schedule（table）
 *
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Fetch the weakest one and place it at the first
 *
 * @param int   $studentId
 * @param float $threshold  average below counts as weak
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
            HAVING AVG(qa.score / qmax.max_score * 100) < :threshold -- score below 79.0
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
 * Fetch the student's non-weak topics 
 *   FIRST topics whose average quiz score is >= threshold (70.0)
 *   LAST  topics the student has never attempted a quiz 
 *     
 *
 * lowest average first -> never-attempted topics last
 *
 * @param int   $studentId
 * @param float $threshold  same threshold used by getWeakTopicsForScheduling()
 * @return array{success: bool, data?: array, error?: string}
 */
function getNonWeakTopicsForScheduling(int $studentId, float $threshold = 70.0): array
{
    $pdo = getDbConnection();

    $sql = "SELECT topic_id, topic_title, avg_percentage
            FROM (
                SELECT
                    t.id AS topic_id,
                    t.title AS topic_title,
                    AVG(qa.score / qmax.max_score * 100) AS avg_percentage
                FROM topics t
                JOIN enrollment e
                    ON e.course_id = t.course_id
                   AND e.student_id = :studentId1
                   AND e.status = 'active'
                LEFT JOIN quizzes q ON q.topic_id = t.id
                LEFT JOIN quiz_attempts qa
                    ON qa.quiz_id = q.id
                   AND qa.student_id = :studentId2
                LEFT JOIN (
                    SELECT quiz_id, SUM(score) AS max_score
                    FROM quiz_questions
                    GROUP BY quiz_id
                ) qmax ON qmax.quiz_id = q.id AND qmax.max_score > 0
                GROUP BY t.id, t.title
            ) topic_scores
            WHERE avg_percentage IS NULL
               OR avg_percentage >= :threshold
            ORDER BY avg_percentage IS NULL ASC, avg_percentage ASC";

    // if want never-attempted topics first, change the “avg_percentage IS NULL ASC ”ASC to DESC
    // "avg_percentage IS NULL" -> user never attempted the quiz
    // ",avg_percentage" ASC (from lowest average -> highest average)

    try {
        $stmt = $pdo->prepare($sql);

        $stmt->bindValue(':studentId1', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':studentId2', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':threshold', $threshold);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StGenScheduleRep] getNonWeakTopicsForScheduling failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Insert one (topic, date)  into study_schedule
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