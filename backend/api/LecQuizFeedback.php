<?php
/**
 * LecQuizFeedback.php
 *
 * Student comments left on one of the lecturer's quizzes.
 * fetch('/api/LecQuizFeedback.php?quiz_id=3')
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecContentCon.php';

handleLecturerQuizFeedbackRequest();
