<?php
/**
 * ProfileController.php
 *
 *   1. handle CORS / HTTP headers
 *   2. $_SESSION["user_id"] verify（after login session）
 *   3. ProfileLogic.php -> getStProfileData()
 *   4. try-catch (db err + any err)
 */

require_once __DIR__ . '/../logic/ProfileLog.php';

function handleProfileRequest(): void
{
    setProfileHeaders();

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


    // If lecturers or admins need their own profile sections in the future, branch logic here
    $studentId = (int) $_SESSION['user_id'];

    try {
        $result = getStProfileData($studentId);
        sendProfileSuccess($result);

    } catch (PDOException $e) {
        error_log('[ProfileController] DB error: ' . $e->getMessage());
        sendProfileError("We couldn't fetch the data. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[ProfileController] Unexpected error: ' . $e->getMessage());
        sendProfileError("Unknown server error, please try again later.", 500);
    }
}

/**
 * fetch('/api/profile.php', { credentials: 'include' })
 *
 * // TODO: Before deploying to internet, remove all localhost and replace it with the domain name.
 */
function setProfileHeaders(): void
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

function sendProfileSuccess(array $result): void
{
    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function sendProfileError(string $message, int $httpCode): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
}