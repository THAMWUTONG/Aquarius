<?php

require_once __DIR__ . '/../config/db.php';

/**
 * get Course         -> title, id
 * get Study Material -> id, title, descrip, file path, file type, prerequisites
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
                GROUP_CONCAT(prereq.title ORDER BY prereq.title SEPARATOR ' , ') AS prerequisite_title,
                GROUP_CONCAT(DISTINCT tg.name ORDER BY tg.id SEPARATOR ',') AS tags,
                t.title AS topic_title,
                c.id AS course_id,
                c.title AS course_title,
                IF(b.id IS NOT NULL, 1, 0) AS Bookmarked
            FROM study_materials sm
            JOIN topics t ON sm.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            LEFT JOIN study_material_prerequisites smp ON sm.id = smp.material_id
            LEFT JOIN study_materials prereq ON smp.prerequisite_id = prereq.id
            LEFT JOIN study_material_tags smt ON sm.id = smt.material_id
            LEFT JOIN tags tg ON smt.tag_id = tg.id
            JOIN enrollment en
                ON en.course_id = c.id
                AND en.student_id = :studentId1
                AND en.status = 'active'
            LEFT JOIN bookmarks b
                ON b.material_id = sm.id AND b.student_id = :studentId2
            WHERE sm.regulation_status = 'approved'
            GROUP BY
                sm.id,
                sm.title,
                sm.description,
                sm.file_path,
                sm.file_type,
                t.title,
                c.id,
                c.title,
                b.id
            ORDER BY sm.uploaded_at DESC";


    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':studentId1', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':studentId2', $studentId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StudyMaterialsListRepository] getAllMaterialsForStudent failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}