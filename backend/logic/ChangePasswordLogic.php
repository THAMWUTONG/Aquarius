<?php
require_once __DIR__ . '/../repository/ChangePasswordRepository.php';

/**
 * Validates and applies a password change for the given user.
 * @param int $userId
 * @param string $currentPassword - Plaintext current password, verified against the stored hash.
 * @param string $newPassword - Plaintext new password.
 * @param string $confirmPassword - Must match $newPassword exactly.
 * @return void
 * @throws Exception If validation fails or the current password is incorrect.
 */
function changeUserPassword(int $userId, string $currentPassword, string $newPassword, string $confirmPassword): void
{
    if ($newPassword !== $confirmPassword) {
        throw new Exception("New password and confirmation do not match", 400);
    }
    if (strlen($newPassword) < 6) {
        throw new Exception("New password must be at least 6 characters", 400);
    }
    if ($newPassword === $currentPassword) {
        throw new Exception("New password must be different from the current password", 400);
    }

    $existingHash = getPasswordHashById($userId);
    if ($existingHash === null) {
        throw new Exception("User not found", 404);
    }

    if (!password_verify($currentPassword, $existingHash)) {
        throw new Exception("Current password is incorrect", 401);
    }

    $newHash = password_hash($newPassword, PASSWORD_DEFAULT, ['cost' => 12]);
    $result = updatePasswordHash($userId, $newHash);
    if (!$result) {
        throw new Exception("Failed to update password", 500);
    }
}