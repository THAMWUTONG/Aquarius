<?php
require_once __DIR__ . '/../Repository/UserRepository.php';

/**
 * Verifies credentials and returns the user's public data.
 * @param string $email
 * @param string $password
 * @return array
 * @throws Exception if credentials are invalid
 */
function authenticateUser(string $email, string $password): array
{
    $user = getUserByEmail($email);

    if ($user === null || !password_verify($password, $user["password_hash"])) {
        throw new Exception("Incorrect email or password");
    }

    unset($user["password_hash"]);
    return $user;
}