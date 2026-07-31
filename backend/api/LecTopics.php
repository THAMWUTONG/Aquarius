<?php
/**
 * LecTopics.php
 *
 * Lists the topics under the logged-in lecturer's courses, so the Create Quiz
 * and Upload Material modals can offer real topic ids instead of a hard-coded
 * list that did not match this database.
 *
 * fetch('/api/LecTopics.php')
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecContentCon.php';

handleLecturerTopicsRequest();
