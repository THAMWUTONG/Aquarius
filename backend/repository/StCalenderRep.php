<?php
/**
 * StCalendarRep.php  (Repository Layer)
 *
 *   1. getImportantEvents()  -> important_events (event_date >= CURDATE())
 *   2. getStudySchedule()    -> study_schedule JOIN topics (scheduled_date >= CURDATE())
 *
 *  based on the MySQL date.
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Fetch the student's important events, today or later only.
 *
 * @param int $studentId  users.id (from $_SESSION['user_id'])
 * @return array{success: bool, data?: array, error?: string}
 */
function getImportantEvents(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT id, title, event_date, event_type
            FROM important_events
            WHERE student_id = :studentId
                 AND YEAR(event_date) = YEAR(CURDATE())
                 AND MONTH(event_date) = MONTH(CURDATE())
            --   AND event_date >= CURDATE()
            ORDER BY event_date ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StCalendarRep] getImportantEvents failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Fetch the student's study schedule, today or later only.
 * Join topics so the calendar can show the topic title
 *
 * @param int $studentId  users.id (from $_SESSION['user_id'])
 * @return array{success: bool, data?: array, error?: string}
 */
function getStudySchedule(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT ss.id,
                   ss.topic_id,
                   t.title AS topic_title,
                   ss.scheduled_date
            FROM study_schedule ss
            JOIN topics t ON ss.topic_id = t.id
            WHERE ss.student_id = :studentId
              AND ss.scheduled_date >= CURDATE()
            ORDER BY ss.scheduled_date ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StCalendarRep] getStudySchedule failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Insert a new important event for the student (Add New Event button).
 *
 * @param int    $studentId
 * @param string $title
 * @param string $eventDate  'YYYY-MM-DD'
 * @param string $eventType  'exam' | 'assignment' | 'personal'
 * @return array{success: bool, data?: int, error?: string}  data = new insert id
 */
function insertImportantEvent(int $studentId, string $title, string $eventDate, string $eventType): array
{
    $pdo = getDbConnection();

    $sql = "INSERT INTO important_events (student_id, title, event_date, event_type)
            VALUES (:studentId, :title, :eventDate, :eventType)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':title', $title, PDO::PARAM_STR);
        $stmt->bindValue(':eventDate', $eventDate, PDO::PARAM_STR);
        $stmt->bindValue(':eventType', $eventType, PDO::PARAM_STR);
        $stmt->execute();

        return ['success' => true, 'data' => (int) $pdo->lastInsertId()];
    } catch (PDOException $e) {
        error_log('[StCalendarRep] insertImportantEvent failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_INSERT_FAILED'];
    }
}