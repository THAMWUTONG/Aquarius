<?php
/**
 *
 *   1. Handle CORS / HTTP headers
 *   2. Receive the "question" POSTed from the frontend
 *   3. Do basic input validation (empty value, too-long text)
 *   4. Try-catch fallback 
 *  
 */

require_once __DIR__ . '/../logic/ChatbotLogic.php';

const MAX_QUESTION_LENGTH = 1000; // Maximum length of the question text

/**
 * handling chatbot Q&A.
 * echoes JSON
 */
function handleAskRequest(): void
{
    setChatbotHeaders();


    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        sendChatbotError('Login First', 401);
        return;
    }


    try {
        $validation = validateQuestionInput();

        if (!$validation['valid']) {
            sendChatbotError($validation['error'], 400);
            return;
        }

        $result = handleQuestion($validation['question']);

        if (!$result['success']) {
            handleCbotLogError($result['error']);
            return;
        }

        sendChatbotSuccess($result['answerText']);

    } catch (PDOException $e) {
        error_log('[ChatbotController] DB error: ' . $e->getMessage());
        sendChatbotError('Failed to look up materials, please try again later', 500);

    } catch (Throwable $e) {
        // Handle any unexpected errors
        error_log('[ChatbotController] Unexpected error: ' . $e->getMessage());
        sendChatbotError('Serverside error, please try again later.', 500);
    }
}

/**
 * Return error messages related to the chatbot
 * @param string $errorCode
 */
function handleCbotLogError(string $errorCode): void
{
    $knownGeminiErrors = [
        'API_KEY_MISSING',
        'NETWORK_ERROR',
        'API_BAD_STATUS',
        'INVALID_JSON',
        'UNEXPECTED_RESPONSE_SHAPE',
    ];

    if (in_array($errorCode, $knownGeminiErrors, true)) {

        sendChatbotError('Something wrong on AI Server', 502);
        return;
    }

    // unknown error
    sendChatbotError('Try again, something wrong on Server', 500);
}

/**
 * Set headers for the chatbot API
 */
function setChatbotHeaders(): void
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
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * Reads and validates the "question" field from the request body.
 * 
 * @return array{valid: bool, question?: string, error?: string}
 */
function validateQuestionInput(): array
{
    $rawInput = file_get_contents('php://input'); // JSON, XML or any other format.
    $data = json_decode($rawInput, true);

    // add $_POST for backend testing using Postman.
    $question = $data['question'] ?? $_POST['question'] ?? null;

    if ($question === null || trim((string) $question) === '') {
        return ['valid' => false, 'error' => 'Question cannot be empty'];
    }

    $question = trim((string) $question);

    //Multi byte string length 
    if (mb_strlen($question) > MAX_QUESTION_LENGTH) {
        return [
            'valid' => false,
            'error' => 'Question exceeds maximum length (' . MAX_QUESTION_LENGTH . ' characters)',
            // "Question exceeds maximum length (1000 characters)" without hardcode
        ];
    }

    return ['valid' => true, 'question' => $question];
}

/**
 * Success response
 * @param string $answerText
 */
function sendChatbotSuccess(string $answerText): void
{
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'answerText' => $answerText,
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * Failure response 
 * @param string $message 
 * @param int $httpCode 
 */
function sendChatbotError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode([
        'success' => false,
        'error' => $message,
    ], JSON_UNESCAPED_UNICODE);
}
