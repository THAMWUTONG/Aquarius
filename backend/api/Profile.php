<?php
/**
 * profile.php
 *
 * session cookie fetch('/api/profile.php', { credentials: 'include' })
 *
 * Profile.php  Only -> Active Enrolled Courses。
 * login.php         ->  Student ID / Programme / Intake / Name / Email / Account Created At
 * 
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/ProfileController.php';

handleProfileRequest();