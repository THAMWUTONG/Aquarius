<?php
/**
 * StCalendarCon.php  (Controller Layer)
 *
 *   1. handle CORS / HTTP headers (origin whitelist, NOT '*')
 *   2. Session guard using $_SESSION['user_id']
 *   3. getStudentCalendarData() (StCalendarLog.php)
 *   4. try-catch handling
 */

require_once __DIR__ . '/../logic/StCalenderLog.php';

function handleCalendarRequest(): void
{
    setCalendarHeaders();

    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'OPTIONS') {
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

    $studentId = (int) $_SESSION['user_id'];

    if ($method === 'GET') {
        handleGetCalendar($studentId);
        return;
    }

    if ($method === 'POST') {
        handleAddEvent($studentId);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
}

/**
 * GET /api/StCalendar.php -> important events + study schedule
 */
function handleGetCalendar(int $studentId): void
{
    try {
        $result = getStudentCalendarData($studentId);
        sendCalendarSuccess($result);

    } catch (PDOException $e) {
        error_log('[StCalendarCon] DB error: ' . $e->getMessage());
        sendCalendarError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[StCalendarCon] Unexpected error: ' . $e->getMessage());
        sendCalendarError('Unknown server error, please try again later.', 500);
    }
}

/**
 * POST /api/StCalendar.php -> Add New Event button (Screenshot 1)
 * Body: { "title": "...", "eventDate": "YYYY-MM-DD", "eventType": "exam"|"assignment"|"personal" }
 */
function handleAddEvent(int $studentId): void
{
    // Content-Type 是 application/json，必须用 php://input 读，$_POST 拿不到
    $inputData = json_decode(file_get_contents('php://input'), true);

    if (!is_array($inputData)) {
        sendCalendarError('Invalid request body', 400);
        return;
    }

    try {
        $result = addImportantEvent(
            $studentId,
            $inputData['title'] ?? null,
            $inputData['eventDate'] ?? null,
            $inputData['eventType'] ?? null
        );

        if (!$result['success']) {
            sendCalendarError($result['error'], 400);
            return;
        }

        http_response_code(201);
        echo json_encode(['success' => true, 'event' => $result['data']], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        error_log('[StCalendarCon] DB error: ' . $e->getMessage());
        sendCalendarError("We couldn't save the event. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[StCalendarCon] Unexpected error: ' . $e->getMessage());
        sendCalendarError('Unknown server error, please try again later.', 500);
    }
}

/**
 * session cookie {credentials: 'include'}
 * 
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setCalendarHeaders(): void
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
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

function sendCalendarSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendCalendarError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}