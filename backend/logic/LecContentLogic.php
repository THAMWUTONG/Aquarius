<?php
/**
 * LecContentLogic.php
 *
 * Shapes the lecturer's quizzes and materials for the frontend tables.
 */

require_once __DIR__ . '/../repository/LecContentRep.php';

/**
 * @param int $lecturerUserId
 * @return array{success: bool, quizzes: array, partialErrors: array}
 */
function getLecturerQuizzesData(int $lecturerUserId): array
{
    $partialErrors = [];

    $result = getLecturerQuizzes($lecturerUserId);
    if (!$result['success']) {
        $partialErrors[] = 'quizzes';
        $quizzes = [];
        error_log('[LecContentLogic] quizzes failed for lecturer ' . $lecturerUserId);
    } else {
        $quizzes = formatLecturerQuizzes($result['data']);
    }

    return [
        'success' => true,
        'quizzes' => $quizzes,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * @param int $lecturerUserId
 * @return array{success: bool, materials: array, partialErrors: array}
 */
function getLecturerMaterialsData(int $lecturerUserId): array
{
    $partialErrors = [];

    $result = getLecturerMaterials($lecturerUserId);
    if (!$result['success']) {
        $partialErrors[] = 'materials';
        $materials = [];
        error_log('[LecContentLogic] materials failed for lecturer ' . $lecturerUserId);
    } else {
        // A failed prerequisite lookup is reported as a partial error rather
        // than failing the whole page: the materials themselves are still
        // usable, they just render with no dependency chain.
        $prerequisiteResult = getMaterialPrerequisites($lecturerUserId);
        if (!$prerequisiteResult['success']) {
            $partialErrors[] = 'prerequisites';
            error_log('[LecContentLogic] prerequisites failed for lecturer ' . $lecturerUserId);
        }

        $materials = formatLecturerMaterials(
            $result['data'],
            groupPrerequisitesByMaterial($prerequisiteResult['data'] ?? [])
        );
    }

    return [
        'success' => true,
        'materials' => $materials,
        'partialErrors' => $partialErrors,
    ];
}

/**
 * Topics the lecturer owns, grouped for the modal dropdowns.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, topics: array, partialErrors: array}
 */
function getLecturerTopicsData(int $lecturerUserId): array
{
    $result = getLecturerTopics($lecturerUserId);
    if (!$result['success']) {
        error_log('[LecContentLogic] topics failed for lecturer ' . $lecturerUserId);
        return ['success' => true, 'topics' => [], 'partialErrors' => ['topics']];
    }

    $topics = array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'topic' => $row['topic'],
            'courseId' => (int) $row['course_id'],
            'course' => $row['course'],
        ];
    }, $result['data']);

    return ['success' => true, 'topics' => $topics, 'partialErrors' => []];
}

/**
 * Validates and normalises a Create Quiz payload, then writes it.
 *
 * The modal sends each question as optionA..optionD plus a correctOption label
 * like 'Option B'. The schema stores options as quiz_answers rows with an
 * is_correct flag, so the reshaping happens here - the repository should not
 * have to know about the form's field names.
 *
 * Returns a 'status' the controller maps onto an HTTP code, so validation
 * failures come back as 400/403 rather than a blanket 500.
 *
 * @param int   $lecturerUserId
 * @param array $payload
 * @return array{success: bool, status: int, message?: string, quizId?: int}
 */
function createLecturerQuiz(int $lecturerUserId, array $payload): array
{
    $title = trim((string) ($payload['title'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));
    $topicId = (int) ($payload['topic_id'] ?? 0);
    $durationMin = (int) ($payload['duration_min'] ?? 0);
    $isPublished = !empty($payload['is_published']) ? 1 : 0;
    $rawQuestions = $payload['questions'] ?? [];

    if ($title === '') {
        return ['success' => false, 'status' => 400, 'message' => 'Quiz title is required.'];
    }
    if ($topicId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'Please choose a topic for this quiz.'];
    }
    if ($durationMin <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'Duration must be at least 1 minute.'];
    }
    if (!is_array($rawQuestions) || count($rawQuestions) === 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A quiz needs at least one question.'];
    }

    // 403, not 404: the topic may well exist, it just is not theirs to write to.
    if (!lecturerOwnsTopic($lecturerUserId, $topicId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That topic does not belong to your courses.'];
    }

    $questions = [];
    foreach ($rawQuestions as $index => $raw) {
        $normalised = normaliseQuizQuestion(is_array($raw) ? $raw : [], $index);
        if (isset($normalised['error'])) {
            return ['success' => false, 'status' => 400, 'message' => $normalised['error']];
        }
        $questions[] = $normalised['question'];
    }

    $result = createQuizWithQuestions(
        $lecturerUserId,
        [
            'title' => $title,
            'description' => $description,
            'topic_id' => $topicId,
            'duration_min' => $durationMin,
            'is_published' => $isPublished,
        ],
        $questions
    );

    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't save the quiz. Please try again later."];
    }

    return ['success' => true, 'status' => 201, 'quizId' => $result['quizId']];
}

