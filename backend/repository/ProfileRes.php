<?php
/**
 * ProfileRepository.php
 *
 * Only search for "Active Enrolled Courses（Course Name + Enrolled At）"
 */

require_once __DIR__ . '/db.php';

/**
 * Fetch student's ACTIVE enrolled courses, and 
 * The lastest enrollment date will sh on top, older one below.
 *
 * @param int $studentId
 * @return array{success: bool, data?: array, error?: string}
 */
function getEnlCourses(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT c.id, c.title, e.enrolled_at
            FROM enrollment e
            JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = :studentId
              AND e.status = 'active'
            ORDER BY e.enrolled_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[ProfileRepository] getActiveEnrolledCoursesForProfile failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}