<?php
/**
 * StQuizQuestionsCon.php
 *
 *   1. handle CORS / HTTP headers
 *   2. Session using $_SESSION["user_id"]
 *   3. validate ?quizId= from query string
 *   4. getQuizQuestionsData()（StQuizQuestionsLogic.php）
 *   5. try-catch handling
 */

require_once __DIR__ . '/../logic/StQuizQuestionLog.php';

function handleQuizQuestionsRequest(): void
{
    setQuizQuestionsHeaders();

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

    // quizId comes from the query string: /api/quiz-questions.php?quizId=5
    $quizId = filter_input(INPUT_GET, 'quizId', FILTER_VALIDATE_INT);
    if ($quizId === false || $quizId === null || $quizId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing or invalid quizId'], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $result = getQuizQuestionsData($studentId, $quizId);

        if (!$result['success']) {
            sendQuizQuestionsError("We couldn't fetch the data. Please try again later.", 500);
            return;
        }

        // Empty list = quiz doesn't exist, isn't published/approved, or
        // this student isn't enrolled in its course. Same 404 for all
        // three so we don't leak which one it is.
        if (empty($result['questionList'])) {
            sendQuizQuestionsError('Quiz not found', 404);
            return;
        }

        sendQuizQuestionsSuccess($result);

    } catch (PDOException $e) {
        error_log('[QuizQuestionsController] DB error: ' . $e->getMessage());
        sendQuizQuestionsError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[QuizQuestionsController] Unexpected error: ' . $e->getMessage());
        sendQuizQuestionsError("Unknown server error, please try again later.", 500);
    }
}

/**
 * fetch(`/api/quiz-questions.php?quizId=${quizId}`, { credentials: 'include' })
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setQuizQuestionsHeaders(): void
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

function sendQuizQuestionsSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendQuizQuestionsError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}