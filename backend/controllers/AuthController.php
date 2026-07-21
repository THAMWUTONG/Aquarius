<?php
/**
 * AuthController.php
 * Success -> http_response_code(200) 
 * Fail -> http_response_code(400/401) 
 * 
 * 
 */

require_once __DIR__ . '/../logic/AuthLogic.php';

/**
 * set Content-Type headers
 */
function setAuthHeaders(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}


function handleLogin(): void
{
    setAuthHeaders();

    // OPTIONS verify Option/post/ Get
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    session_start();

    $inputData = json_decode(file_get_contents("php://input"), true);
    $email = filter_var($inputData["email"] ?? "", FILTER_SANITIZE_EMAIL);
    $password = $inputData["password"] ?? "";

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "Email and password are required"]);
        return;
    }

    try {
        $user = authenticateUser($email, $password);
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["role"] = $user["role"];

        http_response_code(200);
        echo json_encode($user);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["message" => $e->getMessage()]);
    }
}