/**
 * Turns one submitted question into the shape createQuizWithQuestions() wants.
 *
 * Blank options are dropped rather than stored: a four-box form where the
 * lecturer only filled A and B should become a two-option question, not two
 * empty choices a student could pick. That is also why the correct option is
 * validated AFTER filtering - selecting 'Option D' while D is blank is a real
 * mistake worth reporting instead of silently saving an unanswerable question.
 *
 * @param array $raw
 * @param int   $index zero-based, used only for human-readable messages
 * @return array{question?: array, error?: string}
 */
function normaliseQuizQuestion(array $raw, int $index): array
{
    $position = $index + 1;

    $text = trim((string) ($raw['questionText'] ?? $raw['question'] ?? ''));
    if ($text === '') {
        return ['error' => "Question #{$position} is missing its question text."];
    }

    $letters = ['A', 'B', 'C', 'D'];
    $answers = [];
    $correctLetter = null;

    // 'Option B' -> 'B'. Accept a bare letter too, so the API is usable
    // without mimicking the modal's exact label format.
    $rawCorrect = strtoupper(trim((string) ($raw['correctOption'] ?? '')));
    if (preg_match('/([A-D])$/', $rawCorrect, $matches)) {
        $correctLetter = $matches[1];
    }

    if ($correctLetter === null) {
        return ['error' => "Question #{$position} has no correct option selected."];
    }

    foreach ($letters as $letter) {
        $optionText = trim((string) ($raw['option' . $letter] ?? ''));
        if ($optionText === '') {
            continue;
        }
        $answers[] = [
            'text' => $optionText,
            'is_correct' => $letter === $correctLetter,
        ];
    }

    if (count($answers) < 2) {
        return ['error' => "Question #{$position} needs at least two answer options."];
    }

    $hasCorrect = false;
    foreach ($answers as $answer) {
        if ($answer['is_correct']) {
            $hasCorrect = true;
            break;
        }
    }
    if (!$hasCorrect) {
        return ['error' => "Question #{$position} marks option {$correctLetter} as correct, but that option is empty."];
    }

    // Marks default to 1 so an existing client that omits them still produces a
    // gradable quiz - a 0-mark question would make the whole quiz score 0.
    $score = isset($raw['score']) ? (float) $raw['score'] : 1.0;
    if ($score <= 0) {
        $score = 1.0;
    }

    return [
        'question' => [
            'question' => $text,
            'score' => $score,
            'explanation' => trim((string) ($raw['explanation'] ?? '')),
            'answers' => $answers,
        ],
    ];
}

/**
 * Deletes a quiz the lecturer owns.
 *
 * @param int $lecturerUserId
 * @param int $quizId
 * @return array{success: bool, status: int, message?: string}
 */
function deleteLecturerQuiz(int $lecturerUserId, int $quizId): array
{
    if ($quizId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid quiz id is required.'];
    }
    if (!lecturerOwnsQuiz($lecturerUserId, $quizId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That quiz does not belong to your courses.'];
    }

    $result = deleteQuizById($quizId);
    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't delete the quiz. Please try again later."];
    }

    return ['success' => true, 'status' => 200];
}

/**
 * Updates a quiz the lecturer owns. Questions are left untouched.
 *
 * @param int   $lecturerUserId
 * @param int   $quizId
 * @param array $payload
 * @return array{success: bool, status: int, message?: string}
 */
function updateLecturerQuiz(int $lecturerUserId, int $quizId, array $payload): array
{
    if ($quizId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid quiz id is required.'];
    }
    if (!lecturerOwnsQuiz($lecturerUserId, $quizId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That quiz does not belong to your courses.'];
    }

    $title = trim((string) ($payload['title'] ?? ''));
    $topicId = (int) ($payload['topic_id'] ?? 0);
    $durationMin = (int) ($payload['duration_min'] ?? 0);

    if ($title === '') {
        return ['success' => false, 'status' => 400, 'message' => 'Quiz title is required.'];
    }
    if ($topicId <= 0 || !lecturerOwnsTopic($lecturerUserId, $topicId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That topic does not belong to your courses.'];
    }
    if ($durationMin <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'Duration must be at least 1 minute.'];
    }

    $result = updateQuizById($quizId, [
        'title' => $title,
        'description' => trim((string) ($payload['description'] ?? '')),
        'topic_id' => $topicId,
        'duration_min' => $durationMin,
        'is_published' => !empty($payload['is_published']) ? 1 : 0,
    ]);

    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't update the quiz. Please try again later."];
    }

    return ['success' => true, 'status' => 200];
}

