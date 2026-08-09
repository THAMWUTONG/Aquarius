<?php
/**
 * LecContentCon.php
 *
 * Controllers for the lecturer's quizzes and materials endpoints.
 * Session/role checking is delegated to requireLecturerSession() in LecGuard.php.
 *
 * Each handler dispatches on the HTTP verb so one URL owns one resource:
 *   /api/LecQuizzes.php    GET list | POST create | DELETE remove
 *   /api/LecMaterials.php  GET list | POST upload | DELETE remove
 *
 * Ownership is never checked here - the logic layer does it, because it is the
 * layer that also knows which id the request is talking about.
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
        switch (lecRequestMethod()) {
            case 'GET':
                sendLecJson(getLecturerQuizzesData($lecturerId));
                return;

            case 'POST':
                $body = lecJsonBody();

                // An id in the body means "edit this quiz" rather than "create one".
                $quizId = (int) ($body['id'] ?? 0);
                $result = $quizId > 0
                    ? updateLecturerQuiz($lecturerId, $quizId, $body)
                    : createLecturerQuiz($lecturerId, $body);

                sendLecContentResult($result, $quizId > 0 ? 'Quiz updated.' : 'Quiz created.');
                return;

            case 'DELETE':
                $body = lecJsonBody();
                $quizId = (int) ($body['id'] ?? $_GET['id'] ?? 0);
                sendLecContentResult(deleteLecturerQuiz($lecturerId, $quizId), 'Quiz deleted.');
                return;

            default:
                sendLecMethodNotAllowed(['GET', 'POST', 'DELETE']);
                return;
        }
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
        switch (lecRequestMethod()) {
            case 'GET':
                sendLecJson(getLecturerMaterialsData($lecturerId));
                return;

            case 'POST':
                // Uploads arrive as multipart/form-data, so the fields are in
                // $_POST and the file in $_FILES - not in the JSON body.
                $materialId = (int) ($_POST['id'] ?? 0);

                if ($materialId > 0) {
                    sendLecContentResult(
                        updateLecturerMaterial($lecturerId, $materialId, $_POST),
                        'Material updated.'
                    );
                    return;
                }

                sendLecContentResult(
                    createLecturerMaterial($lecturerId, $_POST, $_FILES['file'] ?? []),
                    'Material uploaded.'
                );
                return;

            case 'DELETE':
                $body = lecJsonBody();
                $materialId = (int) ($body['id'] ?? $_GET['id'] ?? 0);
                sendLecContentResult(deleteLecturerMaterial($lecturerId, $materialId), 'Material deleted.');
                return;

            default:
                sendLecMethodNotAllowed(['GET', 'POST', 'DELETE']);
                return;
        }
    } catch (PDOException $e) {
        error_log('[LecContentController] materials DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch the materials. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecContentController] materials unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}

/**
 * Topics the lecturer owns - populates the create/upload dropdowns.
 */
function handleLecturerTopicsRequest(): void
{
    $lecturerId = requireLecturerSession();
    if ($lecturerId === null) {
        return;
    }

    if (lecRequestMethod() !== 'GET') {
        sendLecMethodNotAllowed(['GET']);
        return;
    }

    try {
        sendLecJson(getLecturerTopicsData($lecturerId));

    } catch (PDOException $e) {
        error_log('[LecContentController] topics DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't fetch your topics. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecContentController] topics unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}

/**
 * Student comments on one quiz: /api/LecQuizFeedback.php?quiz_id=3
 */
function handleLecturerQuizFeedbackRequest(): void
{
    $lecturerId = requireLecturerSession();
    if ($lecturerId === null) {
        return;
    }

    if (lecRequestMethod() !== 'GET') {
        sendLecMethodNotAllowed(['GET']);
        return;
    }

    try {
        $quizId = (int) ($_GET['quiz_id'] ?? 0);
        $result = getLecturerQuizFeedbackData($lecturerId, $quizId);

        if (!$result['success']) {
            sendLecApiError($result['message'], $result['status']);
            return;
        }

        sendLecJson(['success' => true, 'feedback' => $result['feedback']]);

    } catch (PDOException $e) {
        error_log('[LecContentController] feedback DB error: ' . $e->getMessage());
        sendLecApiError("We couldn't load the comments. Please try again later.", 500);

    } catch (Throwable $e) {
        error_log('[LecContentController] feedback unexpected error: ' . $e->getMessage());
        sendLecApiError('Unknown server error, please try again later.', 500);
    }
}

/**
 * Renders a logic-layer result that already carries its own HTTP status.
 *
 * @param array  $result         success, status, message?, quizId?, materialId?
 * @param string $successMessage shown by the UI after a write
 */
function sendLecContentResult(array $result, string $successMessage): void
{
    if (!$result['success']) {
        sendLecApiError($result['message'] ?? 'Request failed.', $result['status'] ?? 400);
        return;
    }

    $payload = ['success' => true, 'message' => $successMessage];

    if (isset($result['quizId'])) {
        $payload['quizId'] = $result['quizId'];
    }
    if (isset($result['materialId'])) {
        $payload['materialId'] = $result['materialId'];
    }

    sendLecJson($payload, $result['status'] ?? 200);
}