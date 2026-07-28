<?php
/**
 * LecContentRep.php
 *
 * Repository layer for the lecturer's OWN teaching content.
 *
 *   1. getLecturerQuizzes()   -> quizzes under the lecturer's course topics
 *   2. getLecturerMaterials() -> study materials under the same topics
 *
 * Ownership is always resolved the same way:
 *   lecturers.id (int, from session)
 *     -> lecturers.lecturer_id ('LC000001', varchar)
 *       -> courses.lecturer_id
 *         -> topics.course_id
 *           -> quizzes.topic_id / study_materials.topic_id
 */

require_once __DIR__ . '/../config/db.php';

/**
 * All quizzes belonging to this lecturer's courses.
 *
 * Question count and feedback count are scalar subqueries rather than extra
 * JOINs: joining quiz_questions AND quiz_feedback in one GROUP BY would let
 * the two one-to-many relationships multiply each other's rows and inflate
 * both counts.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerQuizzes(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                q.id,
                q.title,
                c.title AS course,
                t.title AS topic,
                q.duration_min,
                q.is_published,
                (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions,
                (SELECT COUNT(*) FROM quiz_feedback qf WHERE qf.quiz_id = q.id) AS comments
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN quizzes q ON q.topic_id = t.id
            WHERE l.id = :lecturerId
            ORDER BY c.title ASC, t.order_index ASC, q.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerQuizzes failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * All study materials belonging to this lecturer's courses.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerMaterials(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                sm.id,
                sm.title,
                sm.description,
                c.title AS course,
                t.title AS topic,
                sm.file_type,
                sm.file_name,
                sm.regulation_status,
                sm.uploaded_at,
                (SELECT COUNT(*)
                   FROM study_material_prerequisites p
                  WHERE p.material_id = sm.id) AS prerequisites
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            WHERE l.id = :lecturerId
            ORDER BY c.title ASC, t.order_index ASC, sm.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerMaterials failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}
