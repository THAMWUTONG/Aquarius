<?php
/**
 * LecPerformanceCon.php
 *
 * Controller for the lecturer performance analytics endpoint.
 */

require_once __DIR__ . '/LecGuard.php';
require_once __DIR__ . '/../logic/LecPerformanceLogic.php';

function handleLecturerPerformanceRequest(): void
{
    $lecturerId = requireLecturerSession();
    if ($lecturerId === null) {
        return; // guard already sent 204 / 401 / 403
    }

    if (lecRequestMethod() !== 'GET') {
        sendLecMethodNotAllowed(['GET']);
        return;
    }

    try {
        // Absent or '' means "no filter". Both are normalised to null so the
        // repository can tell "show everything" apart from a real id.
        $courseId = isset($_GET['course_id']) && $_GET['course_id'] !== ''
            ? (int) $_GET['course_id']
            : null;
        $quizId = isset($_GET['quiz_id']) && $_GET['quiz_id'] !== ''
            ? (int) $_GET['quiz_id']
            : null;

        // A non-numeric value casts to 0, which would match no row and silently
        // return an empty gradebook. Treat it as no filter instead.
        if ($courseId !== null && $courseId <= 0) {
            $courseId = null;
        }
        if ($quizId !== null && $quizId <= 0) {
            $quizId = null;
        }

        sendLecJson(getLecturerPerformanceData($lecturerId, $courseId, $quizId));

    } catch (PDOException $e) {
        error_log('[LecPerformanceController] DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch the analytics. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecPerformanceController] Unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}
