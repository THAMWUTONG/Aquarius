<?php
/**
 * ChangePasswordController.php
 * Handles request/response formatting for the password-change endpoint.
 * Does NOT contain business logic or SQL — delegates to ChangePasswordLogic.php.
 */

require_once __DIR__ . '/../logic/ChangePasswordLogic.php';

/**
 * Sets standard JSON response headers for this endpoint.
 * @return void
 */
function setChangePasswordHeaders(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * Handles POST /api/ChangePassword.php.
 * Requires an active session (any role) — validates that the requester is
 * logged in, then delegates the actual password change to ChangePasswordLogic.
 * @return void
 */
function handleChangePasswordRequest(): void
{
    setChangePasswordHeaders();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Input validation: requester must have an active session.
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: please log in first']);
        return;
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $input = json_decode(file_get_contents("php://input"), true) ?: [];
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';

    // Input validation: all three fields required before touching the logic layer.
    if (!$currentPassword || !$newPassword || !$confirmPassword) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password, new password, and confirmation are all required']);
        return;
    }

    try {
        $userId = (int) $_SESSION['user_id'];
        changeUserPassword($userId, $currentPassword, $newPassword, $confirmPassword);
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } catch (Exception $e) {
        $code = $e->getCode() ?: 400;
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}