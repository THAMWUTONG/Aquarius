<?php
require_once __DIR__ . '/../Repository/UserRepository.php';

/**
 * Verifies credentials and returns the user's public data.
 * Retrieve data (Student ID / Programme / Intake / Name / Email / Account)
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

    updateLastAccess((int) $user["id"]);
    recordLoginHistory((int) $user["id"]);

    return formatAuthUser($user);
}
/**
 * Formats the raw DB row (users LEFT JOIN students/lecturers/admins)
 * into the response shape sent back to the frontend after login.
 *
 * @param array $user raw row from getUserByEmail()
 * @return array
 */
function formatAuthUser(array $user): array
{
    $result = [
        "id" => (int) $user["id"],
        "name" => $user["name"],
        "email" => $user["email"],
        "role" => $user["role"],
        "createdAt" => $user["created_at"],
    ];

    switch ($user["role"]) {
        case "student":
            $result["studentId"] = $user["student_id"];
            $result["programme"] = $user["programme"];
            $result["intake"] = $user["intake"];
            break;

        case "lecturer":
            $result["lecturerId"] = $user["lecturer_id"];
            $result["department"] = $user["department"];
            break;

        case "admin":
            $result["adminId"] = $user["admin_id"];
            break;
    }

    return $result;
}
