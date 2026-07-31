<?php
/**
 * LecProfileRep.php
 *
 * Repository layer for the lecturer profile page.
 *
 *   1. getLecturerCourses() -> courses taught + active student count
 *
 * Static profile fields (name, email, department, lecturer_id) are NOT fetched
 * here. They already come back from login in AuthLogic.php and live in the
 * frontend AuthContext - the same split the student profile page uses. This
 * repository only supplies DERIVED data that login cannot know.
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Courses this lecturer teaches, each with its active enrollment count.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerCourses(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                c.id,
                c.title,
                c.description,
                c.created_at,
                (SELECT COUNT(DISTINCT e.student_id)
                   FROM enrollment e
                  WHERE e.course_id = c.id
                    AND e.status = 'active') AS student_count,
                (SELECT COUNT(DISTINCT t.id)
                   FROM topics t
                  WHERE t.course_id = c.id) AS topic_count
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            WHERE l.id = :lecturerId
            ORDER BY c.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecProfileRepository] getLecturerCourses failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * The stored bcrypt hash for one user, used to verify their current password.
 *
 * @param int $userId
 * @return string|null null when the user row is gone
 */
function getUserPasswordHash(int $userId): ?string
{
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :userId");
    $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();

    $hash = $stmt->fetchColumn();
    return $hash === false ? null : (string) $hash;
}

/**
 * Writes a new password hash.
 *
 * Takes an already-hashed value: hashing belongs in the logic layer so this
 * function cannot be called with a plaintext password by mistake.
 *
 * @param int    $userId
 * @param string $passwordHash output of password_hash()
 * @return array{success: bool, error?: string}
 */
function updateUserPassword(int $userId, string $passwordHash): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE id = :userId");
        $stmt->bindValue(':hash', $passwordHash, PDO::PARAM_STR);
        $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        error_log('[LecProfileRepository] updateUserPassword failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}
