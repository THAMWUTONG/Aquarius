<?php
/**
 * LecGuard.php
 *
 * Shared session guard + JSON helpers for every LECTURER endpoint.
 *
 * Why this file exists: the authentication check is the one piece of logic you
 * must never copy-paste. Four controllers each with their own copy means four
 * chances to get it wrong, and a wrong copy silently exposes other people's
 * data. One implementation, used everywhere.
 *
 * Function names are prefixed 'Lec' because procedural PHP has a single global
 * function namespace - nothing here may clash with the student controllers.
 */

/**
 * Standard JSON + CORS headers for lecturer GET endpoints.
 *
 * // TODO: Before deploying to internet, replace '*' with the real domain name.
 */
function setLecApiHeaders(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * @param array $payload
 */
function sendLecJson(array $payload, int $httpCode = 200): void
{
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
}

/**
 * Key is 'message' so the frontend services can read it uniformly.
 */
function sendLecApiError(string $message, int $httpCode): void
{
    sendLecJson(['success' => false, 'message' => $message], $httpCode);
}

/**
 * Verifies the caller is a logged-in lecturer and returns their users.id.
 *
 * Returns null when the request has already been answered (OPTIONS preflight,
 * 401 or 403), so callers must stop immediately on null:
 *
 *     $lecturerId = requireLecturerSession();
 *     if ($lecturerId === null) { return; }
 *
 * @return int|null users.id of the lecturer, or null if the request is done
 */
function requireLecturerSession(): ?int
{
    setLecApiHeaders();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return null;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 401 = we do not know who you are.
    if (empty($_SESSION['user_id'])) {
        sendLecApiError('Login First', 401);
        return null;
    }

    // 403 = we know who you are, but this data is not yours.
    // The role comes from the SERVER session written at login, never from the
    // request body - a client could simply claim role=lecturer.
    if (($_SESSION['role'] ?? '') !== 'lecturer') {
        sendLecApiError('Lecturer access only', 403);
        return null;
    }

    return (int) $_SESSION['user_id'];
}
