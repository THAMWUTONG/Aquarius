<?php
/**
 * DateHelper.php
 *
 *  StCalendarLog.php and StGenScheduleLog.php.
 *
 * It accepts either format and
 * always normalizes to 'YYYY-MM-DD' for storage, since that's
 * what the DATE columns in the DB expect.
 * 
 * YYYY-MM-DD + MM/DD/YYYY =>  YYYY-MM-DD
 */

/**
 * Parses a date string in either 'YYYY-MM-DD' or 'MM/DD/YYYY'
 * format and returns the canonical 'YYYY-MM-DD' form.
 *
 * @param mixed $raw
 * @return string|null  'YYYY-MM-DD' on success, null if unparseable/invalid
 */
function parseFlexibleDate(mixed $raw): ?string
{
    if (!is_string($raw)) {
        return null;
    }

    $raw = trim($raw);
    if ($raw === '') {
        return null;
    }

    // Try native <input type="date"> format first: YYYY-MM-DD
    $dateObj = DateTime::createFromFormat('Y-m-d', $raw);
    if ($dateObj && $dateObj->format('Y-m-d') === $raw) {
        return $dateObj->format('Y-m-d');
    }

    // Fallback: MM/DD/YYYY 
    $dateObj = DateTime::createFromFormat('m/d/Y', $raw);
    if ($dateObj && $dateObj->format('m/d/Y') === $raw) {
        return $dateObj->format('Y-m-d');
    }

    return null;
}