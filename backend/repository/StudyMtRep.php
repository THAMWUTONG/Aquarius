<?php

require_once __DIR__ . '/../config/db.php';

/**
 * get Course         -> title, id
 * get Study Material -> id, title, descrip, file path, file type
 * get Topic          -> title (Topic name)
 * 
 * Only show the Study Material that is "Approved"
 *
 * @param int $studentId current student's ID to check thier bookmarked
 * @return array{success: bool, data?: array, error?: string}
 */
function getAllMaterialsForStudent(int $studentId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                sm.id,
                sm.title,
                sm.description,
                sm.file_path,
                sm.file_type,
                t.title AS topic_title,
                c.id AS course_id,
                c.title AS course_title,
                IF(b.id IS NOT NULL, 1, 0) AS Bookmarked
            FROM study_materials sm
            JOIN topics t ON sm.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            LEFT JOIN bookmarks b
                ON b.material_id = sm.id AND b.student_id = :studentId
            WHERE sm.regulation_status = 'approved'
            ORDER BY sm.uploaded_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StudyMaterialsListRepository] getAllMaterialsForStudent failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}