<?php
require_once __DIR__ . '/../config/db.php';

/**
 * Retrieves the stored password hash for a given user.
 * @param int $userId
 * @return string|null The bcrypt hash, or null if the user doesn't exist.
 */
function getPasswordHashById(int $userId): ?string
{
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :id");
    $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch();
    return $row === false ? null : $row['password_hash'];
}

/**
 * Overwrites a user's stored password hash.
 * @param int $userId
 * @param string $newHash - Already-hashed password (never store plaintext).
 * @return bool
 */
function updatePasswordHash(int $userId, string $newHash): bool
{
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
    return $stmt->execute([':hash' => $newHash, ':id' => $userId]);
}