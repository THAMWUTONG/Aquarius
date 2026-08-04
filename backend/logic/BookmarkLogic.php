<?php

require_once __DIR__ . '/../repository/BookmarkRep.php';

/**
 * Toggle bookmark for a student.
 *
 * @param int $studentId
 * @param int $materialId
 * @return array{success: bool, isBookmarked?: bool, error?: string}
 */
function toggleBookmark(int $studentId, int $materialId): array
{
    if ($materialId <= 0) {
        return ['success' => false, 'error' => 'INVALID_MATERIAL_ID'];
    }

    return toggleBookmarkForStudent($studentId, $materialId);
}
