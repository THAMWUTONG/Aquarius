<?php
/**
 * LecQuizzes.php
 *
 * Lists the logged-in lecturer's quizzes.
 * fetch('/api/LecQuizzes.php')
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecContentCon.php';

handleLecturerQuizzesRequest();
