<?php
/**
 * dashboard.php
 * 
 * session cookie fetch('/api/dashboard.php', { credentials: 'include' })
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/StDashboardCon.php';

handleDashboardRequest();