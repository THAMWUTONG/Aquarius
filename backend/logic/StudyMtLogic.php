<?php
/**
 * StudyMaterialsLogic.php
 */

require_once __DIR__ . '/../repository/StudyMtRep.php';

/**
 * @param int $studentId
 * @return array{success: bool, materials?: array, error?: string}
 */
function getStudyMaterialsData(int $studentId): array
{
    $result = getAllMaterialsForStudent($studentId);

    if (!$result['success']) {
        return ['success' => false, 'error' => $result['error']];
    }

    return [
        'success' => true,
        'materials' => formatMaterials($result['data']),
    ];
}

/**
 * Every field is a string, so we need to convert them to their respective data types
 * 
 * @param array $rows
 * @return array
 */
function formatMaterials(array $rows): array
{
    return array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'courseId' => (int) $row['course_id'],
            'courseTitle' => $row['course_title'],
            'topicTitle' => $row['topic_title'],
            'title' => $row['title'],
            'description' => $row['description'],
            'fileType' => $row['file_type'],
            'filePath' => $row['file_path'],
            'isBookmarked' => (bool) $row['Bookmarked'],
        ];
    }, $rows);
}