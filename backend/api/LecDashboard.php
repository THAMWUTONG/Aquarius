<?php
/**
 * LecDashboard.php
 *
 * Lecturer dashboard endpoint.
 * Called from the frontend as fetch('/api/LecDashboard.php'),
 * which Vite proxies to http://localhost/Aquarius/backend/api/LecDashboard.php
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecDashboardCon.php';

handleLecturerDashboardRequest();
