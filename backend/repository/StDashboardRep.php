<?php
/**
 * DashboardRepository.php
 *
 *   1. getEnrolledCourses()      -> enrollment JOIN courses
 *   2. getTotalQuizzesAttempted() -> quiz_attempts
 *   3. getUpcomingEvents()       -> important_events
 *   4. getWeakTopics()           -> quiz_attempts + quiz_questions + topics
 *
 */

require_once __DIR__ . '/db.php';

/**
 * Fetch enrolled courses for a student
 * Only returns courses with status = 'active'
 *
 * @param int $studentId
 * @return array{success: bool, data?: array, error?: string}
 */
function getEnrolledCourses(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT c.id, c.title, c.description
            FROM enrollment e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = :studentId
              AND e.status = 'active'
            ORDER BY c.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[DashboardRepository] getEnrolledCourses failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Total Quiz （Without counting duplicate attempts）DISTINCT
 *
 * @param int $studentId
 * @return array{success: bool, data?: int, error?: string}
 */
function getTotalQuizzesAttempted(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT COUNT(DISTINCT quiz_id) AS total
            FROM quiz_attempts
            WHERE student_id = :studentId";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();
        return ['success' => true, 'data' => (int) ($row['total'] ?? 0)];
    } catch (PDOException $e) {
        error_log('[DashboardRepository] getTotalQuizzesAttempted failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 *
 * @param int $studentId
 * @param int $limit
 * @return array{success: bool, data?: array, error?: string}
 */
function getUpcomingEvents(int $studentId, int $limit = 3): array
{
    $pdo = getDbConnection();

    $sql = "SELECT id, title, event_date, event_type
            FROM important_events
            WHERE student_id = :studentId
              AND event_date >= CURDATE()
            ORDER BY event_date ASC
            LIMIT :limit";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[DashboardRepository] getUpcomingEvents failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Weak Topic（Average score of all quiz attempts under this topic < 70%）
 * 1. Percentage per attempt = attempt.score / total quiz score (SUM(quiz_questions.score)) * 100
 * 2. Average Percentage within topic
 * 
 * @param int $studentId
 * @param float $threshold 
 * @return array{success: bool, data?: array, error?: string}
 */
function getWeakTopics(int $studentId, float $threshold = 70.0): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                t.id AS topic_id,
                t.title AS topic_title,
                AVG(qa.score / qmax.max_score * 100) AS avg_percentage
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
        error_log('[DashboardRepository] getWeakTopics failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}