<?php
/**
 * StPerfOverviewCon.php
 *
 *   1. handle CORS / HTTP headers
 *   2. Session guard using $_SESSION["user_id"] + $_SESSION["role"] === 'student'
 *   3. call getPerformanceOverviewData()（StPerfOverviewLogic.php）
 *   4. try-catch handling
 *
 * Same shape as StDashboardCon.php — kept consistent on purpose.
 */

require_once __DIR__ . '/../logic/StPerOverviewLog.php';

function handlePerfOverviewRequest(): void
{
    setPerfOverviewHeaders();

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

    if (($_SESSION['role'] ?? '') !== 'student') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Insufficient permissions'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $studentId = (int) $_SESSION['user_id'];

    try {
        $result = getPerformanceOverviewData($studentId);
        sendPerfOverviewSuccess($result);

    } catch (PDOException $e) {
        error_log('[PerfOverviewController] DB error: ' . $e->getMessage());
        sendPerfOverviewError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[PerfOverviewController] Unexpected error: ' . $e->getMessage());
        sendPerfOverviewError("Unknown server error, please try again later.", 500);
    }
}

/**
 * fetch('/api/performance-overview.php', { credentials: 'include' })
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setPerfOverviewHeaders(): void
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

function sendPerfOverviewSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendPerfOverviewError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}