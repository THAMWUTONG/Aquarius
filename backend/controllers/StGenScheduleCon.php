<?php
/**
 * StGenScheduleCon.php  (Controller Layer)
 *
 *   1. handle CORS / HTTP headers (origin whitelist, NOT '*')
 *   2. Session guard using $_SESSION['user_id']
 *   3. generateStudySchedule() (StGenScheduleLog.php)
 *   4. try-catch handling
 */

require_once __DIR__ . '/../logic/StGenScheduleLog.php';

function handleGenerateScheduleRequest(): void
{
    setGenScheduleHeaders();

    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
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

    $studentId = (int) $_SESSION['user_id'];

    $inputData = json_decode(file_get_contents('php://input'), true);

    if (!is_array($inputData)) {
        sendGenScheduleError('Invalid request body', 400);
        return;
    }

    try {
        $result = generateStudySchedule($studentId, $inputData['freeDates'] ?? null);

        if (!$result['success']) {
            sendGenScheduleError($result['error'], 400);
            return;
        }

        http_response_code(201);
        echo json_encode(['success' => true] + $result['data'], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        error_log('[StGenScheduleCon] DB error: ' . $e->getMessage());
        sendGenScheduleError("We couldn't generate the schedule. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[StGenScheduleCon] Unexpected error: ' . $e->getMessage());
        sendGenScheduleError('Unknown server error, please try again later.', 500);
    }
}

/**
 * Origin whitelist pattern — session cookie 需要 credentials: 'include'，
 * 所以不能用 Access-Control-Allow-Origin: *
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setGenScheduleHeaders(): void
{
    // $allowedOrigins = [ // can add if the ports are different.
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
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

function sendGenScheduleError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}