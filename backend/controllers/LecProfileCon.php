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
        switch (lecRequestMethod()) {
            case 'GET':
                sendLecJson(getLecProfileData($lecturerId));
                return;

            case 'POST':
                $result = updateLecturerProfile($lecturerId, lecJsonBody());

                if (!$result['success']) {
                    sendLecApiError($result['message'], $result['status']);
                    return;
                }

                sendLecJson(['success' => true, 'message' => $result['message']]);
                return;

            default:
                sendLecMethodNotAllowed(['GET', 'POST']);
                return;
        }

    } catch (PDOException $e) {
        error_log('[LecProfileController] DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch your courses. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecProfileController] Unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}
