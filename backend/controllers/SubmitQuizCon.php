<?php
/**
 * StSubmitQuizCon.php
 *
 *   1. handle CORS / HTTP headers
 *   2. POST only
 *   3. Session using $_SESSION["user_id"]
 *   4. validate JSON body (quizId + answers)
 *   5. submitQuizAttemptData()（StSubmitQuizLogic.php）
 *   6. try-catch handling
 *
 */

require_once __DIR__ . '/../logic/SubmitQuizLog.php';

function handleSubmitQuizRequest(): void
{
    setSubmitQuizHeaders();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        sendSubmitQuizError('Method not allowed', 405);
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

    // Content-Type is application/json, so read php://input, not $_POST
    $inputData = json_decode(file_get_contents('php://input'), true);

    if (!is_array($inputData)) {
        sendSubmitQuizError('Invalid JSON body', 400);
        return;
    }

    $quizId = filter_var($inputData['quizId'] ?? null, FILTER_VALIDATE_INT);
    if ($quizId === false || $quizId === null || $quizId <= 0) {
        sendSubmitQuizError('Missing or invalid quizId', 400);
        return;
    }

    $answers = $inputData['answers'] ?? null;
    if (!is_array($answers)) {
        sendSubmitQuizError('Missing or invalid answers', 400);
        return;
    }

    $feedback = $inputData['feedback'] ?? '';

    try {
        $result = submitQuizAttemptData($studentId, $quizId, $answers, $feedback);

        if (!$result['success']) {
            // Quiz doesn't exist, isn't published/approved, or this
            // student isn't enrolled 
            if (($result['error'] ?? '') === 'QUIZ_NOT_AVAILABLE') {
                sendSubmitQuizError('Quiz not found', 404);
                return;
            }

            sendSubmitQuizError("We couldn't save your attempt. Please try again later.", 500);
            return;
        }

        sendSubmitQuizSuccess($result);

    } catch (PDOException $e) {
        error_log('[SubmitQuizController] DB error: ' . $e->getMessage());
        sendSubmitQuizError("We couldn't save your attempt. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[SubmitQuizController] Unexpected error: ' . $e->getMessage());
        sendSubmitQuizError('Unknown server error, please try again later.', 500);
    }
}

/**
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setSubmitQuizHeaders(): void
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
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

function sendSubmitQuizSuccess(array $result): void
{
    http_response_code(201);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendSubmitQuizError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}