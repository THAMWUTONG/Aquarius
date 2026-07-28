<?php

// dir use to find everywhere the file located
// find database.php, require once avoid duplicate
require_once __DIR__ . '/../config/db.php';

class UserManagementRepository {
    
    // connect to database $pdo=db connection ->query =to send the query to db what flwing command (send SQL directly)
    // connect the user table with role table with left join (user info left, role infor right)
    // int $limit = 100, int $offset = 0....limit to show 100 record  offset is like passed by how many record start with 0 [1st page 10, when go to 2nd page den offset=10]
    public function getAllUsers(string $role = null, int $limit = 100, int $offset = 0): array {
        $pdo = getDbConnection();
        $sql = "
            SELECT 
                u.id, u.name, u.email, u.role, u.created_at, u.last_access,
                CASE 
                    WHEN u.role = 'student' THEN s.student_id 
                    WHEN u.role = 'lecturer' THEN l.lecturer_id 
                    WHEN u.role = 'admin' THEN a.admin_id 
                END as role_id,
                CASE 
                    WHEN u.role = 'student' THEN s.programme 
                    WHEN u.role = 'lecturer' THEN l.department 
                END as department_or_programme,
                (SELECT COUNT(*) FROM enrollment WHERE student_id = u.id AND status = 'active') as active_enrollments,
                (SELECT COUNT(*) FROM quiz_attempts WHERE student_id = u.id) as total_quiz_attempts
            FROM users u
            LEFT JOIN students s ON u.id = s.id
            LEFT JOIN lecturers l ON u.id = l.id
            LEFT JOIN admins a ON u.id = a.id
        ";
        
        // use .= bcz of add on at behind not as normal join together
        // use by frontend admin to choose based on role
        // use this method for bindValue (kind of identity before access) below for safety of db without get attack  
        if ($role) {
            $sql .= " WHERE u.role = :role";
        }
        
        // order by desc only picking the latest limit and offset record
        $sql .= " ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset";
        
        // $stmt=response from db (contains my data), prepare first havent send
        // get the role and return in string format
        // set the limit and offset, in integer format
        // when everything done, execute
        // return the result based on search/role
        $stmt = $pdo->prepare($sql);
        if ($role) {
            $stmt->bindValue(':role', $role, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // get db connection, den prepare flwing data
    // join user table and role table
    // based on user id in int format
    // execute and fetch data from db
    // if false return null, true return the user details
    public function getUserById(int $userId): ?array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT 
                u.id, u.name, u.email, u.role, u.created_at, u.last_access,
                CASE 
                    WHEN u.role = 'student' THEN s.student_id 
                    WHEN u.role = 'lecturer' THEN l.lecturer_id 
                    WHEN u.role = 'admin' THEN a.admin_id 
                END as role_id,
                CASE 
                    WHEN u.role = 'student' THEN s.programme 
                    WHEN u.role = 'lecturer' THEN l.department 
                END as department_or_programme,
                (SELECT COUNT(*) FROM enrollment WHERE student_id = u.id AND status = 'active') as active_enrollments,
                (SELECT COUNT(*) FROM quiz_attempts WHERE student_id = u.id) as total_quiz_attempts,
                (SELECT COUNT(*) FROM bookmarks WHERE student_id = u.id) as total_bookmarks
            FROM users u
            LEFT JOIN students s ON u.id = s.id
            LEFT JOIN lecturers l ON u.id = l.id
            LEFT JOIN admins a ON u.id = a.id
            WHERE u.id = :user_id
        ");
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch();
        return $user === false ? null : $user;
    }
    
    // verify of admin using userID
    // connect to db, prepare sql check [id from admin table==userID in user table]
    // input by frontend userid in int format for verify isn't admin
    // execute the sql
    // return results, if not return false
    public function isAdmin(int $userId): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT id FROM admins WHERE id = :user_id");
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch() !== false;
    }
    
    // get admin using user id
    // get db connection den prepare sql (get all from admin table and 3 from user)
    // join together based on admin/user id, main table is admin, user info join inside admin table
    // frontend provide user id in int form for search admin info
    // fetch data from db
    // false return null, true return selected admin info
    public function getAdminByUserId(int $userId): ?array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT a.*, u.name, u.email, u.role 
            FROM admins a 
            JOIN users u ON a.id = u.id 
            WHERE a.id = :user_id
        ");
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $admin = $stmt->fetch();
        return $admin === false ? null : $admin;
    }
    
