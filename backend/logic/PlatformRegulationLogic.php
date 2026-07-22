<?php
// dir use to find everywhere the file located
// find platformRegulationRepo.php and userManagementRepo.php, require once avoid duplicate
require_once __DIR__ . '/../Repository/PlatformRegulationRepository.php';
require_once __DIR__ . '/../Repository/UserManagementRepository.php';

// using private for repository and user repository
class PlatformRegulationLogic {
    private $repo;
    private $userRepo;
    
    // create new repo and userRepo
    // Repo is manage all the users like from new--enroll by id, status, stats and logAction
    // User repo is to check all users details, check isn't admin, create/delete admin, get admin info
    public function __construct() {
        $this->repo = new PlatformRegulationRepository();
        $this->userRepo = new UserManagementRepository();
    }
    
    // verify using UserRepo (UserID) isn't admin
    // if not throw message, no access
    public function verifyAdmin(int $userId): void {
        if (!$this->userRepo->isAdmin($userId)) {
            throw new Exception("Unauthorized: Admin access required", 403);
        }
    }
    
    // use repo to return the pending materials list
    public function getPendingMaterials(): array {
        return $this->repo->getPendingStudyMaterials();
    }
    
    // admin to check/examine the study material change status pending to approved/rejected
    // get adminID, materialID and status
    // if status not updated, throw false message
    public function regulateStudyMaterial(int $adminId, int $materialId, string $status): array {
        $validStatuses = ['approved', 'rejected'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status. Must be 'approved' or 'rejected'", 400);
        }
        
        // get material by id, false throw error msg
        $material = $this->repo->getStudyMaterialById($materialId);
        if (!$material) {
            throw new Exception("Study material not found", 404);
        }
        
        // update at repo status of regulation
        // if not found result, throw error msg 500 server error
        $result = $this->repo->updateStudyMaterialRegulation($materialId, $status);
        if (!$result) {
            throw new Exception("Failed to regulate study material", 500);
        }
        
        // record log action by admin
        $this->repo->logAction($adminId, "Regulated study material: {$material['title']} (ID: {$materialId}) to {$status}");
        
        return [
            'message' => "Study material {$status} successfully",
            'material_id' => $materialId,
            'status' => $status
        ];
    }
    
    // get pending quizzes from repo
    public function getPendingQuizzes(): array {
        return $this->repo->getPendingQuizzes();
    }
    
    // examine quiz status by admin
    // change status to approved, reject or flagged (problems in quiz but not reject yet)
    // status not update, throw error message
    public function regulateQuiz(int $adminId, int $quizId, string $status): array {
        $validStatuses = ['approved', 'rejected', 'flagged'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status. Must be 'approved', 'rejected', or 'flagged'", 400);
        }
        
        $quiz = $this->repo->getQuizById($quizId);
        if (!$quiz) {
            throw new Exception("Quiz not found", 404);
        }
        
        // update at repo status of regulation
        // if not found result, throw error msg 500 server error
        $result = $this->repo->updateQuizRegulation($quizId, $status);
        if (!$result) {
            throw new Exception("Failed to regulate quiz", 500);
        }
        
        // record log action by admin
        $this->repo->logAction($adminId, "Regulated quiz: {$quiz['title']} (ID: {$quizId}) to {$status}");
        
        return [
            'message' => "Quiz {$status} successfully",
            'quiz_id' => $quizId,
            'status' => $status
        ];
    }
    
    public function getPlatformStatistics(): array {
        $stats = $this->repo->getPlatformStats();
        
        // Calculate derived metrics
        // round==round up 4 out 5 in, keep in 2 decimal places at back
        if ($stats['total_users'] > 0) {
            $stats['student_percentage'] = round(($stats['total_students'] / $stats['total_users']) * 100, 2);
            $stats['lecturer_percentage'] = round(($stats['total_lecturers'] / $stats['total_users']) * 100, 2);
            $stats['admin_percentage'] = round(($stats['total_admins'] / $stats['total_users']) * 100, 2);
        } else {
            $stats['student_percentage'] = 0;
            $stats['lecturer_percentage'] = 0;
            $stats['admin_percentage'] = 0;
        }
        
        return $stats;
    }
    
    public function getPerformanceData(): array {
        return $this->repo->getCoursePerformance();
    }
}