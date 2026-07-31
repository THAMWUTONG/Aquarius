<?php
/**
 * StCalendarLog.php  (Logic Layer)
 *
 * Combines important events + study schedule 
 */

require_once __DIR__ . '/../repository/StCalenderRep.php';
require_once __DIR__ . '/../config/Date.php';

/**
 * @param int $studentId
 * @return array{
 *   success: bool,
 *   importantEvents: array,
 *   studySchedule: array,
 *   partialErrors: array
 * }
 */
function getStudentCalendarData(int $studentId): array
{
    $partialErrors = [];

    // Important Events (event_date >= today)
    $eventsResult = getImportantEvents($studentId);
    if (!$eventsResult['success']) {
        $partialErrors[] = 'importantEvents';
        $importantEvents = [];
    } else {
        $importantEvents = formatImportantEvents($eventsResult['data']);
    }

    // Study Schedule (scheduled_date >= today)
    $scheduleResult = getStudySchedule($studentId);
    if (!$scheduleResult['success']) {
        $partialErrors[] = 'studySchedule';
        $studySchedule = [];
    } else {
        $studySchedule = formatStudySchedule($scheduleResult['data']);
    }

    if (!empty($partialErrors)) {
        error_log('[StCalendarLog] partial failure for student ' . $studentId . ': ' . implode(',', $partialErrors));
    }

    return [
        'success' => true,
        'importantEvents' => $importantEvents,
        'studySchedule' => $studySchedule,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * 
 * Save Function
 * Validates input then inserts a new important event.
 * 
 * Filter Format -> Validation -> Save 
 *
 *
 * @param int   $studentId
 * @param mixed $title      raw from request body
 * @param mixed $eventDate  raw from request body, expected 'YYYY-MM-DD'
 * @param mixed $eventType  raw from request body
 * @return array{success: bool, data?: array, error?: string}
 */
function addImportantEvent(int $studentId, mixed $title, mixed $eventDate, mixed $eventType): array
{
    $title = is_string($title) ? trim($title) : '';
    $eventType = is_string($eventType) ? trim($eventType) : '';

    if ($title === '') {
        return ['success' => false, 'error' => 'Event title is required'];
    }
    if (mb_strlen($title) > 255) {
        return ['success' => false, 'error' => 'Event title is too long (max 255 characters)'];
    }

    // Accepts 'YYYY-MM-DD' or 'MM/DD/YYYY'
    // Always normalized to 'YYYY-MM-DD' for the DB.
    $eventDate = parseFlexibleDate($eventDate);
    if ($eventDate === null) {
        return ['success' => false, 'error' => 'Date must be in YYYY-MM-DD or MM/DD/YYYY format'];
    }

    // Matches important_events.event_type ENUM('exam','assignment','personal')
    $allowedTypes = ['exam', 'assignment', 'personal'];
    if (!in_array($eventType, $allowedTypes, true)) {
        return ['success' => false, 'error' => "Event type must be one of: " . implode(', ', $allowedTypes)];
    }

    $insertResult = insertImportantEvent($studentId, $title, $eventDate, $eventType);
    if (!$insertResult['success']) {
        return ['success' => false, 'error' => "Couldn't save the event, please try again later."];
    }

    return [
        'success' => true,
        'data' => [
            'id' => $insertResult['data'],
            'title' => $title,
            'eventDate' => $eventDate,
            'eventType' => $eventType,
        ],
    ];
}

/**
 * Casts ID to int to prevent type mismatches in the frontend.
 *
 * @param array $events
 * @return array
 */
function formatImportantEvents(array $events): array
{
    return array_map(function (array $event) {
        return [
            'id' => (int) $event['id'],
            'title' => $event['title'],
            'eventDate' => $event['event_date'],   // 'YYYY-MM-DD'
            'eventType' => $event['event_type'],   // 'exam' | 'assignment' | 'personal'
        ];
    }, $events);
}

/**
 * @param array $sessions
 * @return array
 */
function formatStudySchedule(array $sessions): array
{
    return array_map(function (array $session) {
        return [
            'id' => (int) $session['id'],
            'topicId' => (int) $session['topic_id'],
            'topicTitle' => $session['topic_title'],
            'scheduledDate' => $session['scheduled_date'],  // 'YYYY-MM-DD'
        ];
    }, $sessions);
}