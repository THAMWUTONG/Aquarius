<?php
// display what error on screen, easy monitor
ini_set('display_errors', 1);
error_reporting(E_ALL);

// dir use to find everywhere the file located
// find database.php, require once avoid duplicate
require_once __DIR__ . '/../Controllers/EnrollmentManagementController.php';

// craete controller handle frontend request
$controller = new EnrollmentManagementController();
$controller->handleRequest();