<?php
/**
 * LecDashboardRep.php
 *
 * Repository layer for the LECTURER dashboard.
 * Every query here is scoped to ONE lecturer - never institution-wide.
 *
 *   1. getLecturerRoster() -> lecturers + courses + enrollment + students + users
 *   2. getLecturerStats()  -> 4 headline counts in a single round trip
 *
 * IMPORTANT SCHEMA NOTE (the #1 source of silent bugs here):
 *   courses.lecturer_id is a VARCHAR(50) holding a business id like 'LC000001'
 *   and it points at lecturers.lecturer_id -- NOT at lecturers.id.
 *   $_SESSION['user_id'] holds the INT users.id (e.g. 7), which equals lecturers.id.
 *   So we must always enter through the lecturers table to translate int -> string.
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Fetch the classroom roster for one lecturer.
 *
 * A student appears ONCE even when enrolled in several of this lecturer's
 * courses; their course titles are folded into a single comma string.
 * Only 'active' enrollments are counted.
 *
 * @param int $lecturerUserId users.id / lecturers.id of the logged-in lecturer
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerRoster(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                s.id AS student_id,
                u.name,
                u.email,
                s.programme,
                s.intake,
                GROUP_CONCAT(DISTINCT c.title ORDER BY c.title SEPARATOR ', ') AS classes,
                u.last_access,
                (
                    SELECT AVG(qa.score / qmax.max_score * 100)
                    FROM quiz_attempts qa
                    JOIN quizzes q  ON qa.quiz_id = q.id
                    JOIN topics t   ON q.topic_id = t.id
                    JOIN courses c2 ON t.course_id = c2.id
                    JOIN (
                        SELECT quiz_id, SUM(score) AS max_score
                        FROM quiz_questions
                        GROUP BY quiz_id
                    ) qmax ON qmax.quiz_id = q.id
                    WHERE qa.student_id = s.id
                      AND c2.lecturer_id = l.lecturer_id
                      AND qmax.max_score > 0
                ) AS avg_progress
            FROM lecturers l
            JOIN courses c    ON c.lecturer_id = l.lecturer_id
            JOIN enrollment e ON e.course_id = c.id AND e.status = 'active'
            JOIN students s   ON s.id = e.student_id
            JOIN users u      ON u.id = s.id
            WHERE l.id = :lecturerId
            GROUP BY s.id, u.name, u.email, s.programme, s.intake, u.last_access
            ORDER BY u.name ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecDashboardRepository] getLecturerRoster failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Fetch the 4 headline counts for the lecturer dashboard.
 *
 * All four are "content the lecturer OWNS", resolved through course ownership
 * (topic -> course -> lecturer), NOT through created_by / uploaded_by. That way
 * a quiz an admin adds into this lecturer's course still counts as theirs.
 *
 * Uses four scalar subqueries in ONE statement instead of four separate
 * functions: the counts are a single logical unit for the UI, so one round
 * trip is cheaper and they succeed or fail together.
 *
 * Returns zeros (not an empty array) when the lecturer id does not exist,
 * so the caller never has to guard for a missing row.
 *
 * @param int $lecturerUserId users.id / lecturers.id of the logged-in lecturer
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerStats(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                (SELECT COUNT(DISTINCT e.student_id)
                   FROM courses c
                   JOIN enrollment e ON e.course_id = c.id AND e.status = 'active'
                  WHERE c.lecturer_id = l.lecturer_id) AS total_students,

                (SELECT COUNT(DISTINCT q.id)
                   FROM courses c
                   JOIN topics t  ON t.course_id = c.id
                   JOIN quizzes q ON q.topic_id = t.id
                  WHERE c.lecturer_id = l.lecturer_id) AS total_quizzes,

                (SELECT COUNT(DISTINCT sm.id)
                   FROM courses c
                   JOIN topics t          ON t.course_id = c.id
                   JOIN study_materials sm ON sm.topic_id = t.id
                  WHERE c.lecturer_id = l.lecturer_id) AS total_materials,

                (SELECT COUNT(DISTINCT qf.id)
                   FROM courses c
                   JOIN topics t          ON t.course_id = c.id
                   JOIN quizzes q         ON q.topic_id = t.id
                   JOIN quiz_feedback qf  ON qf.quiz_id = q.id
                  WHERE c.lecturer_id = l.lecturer_id) AS total_feedback
            FROM lecturers l
            WHERE l.id = :lecturerId";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        // No lecturers row -> fetch() returns false. Normalise to zeros.
        return [
            'success' => true,
            'data' => [
                'total_students'  => (int) ($row['total_students'] ?? 0),
                'total_quizzes'   => (int) ($row['total_quizzes'] ?? 0),
                'total_materials' => (int) ($row['total_materials'] ?? 0),
                'total_feedback'  => (int) ($row['total_feedback'] ?? 0),
            ],
        ];
    } catch (PDOException $e) {
        error_log('[LecDashboardRepository] getLecturerStats failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}
