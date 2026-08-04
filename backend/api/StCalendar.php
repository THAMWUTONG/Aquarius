<?php
/**
 * StCalendar.php  (API Entry Point)
 *
 * GET /api/StCalendar.php
 * Frontend usage: apiGet('/api/StCalendar.php')  // credentials: 'include' via apiClient.js
 *
 * Returns:
 * {
 *   "success": true,
 *   "importantEvents": [
 *     { "id": 1, "title": "Final Exam", "eventDate": "2026-08-15", "eventType": "exam" }
 *   ],
 *   "studySchedule": [
 *     { "id": 3, "topicId": 7, "topicTitle": "SQL Joins", "scheduledDate": "2026-08-02" }
 *   ],
 *   "partialErrors": []
 * }
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/StCalendarCon.php';

handleCalendarRequest();