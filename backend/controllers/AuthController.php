<?php
/**
 * AuthController.php
 * ------------------------------------------------------------
 * 对应前端 frontend/services/authService.jsx 的 login()：
 *   - fetch('/api/login.php', { method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ email, password }) })
 *
 *   前端用 !loginResponse.ok 判断成功/失败，
 *   失败时读取 loginSuccess.message 显示错误信息。
 *   所以这里：
 *     - 成功 -> http_response_code(200) + 直接输出用户信息 JSON
 *     - 失败 -> http_response_code(400/401) + { "message": "..." }
 * ------------------------------------------------------------
 */

require_once __DIR__ . '/../Logic/AuthLogic.php';

/**
 * 设置 CORS 与 Content-Type headers（跟 ChatbotController.php 保持一致）
 */
function setAuthHeaders(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * 处理登录请求，输出 JSON 响应
 */
function handleLogin(): void
{
    setAuthHeaders();

    // OPTIONS 检查Option/post/ Get
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        return;
    }

    session_start();

    // Content-Type 是 application/json，必须用 php://input 读，$_POST 拿不到
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