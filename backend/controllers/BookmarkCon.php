<?php

require_once __DIR__ . '/../logic/BookmarkLogic.php';

function handleBookmarkRequest(): void
{
    setBookmarkHeaders();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Login First']);
        return;
    }

    $studentId = (int) $_SESSION['user_id'];

    $inputData = json_decode(file_get_contents('php://input'), true);
    $materialId = isset($inputData['materialId']) ? (int) $inputData['materialId'] : 0;

    if ($materialId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid material id']);
        return;
    }

    try {
        $result = toggleBookmark($studentId, $materialId);

        if (!$result['success']) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $result['error'] ?? 'Unknown']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'isBookmarked' => $result['isBookmarked']]);
    } catch (PDOException $e) {
        error_log('[BookmarkController] DB error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'DB_ERROR']);
    } catch (Throwable $e) {
        error_log('[BookmarkController] Unexpected error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Unknown server error']);
    }
}

function setBookmarkHeaders(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}
