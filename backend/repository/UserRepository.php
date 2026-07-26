<?php
require_once __DIR__ . '/../config/db.php';

/**
 * Retrieves a user record by email.
 * @param string $email
 * @return array|null
 */
function getUserByEmail(string $email): ?array
{
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = :email");
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    $user = $stmt->fetch();
    return $user === false ? null : $user;
}

/**
 * Updates user's last_access timestamp to now.
 * Called after a successful login so we can track when each user last logged in.
 * @param int $userId
 * @return void
 */
function updateLastAccess(int $userId): void
{
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("UPDATE users SET last_access = CURRENT_TIMESTAMP WHERE id = :id");
    $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
}