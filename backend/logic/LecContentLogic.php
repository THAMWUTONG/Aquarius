<?php
/**
 * LecContentLogic.php
 *
 * Shapes the lecturer's quizzes and materials for the frontend tables.
 */

require_once __DIR__ . '/../repository/LecContentRep.php';

/**
 * @param int $lecturerUserId
 * @return array{success: bool, quizzes: array, partialErrors: array}
 */
function getLecturerQuizzesData(int $lecturerUserId): array
{
    $partialErrors = [];

    $result = getLecturerQuizzes($lecturerUserId);
    if (!$result['success']) {
        $partialErrors[] = 'quizzes';
        $quizzes = [];
        error_log('[LecContentLogic] quizzes failed for lecturer ' . $lecturerUserId);
    } else {
        $quizzes = formatLecturerQuizzes($result['data']);
    }

    return [
        'success' => true,
        'quizzes' => $quizzes,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * @param int $lecturerUserId
 * @return array{success: bool, materials: array, partialErrors: array}
 */
function getLecturerMaterialsData(int $lecturerUserId): array
{
    $partialErrors = [];

    $result = getLecturerMaterials($lecturerUserId);
    if (!$result['success']) {
        $partialErrors[] = 'materials';
        $materials = [];
        error_log('[LecContentLogic] materials failed for lecturer ' . $lecturerUserId);
    } else {
        $materials = formatLecturerMaterials($result['data']);
    }

    return [
        'success' => true,
        'materials' => $materials,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Counts arrive from PDO as strings; casting here stops React from doing
 * string comparisons like "0" > 0 later on.
 *
 * @param array $rows
 * @return array
 */
function formatLecturerQuizzes(array $rows): array
{
    return array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'course' => $row['course'],
            'topic' => $row['topic'],
            'questions' => (int) $row['questions'],
            'comments' => (int) $row['comments'],
            'durationMin' => isset($row['duration_min']) ? (int) $row['duration_min'] : null,
            'isPublished' => (bool) $row['is_published'],
        ];
    }, $rows);
}

/**
 * file_type is stored lowercase ('pdf', 'slides', 'video', 'document') but the
 * table renders a badge in capitals. Uppercasing is presentation, so the raw
 * value is passed through as 'fileType' and the badge text is built in JSX.
 *
 * prerequisites is returned as a NUMBER, not the string '1 topics' the mock
 * data used - the frontend decides how to word it.
 *
 * @param array $rows
 * @return array
 */
function formatLecturerMaterials(array $rows): array
{
    return array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'course' => $row['course'],
            'topic' => $row['topic'],
            'fileType' => $row['file_type'],
            'fileName' => $row['file_name'],
            'prerequisites' => (int) $row['prerequisites'],
            'regulationStatus' => $row['regulation_status'],
            'uploadedAt' => !empty($row['uploaded_at'])
                ? substr($row['uploaded_at'], 0, 10)
                : null,
        ];
    }, $rows);
}
