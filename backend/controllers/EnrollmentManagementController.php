<?php
// dir use to find everywhere the file located
// find database.php, require once avoid duplicate
require_once __DIR__ . '/../Logic/EnrollmentManagementLogic.php';

// private for only using logic in class
class EnrollmentManagementController {
    private $logic;
    
    // construct to get info from logic for display 
    public function __construct() {
        $this->logic = new EnrollmentManagementLogic();
    }
    
    // 1st header is allowed access by any websites of frontend
    // 2nd header is info send by frontend (tell what kind of content type frontend send and authorize who sent this (student/admin/lecture))
    // 3rd is method allow by backend for frontend post=create put=update options=what kind of services (all below)
    // 4th is to pass back to frontend by using json format, diff from 2nd (they tell us what kind content type they sent)....4th we tell we using what format (json)
    private function setHeaders(): void {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
        header('Content-Type: application/json; charset=UTF-8');
    }
    
    // if server ask for options (above)...their content-type is inside header of options--system will understand what kind of type they asking for
    // system response 204==success (not giving back content just header)--asking options no need giving back content
    private function handleOptions(): void {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
    
    // authorize using admin ID check for login, or else error
    // this will only check isn't succesfull access, won't check identity (bcz it only allow by admin, so others will not have the access)
    private function getAdminId(): int {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            throw new Exception("Unauthorized: Please login first", 401);
        }
        return $_SESSION['user_id'];
    }
    
    // get frontend data in json format and change to php format and save
    private function getInputData(): array {
        $data = json_decode(file_get_contents("php://input"), true);
        return $data ?: [];
    }
    
    // to send data from php format to json format to frontend
    // status code=200==success
    // http_response_code($statusCode);==the permission/ request is success to sent to frontend
    private function sendResponse($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($data);
    }
    
    // send message tell frontend error display in json
    // 400 = unsuccessful
    private function sendError(string $message, int $statusCode = 400): void {
        http_response_code($statusCode);
        echo json_encode(['message' => $message]);
    }
    
    // entry for handle reuqest by frontend
    // set header first den options by frontend
    public function handleRequest(): void {
        $this->setHeaders();
        $this->handleOptions();
        
        try {
            $adminId = $this->getAdminId();
            $this->logic->verifyAdmin($adminId);
            
            $method = $_SERVER['REQUEST_METHOD'];
            $action = $_GET['action'] ?? '';
            
            switch ($method) {
                case 'GET':
                    $this->handleGet($action);
                    break;
                case 'POST':
                    $this->handlePost($action, $adminId);
                    break;
                case 'PUT':
                    $this->handlePut($action, $adminId);
                    break;
                default:
                    throw new Exception("Method not allowed", 405);
            }
        } catch (Exception $e) {
            $code = $e->getCode() ?: 400;
            $this->sendError($e->getMessage(), $code);
        }
    }
    
    // get method request by frontend
    // enrollment action--enroll by logic
    // get stats need authorize course id...failed throw message,success go logic action
    // courses action--full course list, used to populate the enroll-student dropdown
    // default throw error message
    // success end send data to frontend
    private function handleGet(string $action): void {
        switch ($action) {
            case 'enrollments':
                $data = $this->logic->getEnrollments();
                break;
            case 'course-stats':
                $courseId = intval($_GET['course_id'] ?? 0);
                if (!$courseId) {
                    throw new Exception("Course ID required", 400);
                }
                $data = $this->logic->getCourseStats($courseId);
                break;
            case 'courses':
                $data = $this->logic->getCourses();
                break;
            default:
                throw new Exception("Action not found", 404);
        }
        
        $this->sendResponse($data);
    }
    
    // post method to enroll a student into a course (new enrollment row,
    // as opposed to update-enrollment below which only flips status on an
    // EXISTING row)
    // require student_id and course_id, without either one error
    // go to logic when success and send response 201==created
    // default error throw error message
    private function handlePost(string $action, int $adminId): void {
        $input = $this->getInputData();
        
        switch ($action) {
            case 'enroll':
                $studentId = intval($input['student_id'] ?? 0);
                $courseId = intval($input['course_id'] ?? 0);
                if (!$studentId || !$courseId) {
                    throw new Exception("Student ID and course ID required", 400);
                }
                $data = $this->logic->createEnrollment($adminId, $studentId, $courseId);
                $this->sendResponse($data, 201);
                break;
            default:
                throw new Exception("Action not found", 404);
        }
    }
    
    // put method input enrollement data
    // require enrollmentID and status, without either one error
    // go to logic when success and send response to frontend tell success
    // default error throw error message
    private function handlePut(string $action, int $adminId): void {
        $input = $this->getInputData();
        
        switch ($action) {
            case 'update-enrollment':
                $enrollmentId = intval($input['enrollment_id'] ?? 0);
                $status = $input['status'] ?? '';
                if (!$enrollmentId || !$status) {
                    throw new Exception("Enrollment ID and status required", 400);
                }
                $data = $this->logic->updateEnrollment($adminId, $enrollmentId, $status);
                $this->sendResponse($data);
                break;
            default:
                throw new Exception("Action not found", 404);
        }
    }
}