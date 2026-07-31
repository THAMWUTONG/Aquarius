<?php
/**
 * LecProfile.php
 *
 * Courses taught by the logged-in lecturer (derived profile data).
 * fetch('/api/LecProfile.php')
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecProfileCon.php';

handleLecProfileRequest();
