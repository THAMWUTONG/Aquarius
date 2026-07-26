<?php
// BACKEND/api/login.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../Controllers/AuthController.php';

handleLogin();