/**
 * Student comments on one of the lecturer's quizzes.
 *
 * @param int $lecturerUserId
 * @param int $quizId
 * @return array{success: bool, status: int, message?: string, feedback?: array}
 */
function getLecturerQuizFeedbackData(int $lecturerUserId, int $quizId): array
{
    if ($quizId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid quiz id is required.'];
    }
    if (!lecturerOwnsQuiz($lecturerUserId, $quizId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That quiz does not belong to your courses.'];
    }

    $result = getQuizFeedback($quizId);
    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't load the comments. Please try again later."];
    }

    $feedback = array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'studentName' => $row['student_name'],
            'comment' => $row['comment'],
            'submittedAt' => !empty($row['submitted_at'])
                ? substr($row['submitted_at'], 0, 16)
                : null,
        ];
    }, $result['data']);

    return ['success' => true, 'status' => 200, 'feedback' => $feedback];
}

/**
 * Reads the submitted prerequisite list into a clean array of material ids.
 *
 * The picker sends its selection over multipart/form-data alongside the file,
 * which cannot carry a real array, so three shapes are accepted:
 *   ['3', '7']       - a genuine array (JSON callers)
 *   '3,7'            - the comma-joined string the modals send
 *   '' / absent      - no prerequisites
 *
 * Duplicates are collapsed because the table declares a unique pair, and
 * $selfId is dropped because a material cannot be its own prerequisite - both
 * would otherwise be rejected by the database as a 500 rather than handled.
 *
 * @param mixed $raw
 * @param int   $selfId 0 when the material does not exist yet
 * @return int[]
 */
function normalisePrerequisiteIds($raw, int $selfId = 0): array
{
    if (is_string($raw)) {
        $raw = $raw === '' ? [] : explode(',', $raw);
    }
    if (!is_array($raw)) {
        return [];
    }

    $ids = [];
    foreach ($raw as $value) {
        $id = (int) trim((string) $value);
        if ($id > 0 && $id !== $selfId) {
            $ids[$id] = $id;
        }
    }

    return array_values($ids);
}

/**
 * True when making $prerequisiteIds the prerequisites of $materialId would
 * close a loop somewhere in the chain.
 *
 * The database only blocks the one-step case (chk_prereq_not_self). It cannot
 * see the indirect one: A requires B, B requires C, then someone makes C
 * require A. Nothing would be flagged on insert, but a student following the
 * chain would never reach a starting point, and any code walking it would
 * recurse forever.
 *
 * So this walks the existing chain outwards from each proposed prerequisite and
 * fails if it ever arrives back at the material being edited.
 *
 * @param int   $materialId
 * @param int[] $prerequisiteIds
 * @param array $edges material_id => [prerequisite_id, ...]
 * @return bool
 */
function prerequisitesWouldCycle(int $materialId, array $prerequisiteIds, array $edges): bool
{
    $queue = $prerequisiteIds;
    $seen = [];

    while (count($queue) > 0) {
        $current = array_shift($queue);

        if ($current === $materialId) {
            return true;
        }
        // Guards against looping forever on a cycle that does not involve
        // $materialId but is reachable from it.
        if (isset($seen[$current])) {
            continue;
        }
        $seen[$current] = true;

        foreach ($edges[$current] ?? [] as $next) {
            $queue[] = $next;
        }
    }

    return false;
}

/**
 * Checks a prerequisite selection without writing anything.
 *
 * Kept separate from the write so callers can reject a bad selection BEFORE
 * they change anything else about the material - otherwise a lecturer who picks
 * an invalid prerequisite still has their title and topic quietly updated by
 * the same failed submit.
 *
 * @param int   $lecturerUserId
 * @param int   $materialId      0 for a material that does not exist yet
 * @param int[] $prerequisiteIds already normalised
 * @return array{success: bool, status: int, message?: string}
 */
