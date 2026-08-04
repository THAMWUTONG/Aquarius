<?php
/**
 * StGenSchedule.php  (API Entry Point)
 *
 * POST /api/StGenSchedule.php  -> Generate Study Schedule button 
 * 
 *
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/StGenScheduleCon.php';

handleGenerateScheduleRequest();