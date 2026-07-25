<?php
/**
 * study-materials.php
 *
 * session cookie fetch('/api/study-materials.php', { credentials: 'include' })
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/StudyMtCon.php';

handleStudyMaterialsRequest();