<?php
/**
 * LecDashboardCon.php
 *
 *   1. handle CORS / HTTP headers
 *   2. Session guard using $_SESSION['user_id'] AND $_SESSION['role']
 *   3. getLecturerDashboardData() (LecDashboardLogic.php)
 *   4. try-catch handling
 *
 * NOTE: every function here is prefixed 'LecDashboard' because procedural PHP
 * has ONE global function namespace -- setDashboardHeaders() already belongs to
 * StDashboardCon.php and cannot be redeclared.
 */

require_once __DIR__ . '/../logic/LecDashboardLogic.php';

function handleLecturerDashboardRequest(): void
{
    setLecDashboardHeaders();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 401 = we do not know who you are.
    if (empty($_SESSION['user_id'])) {
        sendLecDashboardError('Login First', 401);
        return;
    }

    // 403 = we know who you are, but this is not your dashboard.
    // Without this check a logged-in STUDENT could read the whole roster.
    if (($_SESSION['role'] ?? '') !== 'lecturer') {
        sendLecDashboardError('Lecturer access only', 403);
        return;
    }

    $lecturerId = (int) $_SESSION['user_id'];

    try {
        $result = getLecturerDashboardData($lecturerId);
        sendLecDashboardSuccess($result);

    } catch (PDOException $e) {
        error_log('[LecDashboardController] DB error: ' . $e->getMessage());
        sendLecDashboardError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecDashboardController] Unexpected error: ' . $e->getMessage());
        sendLecDashboardError("Unknown server error, please try again later.", 500);
    }
}

/**
 * set headers
 * fetch('/api/LecDashboard.php')
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setLecDashboardHeaders(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * @param array $result getLecturerDashboardData() return value
 */
function sendLecDashboardSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

/**
 * Outputs the final JSON error response.
 * Key is 'message' to match what the frontend services already read.
 *
 * @param string $message
 * @param int $httpCode
 */
function sendLecDashboardError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
}
