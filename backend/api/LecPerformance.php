<?php
/**
 * LecPerformance.php
 *
 * Score averages, topic completion rates and gradebook for the lecturer.
 * fetch('/api/LecPerformance.php')
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecPerformanceCon.php';

handleLecturerPerformanceRequest();
