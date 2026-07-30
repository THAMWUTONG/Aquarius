<?php
/**
 * performance-overview.php
 *
 * session cookie fetch('/api/performance-overview.php', { credentials: 'include' })
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/StPerOverviewCon.php';

handlePerfOverviewRequest();