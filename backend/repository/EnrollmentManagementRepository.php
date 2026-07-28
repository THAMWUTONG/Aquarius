<?php
// dir use to find everywhere the file located
// find database.php, require once avoid duplicate
require_once __DIR__ . '/../config/db.php';

class EnrollmentManagementRepository {
    
    // connect to database $stmt=response from db (contains my data) $pdo=db connection ->query =to send the query to db what flwing command (send SQL directly)
    // enroll 3 table (enrollment, users, courses), join them
    // return the results by desc in array
    public function getEnrollments(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT e.*, 
                   u.name as student_name, u.email as student_email,
                   c.title as course_title,
                   (SELECT COUNT(*) FROM enrollment WHERE course_id = e.course_id AND status = 'active') as total_enrolled
            FROM enrollment e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.enrolled_at DESC
        ");
        return $stmt->fetchAll();
    }
    
    // select specific enrollment to view/update by using enrollment id
    // connect to db and use prepare first (prepare sql template first, wait for actual id in integer, enrollment_id as a placeholder)
    // den insert enrollment_id exp:5 search from db and return value
    // if result false return null, if true return enrollment details in array
    public function getEnrollmentById(int $enrollmentId): ?array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT e.*, u.name as student_name, c.title as course_title 
            FROM enrollment e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = :enrollment_id
        ");
        $stmt->bindValue(':enrollment_id', $enrollmentId, PDO::PARAM_INT);
        $stmt->execute();
        $enrollment = $stmt->fetch();
        return $enrollment === false ? null : $enrollment;
    }
    
    // after getting enrollmentid details from db, change status (active-> disenrolled/ reverse)
    public function updateEnrollmentStatus(int $enrollmentId, string $status): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            UPDATE enrollment 
            SET status = :status 
            WHERE id = :enrollment_id
        ");
        return $stmt->execute([
            ':enrollment_id' => $enrollmentId,
            ':status' => $status
        ]);
    }
    
    // admin select course (course_id from db)
    // get stats (total enrolled, active enrolled, disenrolled) sum
    // display results in array
    public function getCourseEnrollmentStats(int $courseId): array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_enrolled,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_enrolled,
                SUM(CASE WHEN status = 'disenrolled' THEN 1 ELSE 0 END) as disenrolled
            FROM enrollment 
            WHERE course_id = :course_id
        ");
        $stmt->bindValue(':course_id', $courseId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }
    
    // suspect every action by admin (create admin, disenrolled admin/student)
    // recorded by admin id, action, timestamp
    // using void to return nothing, it just record log entry
    public function logAction(int $adminId, string $action): void {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("INSERT INTO audit_logs (admin_id, action) VALUES (:admin_id, :action)");
        $stmt->execute([
            ':admin_id' => $adminId,
            ':action' => $action
        ]);
    }

    // full course list (id, title) — used to populate the enroll-student course dropdown
    public function getAllCourses(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("SELECT id, title FROM courses ORDER BY title");
        return $stmt->fetchAll();
    }

    // ON DUPLICATE KEY reactivates a previously-disenrolled record instead of
    // erroring, since (student_id, course_id) has a unique constraint in the schema.
    public function insertEnrollment(int $studentId, int $courseId): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            INSERT INTO enrollment (student_id, course_id, status)
            VALUES (:student_id, :course_id, 'active')
            ON DUPLICATE KEY UPDATE status = 'active'
        ");
        return $stmt->execute([':student_id' => $studentId, ':course_id' => $courseId]);
    }
}