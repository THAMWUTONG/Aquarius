<?php

require_once __DIR__ . '/../config/db.php';

/**
 * Toggle bookmark for a student and material.
 * If a bookmark exists, remove it. Otherwise insert it.
 *
 * @param int $studentId
 * @param int $materialId
 * @return array{success: bool, isBookmarked?: bool, error?: string}
 */
function toggleBookmarkForStudent(int $studentId, int $materialId): array
{
    $pdo = getDbConnection();

    try {
        // check existing
        $stmt = $pdo->prepare('SELECT id FROM bookmarks WHERE student_id = :studentId AND material_id = :materialId');
        $stmt->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        if ($row) {
            // delete
            $del = $pdo->prepare('DELETE FROM bookmarks WHERE id = :id');
            $del->bindValue(':id', (int) $row['id'], PDO::PARAM_INT);
            $del->execute();
            return ['success' => true, 'isBookmarked' => false];
        }

        // insert
        $ins = $pdo->prepare('INSERT INTO bookmarks (student_id, material_id) VALUES (:studentId, :materialId)');
        $ins->bindValue(':studentId', $studentId, PDO::PARAM_INT);
        $ins->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $ins->execute();

        return ['success' => true, 'isBookmarked' => true];
    } catch (PDOException $e) {
        error_log('[BookmarkRep] toggleBookmarkForStudent failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}
