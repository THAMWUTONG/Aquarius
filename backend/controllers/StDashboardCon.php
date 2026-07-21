<?php
/**
 *   1. handle CORS / HTTP headers
 *   2. Session using $_SESSION["user_id"]，
 *   3. getStudentDashboardData()（DashboardLogic.php）
 *   4. try-catch handling
 */


require_once __DIR__ . '/../logic/StDashboardLogic.php';

/**
 */
function handleDashboardRequest(): void
{
    setDashboardHeaders();

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

    $studentId = (int) $_SESSION['user_id'];

    try {
        $result = getStudentDashboardData($studentId);
        sendDashboardSuccess($result);

    } catch (PDOException $e) {
        error_log('[DashboardController] DB error: ' . $e->getMessage());
        sendDashboardError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[DashboardController] Unexpected error: ' . $e->getMessage());
        sendDashboardError("Unknown server error, please try again later.", 500);
    }
}

/**
 * set header and session
 * fetch('/api/dashboard.php', { credentials: 'include' })
 * 
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setDashboardHeaders(): void
{
    $allowedOrigins = [// can add if the ports are different.
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:7777',

    ];

    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($requestOrigin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $requestOrigin");
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * 输出成功响应
 * @param array $result getStudentDashboardData() 的返回值
 */
function sendDashboardSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

/**
 * Outputs the final JSON response
 * @param string $message return error message
 * @param int $httpCode 
 */
function sendDashboardError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}

