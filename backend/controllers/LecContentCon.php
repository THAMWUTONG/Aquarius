<?php
/**
 * LecContentCon.php
 *
 * Controllers for the lecturer's quizzes and materials endpoints.
 * Session/role checking is delegated to requireLecturerSession() in LecGuard.php.
 */

require_once __DIR__ . '/LecGuard.php';
require_once __DIR__ . '/../logic/LecContentLogic.php';

function handleLecturerQuizzesRequest(): void
{
    $lecturerId = requireLecturerSession();
    if ($lecturerId === null) {
        return; // guard already sent 204 / 401 / 403
    }

    try {
        sendLecJson(getLecturerQuizzesData($lecturerId));

    } catch (PDOException $e) {
        error_log('[LecContentController] quizzes DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch the quizzes. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecContentController] quizzes unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}

function handleLecturerMaterialsRequest(): void
{
    $lecturerId = requireLecturerSession();
    if ($lecturerId === null) {
        return;
    }

    try {
        sendLecJson(getLecturerMaterialsData($lecturerId));

    } catch (PDOException $e) {
        error_log('[LecContentController] materials DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch the materials. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecContentController] materials unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}
