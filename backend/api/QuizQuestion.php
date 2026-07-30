<?php
/**
 * quiz-questions.php
 *
 * session cookie fetch(`/api/quiz-questions.php?quizId=${quizId}`, { credentials: 'include' })
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/StQuizQuestionCon.php';

handleQuizQuestionsRequest();