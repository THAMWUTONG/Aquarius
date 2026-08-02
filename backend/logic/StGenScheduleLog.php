<?php
/**
 * StGenScheduleLog.php  (Logic Layer)
 *
 * Generate Study Schedule
 *   1. Student picks a free date/dates 
 * 
 *   2. We fetch the student's weak topics (avg quiz score < 70%),
 *      already ordered weakest-first.
 * 
 *   3. pairCount = min(count(freeDates), count(weakTopics))
 *        - dates > weak topics        
 *  ( The system will only schedule the first 2 days. 
 *  The remaining 3 days are left completely empty so the student can just rest.)
 * 
 *        - weak topics > dates 
 *  (it grabs only the top 2 weakest topics)
 * 
 *   4. Insert each pair into study_schedule.
 *
 *
 * Split into 3 functions 
 *   - validateFreeDates()        : input cleaning + validation only
 *   - pairDatesWithWeakTopics()  : pure pairing logic, no DB access
 *   - generateStudySchedule()    : Main Function (validate -> fetch -> pair -> insert)
 */

require_once __DIR__ . '/../repository/StGenScheduleRep.php';
require_once __DIR__ . '/../config/Date.php';

/**
 * Validates and cleans the raw freeDates array from the request body.
 * Accepts 'YYYY-MM-DD' or 'MM/DD/YYYY' per date (Date.php),
 * rejects past dates, dedupes, and returns them sorted earliest first.
 *
 * @param mixed $freeDates  raw array from request body
 * @return array{success: bool, data?: string[], error?: string}  data = clean 'YYYY-MM-DD' dates, sorted ASC
 */
function validateFreeDates(mixed $freeDates): array
{
    if (!is_array($freeDates) || count($freeDates) === 0) {
        return ['success' => false, 'error' => 'At least one free date is required'];
    }

    $today = new DateTime('today');
    $cleanDates = [];

    foreach ($freeDates as $rawDate) {
        $parsed = parseFlexibleDate($rawDate);
        if ($parsed === null) {
            return ['success' => false, 'error' => "Invalid date: {$rawDate} (expected YYYY-MM-DD or MM/DD/YYYY)"];
        }

        if (new DateTime($parsed) < $today) {
            return ['success' => false, 'error' => "Date {$parsed} is in the past"];
        }

        $cleanDates[] = $parsed;
    }

    // Remove duplicate dates, then sort earliest -> latest
    $cleanDates = array_values(array_unique($cleanDates));
    sort($cleanDates);

    return ['success' => true, 'data' => $cleanDates];
}

/**
 * Pure pairing logic — no DB access here, easy to unit test on its own.
 * Pairs the earliest date with the weakest topic, second-earliest with
 * second-weakest, and so on, until either list runs out.
 *
 * @param string[] $sortedDates      'YYYY-MM-DD', sorted earliest first
 * @param array    $weakTopicsAsc    rows with topic_id/topic_title, sorted weakest first
 * @return array{
 *   pairs: array<array{topicId:int, topicTitle:string, scheduledDate:string}>,
 *   unscheduledDatesCount: int,
 *   unscheduledWeakTopicsCount: int
 * }
 */
function pairDatesWithWeakTopics(array $sortedDates, array $weakTopicsAsc): array
{
    $pairCount = min(count($sortedDates), count($weakTopicsAsc));

    $pairs = [];
    for ($i = 0; $i < $pairCount; $i++) {
        $pairs[] = [
            'topicId' => (int) $weakTopicsAsc[$i]['topic_id'],
            'topicTitle' => $weakTopicsAsc[$i]['topic_title'],
            'scheduledDate' => $sortedDates[$i],
        ];
    }

    return [
        'pairs' => $pairs,
        'unscheduledDatesCount' => count($sortedDates) - $pairCount,
        'unscheduledWeakTopicsCount' => count($weakTopicsAsc) - $pairCount,
    ];
}

/**
 * Main Function: validate -> fetch weak topics -> pair -> insert (transaction).
 *
 * @param int   $studentId
 * @param mixed $freeDates  raw array from request body
 * @return array{success: bool, data?: array, error?: string}
 */
function generateStudySchedule(int $studentId, mixed $freeDates): array
{
    // Validate & clean freeDates 
    $datesResult = validateFreeDates($freeDates);
    if (!$datesResult['success']) {
        return ['success' => false, 'error' => $datesResult['error']];
    }
    $cleanDates = $datesResult['data'];

    // Fetch weak topics (weakest first)
    $weakTopicsResult = getWeakTopicsForScheduling($studentId, 70.0);
    if (!$weakTopicsResult['success']) {
        return ['success' => false, 'error' => "Couldn't load weak topics, please try again later."];
    }

    $weakTopics = $weakTopicsResult['data'];
    if (count($weakTopics) === 0) {
        return ['success' => false, 'error' => 'No weak topics found — nothing to schedule right now.'];
    }

    // Pair earliest date <-> weakest topic
    $paired = pairDatesWithWeakTopics($cleanDates, $weakTopics);

    // Insert each pair 
    $pdo = getDbConnection();
    $generatedSchedule = [];

    try {
        $pdo->beginTransaction();

        foreach ($paired['pairs'] as $pair) {
            $insertResult = insertStudySchedule($studentId, $pair['topicId'], $pair['scheduledDate']);
            if (!$insertResult['success']) {
                $pdo->rollBack();
                return ['success' => false, 'error' => "Couldn't save the schedule, please try again later."];
            }

            $generatedSchedule[] = [
                'id' => $insertResult['data'],
                'topicId' => $pair['topicId'],
                'topicTitle' => $pair['topicTitle'],
                'scheduledDate' => $pair['scheduledDate'],
            ];
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[StGenScheduleLog] generateStudySchedule failed: ' . $e->getMessage());
        return ['success' => false, 'error' => "Couldn't save the schedule, please try again later."];
    }

    return [
        'success' => true,
        'data' => [
            'schedule' => $generatedSchedule,
            'unscheduledDatesCount' => $paired['unscheduledDatesCount'],
            'unscheduledWeakTopicsCount' => $paired['unscheduledWeakTopicsCount'],
        ],
    ];
}