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

    $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = :email");
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    $user = $stmt->fetch();
    return $user === false ? null : $user;
}