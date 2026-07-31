<?php
// dir use to find everywhere the file located
// find database.php and UMR, require once avoid duplicate
require_once __DIR__ . '/../Repository/UserManagementRepository.php';
require_once __DIR__ . '/../config/db.php';

// using private for repository 
class UserManagementLogic {
    private $repo;
    
    // create UMR for saving or other action to repo 
    public function __construct() {
        $this->repo = new UserManagementRepository();
    }
    
    // passed userid for verify admin
    // check from repo is correct is admin
    // false throw error message
    public function verifyAdmin(int $userId): void {
        if (!$this->repo->isAdmin($userId)) {
            throw new Exception("Unauthorized: Admin access required", 403);
        }
    }
    
    // get all the user without no matter what role it is and using limit and offset as barrier to limit 
    // den get all the user data from repo
    public function getUsers(string $role = null, int $limit = 100, int $offset = 0): array {
        return $this->repo->getAllUsers($role, $limit, $offset);
    }
    
    // to get the user info based on input userid
    // find from repo if correct return user
    // if false return error message
    public function getUserAccount(int $userId): array {
        $user = $this->repo->getUserById($userId);
        if (!$user) {
            throw new Exception("User not found", 404);
        }
        return $user;
    }
    
    // to get the admin info based on input userid
    // find from repo if correct return admin
    // if false return error message
    public function getAdminProfile(int $userId): array {
        $admin = $this->repo->getAdminByUserId($userId);
        if (!$admin) {
            throw new Exception("Admin not found", 404);
        }
        return $admin;
    }
    
    public function getAllAdmins(): array {
        return $this->repo->getAllAdmins();
    }
    
    public function createAdminUser(int $userId): array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = :user_id");
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        if (!$stmt->fetch()) {
            throw new Exception("User not found", 404);
        }
        
        if ($this->repo->isAdmin($userId)) {
            throw new Exception("User is already an admin", 400);
        }
        
        $result = $this->repo->createAdmin($userId);
        if (!$result) {
            throw new Exception("Failed to create admin", 500);
        }
        
        // log action record for current admin--creating a new admin
        $this->repo->logAction($userId, "Created admin user ID: {$userId}");
        return $this->getAdminProfile($userId);
    }
    
    public function removeAdminRole(int $userId): bool {
        if (!$this->repo->isAdmin($userId)) {
            throw new Exception("User is not an admin", 400);
        }
        
        // record of current admin remove another admin(userid)
        $result = $this->repo->removeAdmin($userId);
        if ($result) {
            $this->repo->logAction($userId, "Removed admin role from user ID: {$userId}");
        }
        return $result;
    }
    
    public function getAuditLogs(int $limit = 100, int $offset = 0): array {
        return $this->repo->getAuditLogs($limit, $offset);
    }

    // create-user: validate everything before touching the repo.
    // Password is hashed here (PASSWORD_DEFAULT, cost 12) — the repo never sees plaintext.
    public function createUserAccount(int $adminId, string $name, string $email, string $password, string $role): array {
        $validRoles = ['student', 'lecturer', 'admin'];
        if (!in_array($role, $validRoles)) {
            throw new Exception("Invalid role. Must be 'student', 'lecturer', or 'admin'", 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email address", 400);
        }
        if (strlen($password) < 6) {
            throw new Exception("Password must be at least 6 characters", 400);
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);

        try {
            $newUserId = $this->repo->createUser($name, $email, $passwordHash, $role);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new Exception("A user with this email already exists", 409);
            }
            throw new Exception("Failed to create user", 500);
        }

        $this->repo->logAction($adminId, "Created new {$role} account: {$name} ({$email})");
        return $this->getUserAccount($newUserId);
    }

    // update-user: only name/email are editable here.
    // NOTE: changing a user's role after creation is NOT handled — the old
    // role-specific row (students/lecturers/admins) would be left behind while
    // the new role has no matching row, causing broken joins elsewhere
    // (getUserById's role_id/department_or_programme would come back null).
    // A proper role-migration flow (move row between role tables, generate a
    // new role-specific ID, etc.) would need to be built separately.
    public function updateUserAccount(int $adminId, int $userId, string $name, string $email): array {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email address", 400);
        }
        $existing = $this->repo->getUserById($userId);
        if (!$existing) {
            throw new Exception("User not found", 404);
        }

        $result = $this->repo->updateUserBasic($userId, $name, $email);
        if (!$result) {
            throw new Exception("Failed to update user", 500);
        }

        $this->repo->logAction($adminId, "Updated user account ID: {$userId}");
        return $this->getUserAccount($userId);
    }

    // delete-user: fully removes an account (any role). Cascades to the
    // matching students/lecturers/admins row via the schema's ON DELETE CASCADE.
    public function deleteUserAccount(int $adminId, int $userId): bool {
        if ($userId === $adminId) {
            throw new Exception("Cannot delete your own account", 400);
        }
        $existing = $this->repo->getUserById($userId);
        if (!$existing) {
            throw new Exception("User not found", 404);
        }

        $result = $this->repo->deleteUserById($userId);
        if ($result) {
            $this->repo->logAction($adminId, "Deleted user account: {$existing['name']} (ID: {$userId})");
        }
        return $result;
    }
}