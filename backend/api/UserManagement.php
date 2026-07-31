<?php
// display what error on screen, easy monitor
ini_set('display_errors', 1);
error_reporting(E_ALL);

// dir use to find everywhere the file located
// find UMC.php, require once avoid duplicate
require_once __DIR__ . '/../Controllers/UserManagementController.php';

// craete controller handle frontend request
$controller = new UserManagementController();
$controller->handleRequest();