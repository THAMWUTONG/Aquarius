<?php
/**
 * StudyMaterialRepository.php
 * 
 * Query only the ‘study_materials’ table 
 *
 *   study_materials(id, title, description, file_name, file_path,
 *                    file_type, topic_id, uploaded_by,
 *                    regulation_status, uploaded_at)
 * 
 *   topics(id, course_id, title, description, order_index)
 * 
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Search for relevant information based on keywords 
 * ( title, description, or related topic titles)
 * 
 * Return only results where regulation_status = ‘approved’.
 *
 * @param string $keyword
 * @param int $limit
 * @return array{success: bool, data?: array, error?: string}
 */
function findMaterialsByKeyword(string $keyword, int $limit = 3): array
{
    if (trim($keyword) === '') {
        return ['success' => true, 'data' => []];
    }

    $pdo = getDbConnection();

    $sql = "SELECT sm.id, sm.title, sm.file_path
            FROM study_materials sm
            LEFT JOIN topics t ON sm.topic_id = t.id
            WHERE sm.regulation_status = 'approved'
              AND (sm.title LIKE :keyword1 OR sm.description LIKE :keyword2 OR t.title LIKE :keyword3)
            ORDER BY sm.uploaded_at DESC
            LIMIT :limit";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':keyword1', '%' . $keyword . '%', PDO::PARAM_STR);
        $stmt->bindValue(':keyword2', '%' . $keyword . '%', PDO::PARAM_STR);
        $stmt->bindValue(':keyword3', '%' . $keyword . '%', PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StudyMaterialRepository] findMaterialsByKeyword failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * If no relevant documents are found, 
 * return the most recent documents that have been approved.
 *
 * @param int $limit
 * @return array{success: bool, data?: array, error?: string}
 */
function findRecentMaterials(int $limit = 3): array
{
    $pdo = getDbConnection();

    $sql = "SELECT sm.id, sm.title, sm.file_path
            FROM study_materials sm
            WHERE sm.regulation_status = 'approved'
            ORDER BY sm.uploaded_at DESC
            LIMIT :limit";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[StudyMaterialRepository] findRecentMaterials failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}