    // get all the admin info
    // connect db den execute query (* from admin, 5 from user)
    // join together, admin main table, user join
    // order by desc based on user/admin id
    // fetch all data
    public function getAllAdmins(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT a.*, u.name, u.email, u.role, u.created_at, u.last_access 
            FROM admins a 
            JOIN users u ON a.id = u.id 
            ORDER BY u.created_at DESC
        ");
        return $stmt->fetchAll();
    }
    
    // create new admin
    // get db connection, den create admin id start with ADMIN at front...den str_pad = string pad (continue insert for string)
    // (userid based on order, 5 digit number, start with 0 ,from left)--exp[user id--123,admin id--00123====ADMIN00123]
    // prepare and execute into db
    // return results
    public function createAdmin(int $userId): bool {
        $pdo = getDbConnection();
        $adminId = 'ADMIN' . str_pad($userId, 5, '0', STR_PAD_LEFT);
        $stmt = $pdo->prepare("INSERT INTO admins (id, admin_id) VALUES (:user_id, :admin_id)");
        return $stmt->execute([
            ':user_id' => $userId,
            ':admin_id' => $adminId
        ]);
    }
    
    public function removeAdmin(int $userId): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("DELETE FROM admins WHERE id = :user_id");
        return $stmt->execute([':user_id' => $userId]);
    }
    
    // check for admin activity or actions
    public function logAction(int $adminId, string $action): void {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("INSERT INTO audit_logs (admin_id, action) VALUES (:admin_id, :action)");
        $stmt->execute([
            ':admin_id' => $adminId,
            ':action' => $action
        ]);
    }
    
    // get all the audit log record
    // connect db connect audit log table, user table, admin table
    // structure based on user/admin id den by desc order of actions
    // set of the limit 100 offset 0 (line 11)
    // using bindValue set limit and offset in int form (line 36)
    // execute sql and fetch all data
    public function getAuditLogs(int $limit = 100, int $offset = 0): array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT al.*, u.name as admin_name, u.email as admin_email 
            FROM audit_logs al 
            JOIN admins a ON al.admin_id = a.id 
            JOIN users u ON a.id = u.id 
            ORDER BY al.performed_at DESC 
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // create a brand-new user account + matching role-specific row
    // role-specific ID follows the same pattern as createAdmin(): PREFIX + 5-digit padded user id
    public function createUser(string $name, string $email, string $passwordHash, string $role): int {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role)");
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $passwordHash,
            ':role' => $role
        ]);
        $userId = (int) $pdo->lastInsertId();

        $prefix = ['student' => 'STU', 'lecturer' => 'LEC', 'admin' => 'ADMIN'][$role];
        $roleId = $prefix . str_pad($userId, 5, '0', STR_PAD_LEFT);

        switch ($role) {
            case 'student':
                $stmt = $pdo->prepare("INSERT INTO students (id, student_id, intake) VALUES (:id, :role_id, CURDATE())");
                break;
            case 'lecturer':
                $stmt = $pdo->prepare("INSERT INTO lecturers (id, lecturer_id) VALUES (:id, :role_id)");
                break;
            case 'admin':
                $stmt = $pdo->prepare("INSERT INTO admins (id, admin_id) VALUES (:id, :role_id)");
                break;
        }
        $stmt->execute([':id' => $userId, ':role_id' => $roleId]);

        return $userId;
    }

    // updates the shared users table only (name/email).
    // NOTE: role is not editable here — see updateUserAccount() in UserManagementLogic.php.
    public function updateUserBasic(int $userId, string $name, string $email): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("UPDATE users SET name = :name, email = :email WHERE id = :id");
        return $stmt->execute([':name' => $name, ':email' => $email, ':id' => $userId]);
    }

    // deleting from users cascades to students/lecturers/admins (ON DELETE CASCADE in schema)
    public function deleteUserById(int $userId): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $userId]);
    }
}