<?php
/**
 * StGenScheduleLog.php
 *
 * Generate Study Schedule
 *   1. Student picks a free date/dates 
 * 
 *   2. Fetch the student's weak topics (avg quiz score < 70%),
 *      already ordered weakest-first.
 * 
 *   3. Fetch non-weak topics (avg >= 70% or never attempted), used as
 *      filler once the weak topics run out.
 * 
 *   4. weak topics -> non-weak topics -> then
 *      repeated again through the weak topics til all dates
 *      are filled.
 * 
 *   5. Insert each pair into study_schedule.
 *
 *
 * Split into 3 functions 
 *   - validateFreeDates()        : input cleaning + validation only
 *   - pairDatesWithTopics()      : weak -> non-weak -> repeat weak
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
 * 1. All weak topics, weakest first.
 * 2. Then non-weak topics, if dates remain.
 * 3. Then loop back to the weak topics until every date has a topic.
 *
 * If the student has no weak topics at all, step 3 cycles the non-weak
 * list instead, so the loop can always fill the remaining dates.
 *
 * @param string[] $sortedDates       'YYYY-MM-DD', earliest first
 * @param array    $weakTopicsAsc     rows with topic_id & topic_title, weakest first
 * @param array    $nonWeakTopicsAsc  rows with topic_id & topic_title, lowest average first
 * @return array{
 *   pairs: array<array{topicId:int, topicTitle:string, scheduledDate:string}>,
 *   weakTopicSlots: int,
 *   nonWeakTopicSlots: int,
 *   repeatedSlots: int
 * }
 */
function pairDatesWithTopics(array $sortedDates, array $weakTopicsAsc, array $nonWeakTopicsAsc): array
{
    // weak topics first, then non-weak topics as filler
    // weakTopicAsc[
    // [
    //     'topic_id' => 12,
    //     'topic_title' => 'array',
    //     'avg_percentage' => 45.0
    // ], ...
    // nonWeakTopicsAsc['variable', 'Loops']
    $firstPass = array_merge($weakTopicsAsc, $nonWeakTopicsAsc); // ['array', 'sql', 'variable', 'Loops']

    if (count($firstPass) === 0 || count($sortedDates) === 0) {
        return ['pairs' => [], 'weakTopicSlots' => 0, 'nonWeakTopicSlots' => 0, 'repeatedSlots' => 0];
    }


    // When the student has no weak topics, Falls back the non-weak list 
    // so that below never divides by zero
    $cycleList = count($weakTopicsAsc) > 0 ? $weakTopicsAsc : $nonWeakTopicsAsc;

    $pairs = [];
    $weakTopicSlots = 0;
    $nonWeakTopicSlots = 0;
    $repeatedSlots = 0;

    // $sortedDates = ['2026-08-02', '2026-08-03', '2026-08-04']
    // $i = 0 -> ['2026-08-02'] 
    foreach ($sortedDates as $i => $scheduledDate) {
        if ($i < count($firstPass)) {
            $topic = $firstPass[$i];

            if ($i < count($weakTopicsAsc)) {
                $weakTopicSlots++;
            } else {
                $nonWeakTopicSlots++;
            }
        } else {
            // after assign all weak + non-weak topics. repeat again from the first one.
            $topic = $cycleList[($i - count($firstPass)) % count($cycleList)];
            $repeatedSlots++;
        }

        $pairs[] = [
            'topicId' => (int) $topic['topic_id'],
            'topicTitle' => $topic['topic_title'],
            'scheduledDate' => $scheduledDate,
        ];
    }

    return [
        'pairs' => $pairs,
        'weakTopicSlots' => $weakTopicSlots,
        'nonWeakTopicSlots' => $nonWeakTopicSlots,
        'repeatedSlots' => $repeatedSlots,
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
        return ['success' => false, 'error' => 'No weak topics found nothing to schedule right now.'];
    }
    
    $nonWeakTopicsResult = getNonWeakTopicsForScheduling($studentId, 70.0);
    if (!$nonWeakTopicsResult['success']) {
        return ['success' => false, 'error' => "Couldn't load topics, please try again later."];
    }
    $nonWeakTopics = $nonWeakTopicsResult['data'];

    // Only an error when the student has no topics at all (no active enrollment).
    if (count($weakTopics) === 0 && count($nonWeakTopics) === 0) {
        return ['success' => false, 'error' => 'No topics found — enroll in a course first.'];
    }

    // Pair every date: 
    // weak -> non-weak -> never attempted -> repeat weak
    $paired = pairDatesWithTopics($cleanDates, $weakTopics, $nonWeakTopics);

    // Insert each pair (wrapped in a transaction so it's all-or-nothing)
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
            'weakTopicSlots' => $paired['weakTopicSlots'],
            'nonWeakTopicSlots' => $paired['nonWeakTopicSlots'],
            'repeatedSlots' => $paired['repeatedSlots'],
        ],
    ];
}