<?php
/**
 * LecProfileCon.php
 *
 * Controller for the lecturer profile endpoint (courses taught).
 * Note: handleLecProfileRequest() - NOT handleProfileRequest() - because
 * ProfileCon.php already owns that name in the global function namespace.
 */

require_once __DIR__ . '/LecGuard.php';
require_once __DIR__ . '/../logic/LecProfileLogic.php';

function handleLecProfileRequest(): void
{
    $lecturerId = requireLecturerSession();
    if ($lecturerId === null) {
        return; // guard already sent 204 / 401 / 403
    }

    try {
        sendLecJson(getLecProfileData($lecturerId));

    } catch (PDOException $e) {
        error_log('[LecProfileController] DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch your courses. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecProfileController] Unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}
