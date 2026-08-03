<?php
// dir use to find everywhere the file located
// find PRL.php, require once avoid duplicate
require_once __DIR__ . '/../Logic/PlatformRegulationLogic.php';

// private for only using logic in class
class PlatformRegulationController {
    private $logic;
    
    // construct to get info from logic for display 
    public function __construct() {
        $this->logic = new PlatformRegulationLogic();
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
    // get dashboard action (platform stats & performance data) from logic
    // get pending quizzes, pending materials, and performance with showing like table with several records
    // all-materials/all-quizzes return EVERY item regardless of status (unlike
    // pending-materials/pending-quizzes which only return status='pending'),
    // used by the admin regulation table that needs to show/re-review anything
    // weak-topics/score-trend power the Platform Statistics charts
    // stats should get back the statistics to show
    // default throw error message
    // success end send data to frontend
    private function handleGet(string $action): void {
        switch ($action) {
            case 'dashboard':
                $data = [
                    'stats' => $this->logic->getPlatformStatistics(),
                    'performance' => $this->logic->getPerformanceData()
                ];
                break;
            case 'pending-materials':
                $data = $this->logic->getPendingMaterials();
                break;
            case 'pending-quizzes':
                $data = $this->logic->getPendingQuizzes();
                break;
            case 'all-materials':
                $data = $this->logic->getAllMaterials();
                break;
            case 'all-quizzes':
                $data = $this->logic->getAllQuizzesForRegulation();
                break;
            case 'weak-topics':
                $data = $this->logic->getWeakTopics();
                break;
            case 'score-trend':
                $data = $this->logic->getScoreTrend();
                break;
            case 'usage-over-time':
                $data = $this->logic->getUsageOverTime();
                break;
            case 'performance':
                $data = $this->logic->getPerformanceData();
                break;
            case 'stats':
                $data = $this->logic->getPlatformStatistics();
                break;
            default:
                throw new Exception("Action not found", 404);
        }
        
        $this->sendResponse($data);
    }
    
    // put method update by which admin and what they do (action)
    // examine the material by checking input material id is int and status updated
    // without one of it, throw error
    // go logic take and send it to frontend with adminID, materialID and latest status
    // examine the quizzes by checking input quizzes id is int and status updated
    // without one of it, throw error
    // go logic take and send it to frontend with adminID, materialID and latest status
    // default error throw error message
    private function handlePut(string $action, int $adminId): void {
        $input = $this->getInputData();
        
        switch ($action) {
            case 'regulate-material':
                $materialId = intval($input['material_id'] ?? 0);
                $status = $input['status'] ?? '';
                if (!$materialId || !$status) {
                    throw new Exception("Material ID and status required", 400);
                }
                $data = $this->logic->regulateStudyMaterial($adminId, $materialId, $status);
                $this->sendResponse($data);
                break;
            case 'regulate-quiz':
                $quizId = intval($input['quiz_id'] ?? 0);
                $status = $input['status'] ?? '';
                if (!$quizId || !$status) {
                    throw new Exception("Quiz ID and status required", 400);
                }
                $data = $this->logic->regulateQuiz($adminId, $quizId, $status);
                $this->sendResponse($data);
                break;
            default:
                throw new Exception("Action not found", 404);
        }
    }
}