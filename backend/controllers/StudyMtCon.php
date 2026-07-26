<?php
/**
 * StudyMaterialsCon.php
 *
 *   1. handle CORS / HTTP headers
 *   2. Session $_SESSION["user_id"]
 *   3. getStudyMaterialsData()（StudyMtLogic.php）
 *   4. try-catch handling
 *
 */

require_once __DIR__ . '/../logic/StudyMtLogic.php';

function handleStudyMaterialsRequest(): void
{
    setStudyMaterialsHeaders();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Login First'], JSON_UNESCAPED_UNICODE);
        return;
    }

    // get date from session
    // Prevent students from changing parameters to see other people's bookmark status
    $studentId = (int) $_SESSION['user_id'];

    try {
        $result = getStudyMaterialsData($studentId);

        if (!$result['success']) {
            sendStudyMaterialsError("We couldn't fetch the study materials. Please try again later.", 500);
            return;
        }

        sendStudyMaterialsSuccess($result);

    } catch (PDOException $e) {
        error_log('[StudyMaterialsController] DB error: ' . $e->getMessage());
        sendStudyMaterialsError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[StudyMaterialsController] Unexpected error: ' . $e->getMessage());
        sendStudyMaterialsError("Unknown server error, please try again later.", 500);
    }
}

/**
 * set header and session
 * fetch('/api/study-materials.php', { credentials: 'include' })
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setStudyMaterialsHeaders(): void
{
    // $allowedOrigins = [
    //     'http://localhost:5173',
    //     'http://localhost:5174',
    //     'http://localhost:5175',
    //     'http://localhost:7777',
    // ];

    // $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // if (in_array($requestOrigin, $allowedOrigins, true)) {
    //     header("Access-Control-Allow-Origin: $requestOrigin");
    //     header('Access-Control-Allow-Credentials: true');
    // }

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

function sendStudyMaterialsSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendStudyMaterialsError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}