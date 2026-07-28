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

    try {
        sendLecJson(getLecturerPerformanceData($lecturerId));

    } catch (PDOException $e) {
        error_log('[LecPerformanceController] DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch the analytics. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecPerformanceController] Unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}
