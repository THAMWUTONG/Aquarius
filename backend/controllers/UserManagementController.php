<?php
// dir use to find everywhere the file located
// find UML.php, require once avoid duplicate
require_once __DIR__ . '/../Logic/UserManagementLogic.php';

// private for only using logic in class
class UserManagementController {
    private $logic;
    
    // create UML for saving or other action to repo 
    public function __construct() {
        $this->logic = new UserManagementLogic();
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
                    $this->handleGet($action, $adminId);
                    break;
                case 'POST':
                    $this->handlePost($action, $adminId);
                    break;
                case 'DELETE':
                    $this->handleDelete($action, $adminId);
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
    // get "user" id is provide in string exp '5' intval to change to integer value
    // if valid value get user, false/=0 throw error
    // default throw error message
    // success end send data to frontend
    private function handleGet(string $action, int $adminId): void {
        switch ($action) {
            case 'profile':
                $data = $this->logic->getAdminProfile($adminId);
                break;
            case 'admins':
                $data = $this->logic->getAllAdmins();
                break;
            case 'users':
                $role = $_GET['role'] ?? null;
                $limit = intval($_GET['limit'] ?? 100);
                $offset = intval($_GET['offset'] ?? 0);
                $data = $this->logic->getUsers($role, $limit, $offset);
                break;
            case 'user':
                $userId = intval($_GET['id'] ?? 0);
                if (!$userId) {
                    throw new Exception("User ID required", 400);
                }
                $data = $this->logic->getUserAccount($userId);
                break;
            case 'audit-logs':
                $limit = intval($_GET['limit'] ?? 100);
                $offset = intval($_GET['offset'] ?? 0);
                $data = $this->logic->getAuditLogs($limit, $offset);
                break;
            default:
                throw new Exception("Action not found", 404);
        }
        
        $this->sendResponse($data);
    }
    
    // use get to get the user_id (for create it become admin)
    // check input user_id is valid int and not 0 and create it
    // if false, throw error message
    // if success send response and 201==created
    private function handlePost(string $action, int $adminId): void {
        $input = $this->getInputData();
        
        switch ($action) {
            case 'create-admin':
                $userId = intval($input['user_id'] ?? 0);
                if (!$userId) {
                    throw new Exception("User ID required", 400);
                }
                $data = $this->logic->createAdminUser($userId);
                $this->sendResponse($data, 201);
                break;
            default:
                throw new Exception("Action not found", 404);
        }
    }
    
    // to remove admin, same get the user id first
    // check value, throw error message when false
    // no userid cannot, userid= admin him/herself cannot
    // success show message remove successfully
    private function handleDelete(string $action, int $adminId): void {
        switch ($action) {
            case 'remove-admin':
                $userId = intval($_GET['user_id'] ?? 0);
                if (!$userId) {
                    throw new Exception("User ID required", 400);
                }
                if ($userId === $adminId) {
                    throw new Exception("Cannot remove your own admin role", 400);
                }
                $result = $this->logic->removeAdminRole($userId);
                $this->sendResponse(['message' => 'Admin role removed successfully', 'success' => $result]);
                break;
            default:
                throw new Exception("Action not found", 404);
        }
    }
}