function validateMaterialPrerequisites(int $lecturerUserId, int $materialId, array $prerequisiteIds): array
{
    if (count($prerequisiteIds) === 0) {
        return ['success' => true, 'status' => 200];
    }

    if (!lecturerOwnsAllMaterials($lecturerUserId, $prerequisiteIds)) {
        return [
            'success' => false,
            'status' => 403,
            'message' => 'A selected prerequisite is not one of your study materials.',
        ];
    }

    // A brand-new material has no id yet, so nothing can point at it and no
    // chain can lead back to it.
    if ($materialId > 0) {
        $existing = getAllPrerequisiteEdges();
        if (!$existing['success']) {
            return [
                'success' => false,
                'status' => 500,
                'message' => "We couldn't save the prerequisites. Please try again later.",
            ];
        }

        $edges = [];
        foreach ($existing['data'] as $row) {
            $edges[(int) $row['material_id']][] = (int) $row['prerequisite_id'];
        }

        if (prerequisitesWouldCycle($materialId, $prerequisiteIds, $edges)) {
            return [
                'success' => false,
                'status' => 400,
                'message' => 'That prerequisite creates a loop - the material would end up required before itself.',
            ];
        }
    }

    return ['success' => true, 'status' => 200];
}

/**
 * The values study_materials.file_type accepts.
 *
 * Materials no longer carry a file, so this is now a plain classification of
 * the material - it still has to match the column's enum exactly, or the insert
 * fails at the database with a 500 instead of a readable message.
 *
 * @return string[]
 */
function lecMaterialTypes(): array
{
    return ['pdf', 'video', 'slides', 'document'];
}

/**
 * Validates a new study material and stores it.
 *
 * @param int   $lecturerUserId
 * @param array $payload $_POST fields: title, description, file_type, topic_id,
 *                       prerequisite_ids
 * @return array{success: bool, status: int, message?: string, materialId?: int}
 */
function createLecturerMaterial(int $lecturerUserId, array $payload): array
{
    $title = trim((string) ($payload['title'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));
    $fileType = strtolower(trim((string) ($payload['file_type'] ?? '')));
    $topicId = (int) ($payload['topic_id'] ?? 0);

    if ($title === '') {
        return ['success' => false, 'status' => 400, 'message' => 'Material title is required.'];
    }
    if ($topicId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'Please choose a topic for this material.'];
    }

    if (!in_array($fileType, lecMaterialTypes(), true)) {
        return ['success' => false, 'status' => 400, 'message' => 'Unsupported material type.'];
    }
    if (!lecturerOwnsTopic($lecturerUserId, $topicId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That topic does not belong to your courses.'];
    }

    // Passing 0 as the material id says "this row does not exist yet", which
    // skips the cycle walk - nothing can point at a material that has no id.
    $prerequisiteIds = normalisePrerequisiteIds($payload['prerequisite_ids'] ?? []);
    $valid = validateMaterialPrerequisites($lecturerUserId, 0, $prerequisiteIds);
    if (!$valid['success']) {
        return $valid;
    }

    $result = createMaterial($lecturerUserId, [
        'title' => $title,
        'description' => $description,
        'file_type' => $fileType,
        'topic_id' => $topicId,
    ]);

    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't save the material. Please try again later."];
    }

    // The links are a second write, so a failure here would otherwise leave a
    // material saved with the prerequisites silently missing. Undoing the whole
    // create keeps "the save failed" honest - the lecturer resubmits the same
    // form rather than hunting for which half landed.
    if (count($prerequisiteIds) > 0) {
        $linked = replaceMaterialPrerequisites($result['materialId'], $prerequisiteIds);
        if (!$linked['success']) {
            deleteMaterialById($result['materialId']);
            return ['success' => false, 'status' => 500, 'message' => "We couldn't save the material. Please try again later."];
        }
    }

    return ['success' => true, 'status' => 201, 'materialId' => $result['materialId']];
}

/**
 * Deletes a material the lecturer owns.
 *
 * @param int $lecturerUserId
 * @param int $materialId
 * @return array{success: bool, status: int, message?: string}
 */
function deleteLecturerMaterial(int $lecturerUserId, int $materialId): array
{
    if ($materialId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid material id is required.'];
    }
    if (!lecturerOwnsMaterial($lecturerUserId, $materialId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That material does not belong to your courses.'];
    }

    $result = deleteMaterialById($materialId);
    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't delete the material. Please try again later."];
    }

    return ['success' => true, 'status' => 200];
}

/**
 * Updates a material the lecturer owns. The stored file is not replaced.
 *
 * @param int   $lecturerUserId
 * @param int   $materialId
 * @param array $payload
 * @return array{success: bool, status: int, message?: string}
 */
