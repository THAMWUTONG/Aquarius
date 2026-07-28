<?php
// dir use to find everywhere the file located
// find database.php, require once avoid duplicate
require_once __DIR__ . '/../Repository/EnrollmentManagementRepository.php';
require_once __DIR__ . '/../Repository/UserManagementRepository.php';

// using private for repository and user repository
class EnrollmentManagementLogic {
    private $repo;
    private $userRepo;
    
    // create new repo and userRepo
    // Repo is manage all the users like from new--enroll by id, status, stats and logAction
    // User repo is to check all users details, check isn't admin, create/delete admin, get admin info
    public function __construct() {
        $this->repo = new EnrollmentManagementRepository();
        $this->userRepo = new UserManagementRepository();
    }
    
    // verify using UserRepo (UserID) isn't admin
    // if not throw message, no access
    public function verifyAdmin(int $userId): void {
        if (!$this->userRepo->isAdmin($userId)) {
            throw new Exception("Unauthorized: Admin access required", 403);
        }
    }
    
    // get enrollment for display in controller from repo
    public function getEnrollments(): array {
        return $this->repo->getEnrollments();
    }
    
    // validate student (enrollmentID) status is active or disenrolled, or else invalid
    // operate by admin
    // if error, display message
    public function updateEnrollment(int $adminId, int $enrollmentId, string $status): array {
        $validStatuses = ['active', 'disenrolled'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status. Must be 'active' or 'disenrolled'", 400);
        }
        
        // display enrollment record if success or else throw error message
        $enrollment = $this->repo->getEnrollmentById($enrollmentId);
        if (!$enrollment) {
            throw new Exception("Enrollment not found", 404);
        }
        
        // get results from repo (true or false)
        // if true goes to controller (havent display)
        // if failed throw error message
        $result = $this->repo->updateEnrollmentStatus($enrollmentId, $status);
        if (!$result) {
            throw new Exception("Failed to update enrollment", 500);
        }
        
        $this->repo->logAction($adminId, "Updated enrollment for {$enrollment['student_name']} in {$enrollment['course_title']} to {$status}");
        
        return [
            'message' => "Enrollment {$status} successfully",
            'enrollment_id' => $enrollmentId,
            'status' => $status
        ];
    }
    
    // get the stats from repo (course enrollment stats)
    public function getCourseStats(int $courseId): array {
        return $this->repo->getCourseEnrollmentStats($courseId);
    }
}