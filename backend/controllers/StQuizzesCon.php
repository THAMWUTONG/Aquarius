<?php
/**
 * StQuizzesCon.php
 *
 *   1. handle CORS / HTTP headers
 *   2. Session using $_SESSION["user_id"]
 *   3. getStudentQuizzesData()（StQuizzesLogic.php）
 *   4. try-catch handling
 */

require_once __DIR__ . '/../logic/StQuizzesLog.php';

function handleQuizzesRequest(): void
{
    setQuizzesHeaders();

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
        $result = getStudentQuizzesData($studentId);

        if (!$result['success']) {
            sendQuizzesError("We couldn't fetch the data. Please try again later.", 500);
            return;
        }

        sendQuizzesSuccess($result);

    } catch (PDOException $e) {
        error_log('[QuizzesController] DB error: ' . $e->getMessage());
        sendQuizzesError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[QuizzesController] Unexpected error: ' . $e->getMessage());
        sendQuizzesError("Unknown server error, please try again later.", 500);
    }
}

/**
 * fetch('/api/quizzes.php', { credentials: 'include' })
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setQuizzesHeaders(): void
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

function sendQuizzesSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendQuizzesError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}