function updateLecturerMaterial(int $lecturerUserId, int $materialId, array $payload): array
{
    if ($materialId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid material id is required.'];
    }
    if (!lecturerOwnsMaterial($lecturerUserId, $materialId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That material does not belong to your courses.'];
    }

    $title = trim((string) ($payload['title'] ?? ''));
    $topicId = (int) ($payload['topic_id'] ?? 0);

    if ($title === '') {
        return ['success' => false, 'status' => 400, 'message' => 'Material title is required.'];
    }
    if ($topicId <= 0 || !lecturerOwnsTopic($lecturerUserId, $topicId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That topic does not belong to your courses.'];
    }

    // Only touched when the caller actually sent the field. An empty value IS a
    // meaningful update - it is how the lecturer clears every prerequisite - so
    // the distinction has to be "was the key present", not "is it empty".
    $updatePrerequisites = array_key_exists('prerequisite_ids', $payload);
    $prerequisiteIds = $updatePrerequisites
        ? normalisePrerequisiteIds($payload['prerequisite_ids'], $materialId)
        : [];

    if ($updatePrerequisites) {
        $valid = validateMaterialPrerequisites($lecturerUserId, $materialId, $prerequisiteIds);
        if (!$valid['success']) {
            return $valid;
        }
    }

    $result = updateMaterialById($materialId, [
        'title' => $title,
        'description' => trim((string) ($payload['description'] ?? '')),
        'topic_id' => $topicId,
    ]);

    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't update the material. Please try again later."];
    }

    if ($updatePrerequisites) {
        $saved = replaceMaterialPrerequisites($materialId, $prerequisiteIds);
        if (!$saved['success']) {
            return [
                'success' => false,
                'status' => 500,
                'message' => "We couldn't save the prerequisites. Please try again later.",
            ];
        }
    }

    return ['success' => true, 'status' => 200];
}

/**
 * Counts arrive from PDO as strings; casting here stops React from doing
 * string comparisons like "0" > 0 later on.
 *
 * @param array $rows
 * @return array
 */
function formatLecturerQuizzes(array $rows): array
{
    return array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'course' => $row['course'],
            'topic' => $row['topic'],
            'questions' => (int) $row['questions'],
            'comments' => (int) $row['comments'],
            'durationMin' => isset($row['duration_min']) ? (int) $row['duration_min'] : null,
            'isPublished' => (bool) $row['is_published'],
            'regulationStatus' => $row['regulation_status'],
        ];
    }, $rows);
}

/**
 * Turns the flat prerequisite pair rows into material_id => [{id, title}, ...].
 *
 * @param array $rows material_id, prerequisite_id, prerequisite_title
 * @return array<int, array<int, array{id: int, title: string}>>
 */
function groupPrerequisitesByMaterial(array $rows): array
{
    $grouped = [];

    foreach ($rows as $row) {
        $grouped[(int) $row['material_id']][] = [
            'id' => (int) $row['prerequisite_id'],
            'title' => $row['prerequisite_title'],
        ];
    }

    return $grouped;
}

/**
 * file_type is stored lowercase ('pdf', 'slides', 'video', 'document') but the
 * table renders a badge in capitals. Uppercasing is presentation, so the raw
 * value is passed through as 'fileType' and the badge text is built in JSX.
 *
 * No file fields are returned: materials are metadata only, so there is nothing
 * for the frontend to link to or download.
 *
 * prerequisites is an ARRAY of the study materials that should be studied
 * first, each as {id, title} - not a count, and not a topic. The frontend needs
 * the ids to pre-tick the edit modal's picker and the titles to render chips,
 * and a material with no prerequisites correctly comes back as [].
 *
 * @param array $rows
 * @param array $prerequisitesByMaterial from groupPrerequisitesByMaterial()
 * @return array
 */
function formatLecturerMaterials(array $rows, array $prerequisitesByMaterial = []): array
{
    return array_map(function (array $row) use ($prerequisitesByMaterial) {
        $id = (int) $row['id'];

        return [
            'id' => $id,
            'title' => $row['title'],
            'description' => $row['description'],
            'course' => $row['course'],
            'topic' => $row['topic'],
            'fileType' => $row['file_type'],
            'prerequisites' => $prerequisitesByMaterial[$id] ?? [],
            'regulationStatus' => $row['regulation_status'],
            'uploadedAt' => !empty($row['uploaded_at'])
                ? substr($row['uploaded_at'], 0, 10)
                : null,
        ];
    }, $rows);
}
