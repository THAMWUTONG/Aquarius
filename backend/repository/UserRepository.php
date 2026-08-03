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

    $sql = "SELECT
                u.id,
                u.name,
                u.email,
                u.password_hash,
                u.role,
                u.created_at,
                s.student_id,
                s.programme,
                s.intake,
                l.lecturer_id,
                l.department,
                a.admin_id
            FROM users u
            LEFT JOIN students  s ON s.id = u.id AND u.role = 'student'
            LEFT JOIN lecturers l ON l.id = u.id AND u.role = 'lecturer'
            LEFT JOIN admins    a ON a.id = u.id AND u.role = 'admin'
            WHERE u.email = :email";

    $stmt = $pdo->prepare($sql);
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

/**
 * Records a login event so platform-wide daily usage can be reconstructed later.
 * @param int $userId
 * @return void
 */
function recordLoginHistory(int $userId): void
{
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("INSERT INTO login_history (user_id) VALUES (:id)");
    $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
}