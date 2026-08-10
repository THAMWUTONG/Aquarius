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
        // Prerequisites failing is not worth blanking the whole table: the rows
        // are still correct, they just come back with an empty prerequisite
        // list, so the flag tells the caller that column is incomplete.
        $prerequisiteResult = getLecturerMaterialPrerequisites($lecturerUserId);
        if (!$prerequisiteResult['success']) {
            $partialErrors[] = 'prerequisites';
            error_log('[LecContentLogic] prerequisites failed for lecturer ' . $lecturerUserId);
        }

        // Same treatment for the study tags - an unreadable tag column should
        // not cost the lecturer the whole materials table.
        $tagResult = getLecturerMaterialTags($lecturerUserId);
        if (!$tagResult['success']) {
            $partialErrors[] = 'tags';
            error_log('[LecContentLogic] material tags failed for lecturer ' . $lecturerUserId);
        }

        $materials = formatLecturerMaterials(
            $result['data'],
            groupPrerequisitesByMaterial($prerequisiteResult['data'] ?? []),
            groupTagsByMaterial($tagResult['data'] ?? [])
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
 * Where uploaded material files are written, and the largest file accepted.
 * The directory sits next to the frontend so XAMPP can serve the files back.
 */
const LEC_UPLOAD_DIR = __DIR__ . '/../../uploads';
const LEC_MAX_UPLOAD_BYTES = 52428800; // 50 MB

/**
 * Extensions permitted per file_type enum value.
 *
 * The stored file is renamed to a random string, so this list is not protecting
 * the filename - it is refusing to persist executable content at all. Without
 * it a lecturer could upload material.php into a directory XAMPP happily
 * executes, which is remote code execution on the whole site.
 */
function lecAllowedUploadExtensions(): array
{
    return [
        'pdf' => ['pdf'],
        'video' => ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        'slides' => ['ppt', 'pptx', 'odp'],
        'document' => ['doc', 'docx', 'odt', 'txt', 'rtf'],
    ];
}

/**
 * Reads a submitted multi-select into a clean list of ids.
 *
 * The modals post multipart/form-data, where an array cannot be sent as-is, so
 * a selection arrives as a JSON array string ('[3,7]'). A plain comma list and
 * a real PHP array are accepted too, so the endpoint stays usable outside the
 * modal. Blank input means "nothing selected", which every caller here treats
 * as allowed - both prerequisites and tags are optional.
 *
 * @param mixed $raw
 * @return int[] unique, positive ids
 */
function normaliseIdList($raw): array
{
    if (is_array($raw)) {
        $values = $raw;
    } else {
        $text = trim((string) $raw);
        if ($text === '') {
            return [];
        }

        $decoded = json_decode($text, true);
        $values = is_array($decoded) ? $decoded : explode(',', $text);
    }

    $ids = [];
    foreach ($values as $value) {
        $id = (int) $value;
        if ($id > 0) {
            $ids[] = $id;
        }
    }

    return array_values(array_unique($ids));
}

/**
 * The prerequisite selection, as a list of study material ids.
 *
 * @param mixed $raw
 * @return int[]
 */
function normalisePrerequisiteIds($raw): array
{
    return normaliseIdList($raw);
}

/**
 * The study tag selection, as a list of tag ids.
 *
 * @param mixed $raw
 * @return int[]
 */
function normaliseTagIds($raw): array
{
    return normaliseIdList($raw);
}

/**
 * Checks a study tag selection before it is written.
 *
 * Only ownership needs checking here: unlike prerequisites, a tag cannot point
 * back at the material, so there is no self-reference or cycle to worry about.
 *
 * @param int   $lecturerUserId
 * @param int[] $tagIds
 * @return array{success: bool, status?: int, message?: string}
 */
function validateTagIds(int $lecturerUserId, array $tagIds): array
{
    if (count($tagIds) === 0) {
        return ['success' => true];
    }

    // 403 rather than 404, for the same reason as the prerequisite check: the
    // tag exists, it just belongs to another lecturer.
    if (countOwnedTags($lecturerUserId, $tagIds) !== count($tagIds)) {
        return [
            'success' => false,
            'status' => 403,
            'message' => 'One of the selected study tags is not one of your tags.',
        ];
    }

    return ['success' => true];
}

/** Longest tag name the tags.name column accepts. */
const LEC_MAX_TAG_NAME_LENGTH = 100;

/**
 * The lecturer's own study tags, for the manage list and the pickers.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, tags: array, partialErrors: array}
 */
function getLecturerTagsData(int $lecturerUserId): array
{
    $result = getLecturerTags($lecturerUserId);
    if (!$result['success']) {
        error_log('[LecContentLogic] tags failed for lecturer ' . $lecturerUserId);
        return ['success' => true, 'tags' => [], 'partialErrors' => ['tags']];
    }

    $tags = array_map(function (array $row) {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            // How many materials carry this tag - shown as a warning before a
            // delete, since deleting removes it from all of them.
            'materialCount' => (int) $row['material_count'],
        ];
    }, $result['data']);

    return ['success' => true, 'tags' => $tags, 'partialErrors' => []];
}

/**
 * Validates a submitted tag name.
 *
 * @param mixed $raw
 * @return array{name?: string, error?: string}
 */
function normaliseTagName($raw): array
{
    // Inner whitespace is collapsed too: 'Data   Science' and 'Data Science'
    // are the same tag to a reader, but two different rows to a UNIQUE index.
    $name = trim(preg_replace('/\s+/u', ' ', (string) $raw));

    if ($name === '') {
        return ['error' => 'A tag name is required.'];
    }
    if (mb_strlen($name) > LEC_MAX_TAG_NAME_LENGTH) {
        return ['error' => 'A tag name cannot be longer than ' . LEC_MAX_TAG_NAME_LENGTH . ' characters.'];
    }

    return ['name' => $name];
}

/**
 * Turns a name clash into a message the lecturer can act on.
 *
 * tags.name is UNIQUE across the whole platform, so a rejected name is either
 * one of their own tags - which they can see and fix - or a colleague's, which
 * they cannot. Saying which one it is turns a dead end into a decision.
 *
 * @param int    $lecturerUserId
 * @param string $name
 * @param int    $excludeTagId the tag being renamed, so it does not clash with itself
 * @return array{success: false, status: int, message: string}
 */
function tagNameClashResult(int $lecturerUserId, string $name, int $excludeTagId = 0): array
{
    $owner = getTagOwnerByName($name, $excludeTagId);

    if ($owner === $lecturerUserId) {
        return [
            'success' => false,
            'status' => 409,
            'message' => 'You already have a study tag called "' . $name . '".',
        ];
    }

    return [
        'success' => false,
        'status' => 409,
        'message' => 'The tag name "' . $name . '" is already taken by another lecturer. Tag names are unique across the platform, so please choose a different one.',
    ];
}

/**
 * Creates one study tag owned by this lecturer.
 *
 * @param int   $lecturerUserId
 * @param array $payload name
 * @return array{success: bool, status: int, message?: string, tagId?: int}
 */
function createLecturerTag(int $lecturerUserId, array $payload): array
{
    $normalised = normaliseTagName($payload['name'] ?? '');
    if (isset($normalised['error'])) {
        return ['success' => false, 'status' => 400, 'message' => $normalised['error']];
    }
    $name = $normalised['name'];

    // Checked up front so the common case gets the friendlier message, but the
    // UNIQUE index is still what actually guarantees it - two simultaneous
    // requests could both pass this check.
    if (getTagOwnerByName($name) !== null) {
        return tagNameClashResult($lecturerUserId, $name);
    }

    $result = createTag($lecturerUserId, $name);

    if (!$result['success']) {
        if (($result['error'] ?? '') === 'DUPLICATE_NAME') {
            return tagNameClashResult($lecturerUserId, $name);
        }
        return ['success' => false, 'status' => 500, 'message' => "We couldn't save the study tag. Please try again later."];
    }

    return ['success' => true, 'status' => 201, 'tagId' => $result['tagId']];
}

/**
 * Renames a study tag the lecturer created.
 *
 * @param int   $lecturerUserId
 * @param int   $tagId
 * @param array $payload name
 * @return array{success: bool, status: int, message?: string}
 */
function updateLecturerTag(int $lecturerUserId, int $tagId, array $payload): array
{
    if ($tagId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid tag id is required.'];
    }
    if (!lecturerOwnsTag($lecturerUserId, $tagId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That study tag is not one of yours.'];
    }

    $normalised = normaliseTagName($payload['name'] ?? '');
    if (isset($normalised['error'])) {
        return ['success' => false, 'status' => 400, 'message' => $normalised['error']];
    }
    $name = $normalised['name'];

    if (getTagOwnerByName($name, $tagId) !== null) {
        return tagNameClashResult($lecturerUserId, $name, $tagId);
    }

    $result = updateTagById($tagId, $name);

    if (!$result['success']) {
        if (($result['error'] ?? '') === 'DUPLICATE_NAME') {
            return tagNameClashResult($lecturerUserId, $name, $tagId);
        }
        return ['success' => false, 'status' => 500, 'message' => "We couldn't rename the study tag. Please try again later."];
    }

    return ['success' => true, 'status' => 200];
}

/**
 * Deletes a study tag the lecturer created, and with it every link to a
 * material (study_material_tags cascades).
 *
 * @param int $lecturerUserId
 * @param int $tagId
 * @return array{success: bool, status: int, message?: string}
 */
function deleteLecturerTag(int $lecturerUserId, int $tagId): array
{
    if ($tagId <= 0) {
        return ['success' => false, 'status' => 400, 'message' => 'A valid tag id is required.'];
    }
    if (!lecturerOwnsTag($lecturerUserId, $tagId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That study tag is not one of yours.'];
    }

    $result = deleteTagById($tagId);
    if (!$result['success']) {
        return ['success' => false, 'status' => 500, 'message' => "We couldn't delete the study tag. Please try again later."];
    }

    return ['success' => true, 'status' => 200];
}

/**
 * Checks a prerequisite selection before it is written.
 *
 * $materialId is 0 while creating: the row does not exist yet, so it cannot be
 * its own prerequisite and nothing can point at it, which makes both the
 * self-reference and the cycle check meaningless there.
 *
 * @param int   $lecturerUserId
 * @param int   $materialId 0 when creating
 * @param int[] $prerequisiteIds
 * @return array{success: bool, status?: int, message?: string}
 */
function validatePrerequisiteIds(int $lecturerUserId, int $materialId, array $prerequisiteIds): array
{
    if (count($prerequisiteIds) === 0) {
        return ['success' => true];
    }

    if ($materialId > 0 && in_array($materialId, $prerequisiteIds, true)) {
        return [
            'success' => false,
            'status' => 400,
            'message' => 'A material cannot be its own prerequisite.',
        ];
    }

    // 403 rather than 404: the material probably exists, it just is not theirs
    // to link to - the same rule every other write path here applies.
    if (countOwnedMaterials($lecturerUserId, $prerequisiteIds) !== count($prerequisiteIds)) {
        return [
            'success' => false,
            'status' => 403,
            'message' => 'One of the selected prerequisites is not one of your materials.',
        ];
    }

    if ($materialId > 0 && prerequisiteSelectionCreatesCycle($lecturerUserId, $materialId, $prerequisiteIds)) {
        return [
            'success' => false,
            'status' => 400,
            'message' => 'That prerequisite depends on this material, so the two would require each other.',
        ];
    }

    return ['success' => true];
}

/**
 * True when the chosen prerequisites would make the chain loop back.
 *
 * Prerequisites say "revise this first", so the links have to form a one-way
 * chain: Chapter 1 before Chapter 2 before Chapter 3. If Chapter 1 already
 * requires Chapter 3, making Chapter 3 require Chapter 1 leaves a student with
 * no material they are allowed to start from. Self-references are blocked by
 * the table's own CHECK, but a loop through a third material is not, so it is
 * caught here by walking the existing chain upward from each new prerequisite
 * and seeing whether it reaches the material being edited.
 *
 * A failed lookup returns false - the write is allowed rather than blocked by
 * an error the lecturer cannot act on.
 *
 * @param int   $lecturerUserId
 * @param int   $materialId
 * @param int[] $prerequisiteIds
 * @return bool
 */
function prerequisiteSelectionCreatesCycle(int $lecturerUserId, int $materialId, array $prerequisiteIds): bool
{
    $result = getLecturerMaterialPrerequisites($lecturerUserId);
    if (!$result['success']) {
        error_log('[LecContentLogic] cycle check skipped, prerequisites unreadable');
        return false;
    }

    // material_id => [prerequisite ids]. The edited material's own existing
    // links are left out: they are about to be replaced by this selection.
    $chain = [];
    foreach ($result['data'] as $row) {
        $owner = (int) $row['material_id'];
        if ($owner === $materialId) {
            continue;
        }
        $chain[$owner][] = (int) $row['prerequisite_id'];
    }

    $queue = $prerequisiteIds;
    $seen = [];

    while (count($queue) > 0) {
        $current = array_shift($queue);

        if ($current === $materialId) {
            return true;
        }
        if (isset($seen[$current])) {
            continue;
        }
        $seen[$current] = true;

        foreach ($chain[$current] ?? [] as $next) {
            $queue[] = $next;
        }
    }

    return false;
}

/**
 * Validates an uploaded material and stores it.
 *
 * @param int   $lecturerUserId
 * @param array $payload $_POST fields: title, description, file_type, topic_id,
 *                       prerequisite_ids (optional)
 * @param array $file    the $_FILES['file'] entry, or [] when nothing was sent
 * @return array{success: bool, status: int, message?: string, materialId?: int}
 */
function createLecturerMaterial(int $lecturerUserId, array $payload, array $file): array
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

    $allowed = lecAllowedUploadExtensions();
    if (!isset($allowed[$fileType])) {
        return ['success' => false, 'status' => 400, 'message' => 'Unsupported material type.'];
    }
    if (!lecturerOwnsTopic($lecturerUserId, $topicId)) {
        return ['success' => false, 'status' => 403, 'message' => 'That topic does not belong to your courses.'];
    }

    // Checked BEFORE the file is stored: a rejected selection should not leave
    // an uploaded file behind that no row will ever reference.
    $prerequisiteIds = normalisePrerequisiteIds($payload['prerequisite_ids'] ?? '');
    $prerequisiteCheck = validatePrerequisiteIds($lecturerUserId, 0, $prerequisiteIds);
    if (!$prerequisiteCheck['success']) {
        return $prerequisiteCheck;
    }

    $tagIds = normaliseTagIds($payload['tag_ids'] ?? '');
    $tagCheck = validateTagIds($lecturerUserId, $tagIds);
    if (!$tagCheck['success']) {
        return $tagCheck;
    }

    $stored = lecStoreUploadedFile($file, $allowed[$fileType]);
    if (isset($stored['error'])) {
        return ['success' => false, 'status' => $stored['status'], 'message' => $stored['error']];
    }

    $result = createMaterial($lecturerUserId, [
        'title' => $title,
        'description' => $description,
        'file_name' => $stored['originalName'],
        'file_path' => $stored['relativePath'],
        'file_type' => $fileType,
        'topic_id' => $topicId,
    ]);

    if (!$result['success']) {
        // The row failed, so the file on disk is now unreferenced - remove it
        // rather than leaving the uploads directory to grow with orphans.
        @unlink($stored['absolutePath']);
        return ['success' => false, 'status' => 500, 'message' => "We couldn't save the material. Please try again later."];
    }

    // The material itself is saved, so a failure here is reported without
    // undoing the upload - the lecturer can add the prerequisites from Edit.
    if (count($prerequisiteIds) > 0) {
        $linked = setMaterialPrerequisites($result['materialId'], $prerequisiteIds);
        if (!$linked['success']) {
            return [
                'success' => false,
                'status' => 500,
                'message' => 'The material was saved, but its prerequisites could not be linked. Please set them from Edit.',
            ];
        }
    }

    if (count($tagIds) > 0) {
        $tagged = setMaterialTags($result['materialId'], $lecturerUserId, $tagIds);
        if (!$tagged['success']) {
            return [
                'success' => false,
                'status' => 500,
                'message' => 'The material was saved, but its study tags could not be linked. Please set them from Edit.',
            ];
        }
    }

    return ['success' => true, 'status' => 201, 'materialId' => $result['materialId']];
}

/**
 * Moves one uploaded file into the uploads directory under a generated name.
 *
 * The client-supplied filename is never used as the stored name: it can contain
 * traversal sequences, and on a case-insensitive filesystem a name like
 * 'notes.PhP' can still be executed. Only the extension is inspected, and only
 * to check it against the allow-list.
 *
 * @param array    $file    a $_FILES entry
 * @param string[] $allowedExtensions
 * @return array{relativePath?: string, absolutePath?: string, originalName?: string, error?: string, status?: int}
 */
function lecStoreUploadedFile(array $file, array $allowedExtensions): array
{
    if (empty($file) || !isset($file['error'])) {
        return ['error' => 'Please attach a file.', 'status' => 400];
    }

    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        return ['error' => 'That file is too large to upload.', 'status' => 400];
    }
    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['error' => 'Please attach a file.', 'status' => 400];
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        error_log('[LecContentLogic] upload failed with PHP error code ' . $file['error']);
        return ['error' => 'The file could not be uploaded. Please try again.', 'status' => 500];
    }

    // Confirms the file really came through PHP's upload handler and is not an
    // arbitrary server path someone injected into the request.
    if (!is_uploaded_file($file['tmp_name'])) {
        return ['error' => 'The file could not be uploaded. Please try again.', 'status' => 400];
    }

    if ((int) $file['size'] > LEC_MAX_UPLOAD_BYTES) {
        return ['error' => 'That file is too large. The limit is 50 MB.', 'status' => 400];
    }

    $originalName = (string) ($file['name'] ?? 'upload');
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions, true)) {
        return [
            'error' => 'That file type is not allowed for this material type. Expected: .' . implode(', .', $allowedExtensions),
            'status' => 400,
        ];
    }

    if (!is_dir(LEC_UPLOAD_DIR) && !mkdir(LEC_UPLOAD_DIR, 0775, true) && !is_dir(LEC_UPLOAD_DIR)) {
        error_log('[LecContentLogic] could not create upload directory ' . LEC_UPLOAD_DIR);
        return ['error' => 'The file could not be stored. Please try again later.', 'status' => 500];
    }

    try {
        $generatedName = bin2hex(random_bytes(16)) . '.' . $extension;
    } catch (Throwable $e) {
        $generatedName = uniqid('material_', true) . '.' . $extension;
    }

    $absolutePath = LEC_UPLOAD_DIR . '/' . $generatedName;

    if (!move_uploaded_file($file['tmp_name'], $absolutePath)) {
        error_log('[LecContentLogic] move_uploaded_file failed for ' . $absolutePath);
        return ['error' => 'The file could not be stored. Please try again later.', 'status' => 500];
    }

    return [
        'relativePath' => 'uploads/' . $generatedName,
        'absolutePath' => $absolutePath,
        // Trimmed to the column width so a very long filename cannot truncate-error.
        'originalName' => substr(basename($originalName), 0, 255),
    ];
}

/**
 * Deletes a material the lecturer owns, plus its file on disk.
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

    // Best-effort file cleanup. The row is already gone, so a failure here
    // leaves a harmless orphan file - not a reason to report failure to the
    // lecturer. Resolved against the uploads directory so a tampered path
    // cannot reach outside it.
    if (!empty($result['filePath'])) {
        $candidate = realpath(__DIR__ . '/../../' . $result['filePath']);
        $uploadRoot = realpath(LEC_UPLOAD_DIR);
        if ($candidate !== false && $uploadRoot !== false && str_starts_with($candidate, $uploadRoot)) {
            @unlink($candidate);
        }
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

    // Only rewritten when the caller actually sent the field. An update that
    // omits it - any older client, or a partial edit - should leave the
    // existing prerequisites alone rather than silently clear them.
    $editsPrerequisites = array_key_exists('prerequisite_ids', $payload);
    $prerequisiteIds = $editsPrerequisites
        ? normalisePrerequisiteIds($payload['prerequisite_ids'])
        : [];

    if ($editsPrerequisites) {
        $prerequisiteCheck = validatePrerequisiteIds($lecturerUserId, $materialId, $prerequisiteIds);
        if (!$prerequisiteCheck['success']) {
            return $prerequisiteCheck;
        }
    }

    // Same rule as the prerequisites: an update that never mentions tag_ids
    // leaves the existing tags alone. Sending '[]' is how the edit modal
    // removes the last remaining tag.
    $editsTags = array_key_exists('tag_ids', $payload);
    $tagIds = $editsTags ? normaliseTagIds($payload['tag_ids']) : [];

    if ($editsTags) {
        $tagCheck = validateTagIds($lecturerUserId, $tagIds);
        if (!$tagCheck['success']) {
            return $tagCheck;
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

    if ($editsPrerequisites) {
        $linked = setMaterialPrerequisites($materialId, $prerequisiteIds);
        if (!$linked['success']) {
            return ['success' => false, 'status' => 500, 'message' => "We couldn't update the prerequisites. Please try again later."];
        }
    }

    if ($editsTags) {
        $tagged = setMaterialTags($materialId, $lecturerUserId, $tagIds);
        if (!$tagged['success']) {
            return ['success' => false, 'status' => 500, 'message' => "We couldn't update the study tags. Please try again later."];
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
 * @param array $rows from getLecturerMaterialPrerequisites()
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
 * Turns the flat tag rows into material_id => [{id, name}, ...].
 *
 * @param array $rows from getLecturerMaterialTags()
 * @return array<int, array<int, array{id: int, name: string}>>
 */
function groupTagsByMaterial(array $rows): array
{
    $grouped = [];

    foreach ($rows as $row) {
        $grouped[(int) $row['material_id']][] = [
            'id' => (int) $row['tag_id'],
            'name' => $row['tag_name'],
        ];
    }

    return $grouped;
}

/**
 * file_type is stored lowercase ('pdf', 'slides', 'video', 'document') but the
 * table renders a badge in capitals. Uppercasing is presentation, so the raw
 * value is passed through as 'fileType' and the badge text is built in JSX.
 *
 * prerequisites is an ARRAY of the study materials a student should revise
 * first, each with its id and title - not a count. The frontend shows the
 * titles, and the edit modal needs the ids to pre-tick the current selection.
 * Materials with no prerequisites get an empty array, which is a valid state:
 * prerequisites are optional.
 *
 * tags follows the same shape ({id, name}) and the same rule - optional, so an
 * empty array is normal - and only ever holds tags this lecturer created.
 *
 * @param array $rows
 * @param array $prerequisitesByMaterial material_id => [{id, title}, ...]
 * @param array $tagsByMaterial          material_id => [{id, name}, ...]
 * @return array
 */
function formatLecturerMaterials(
    array $rows,
    array $prerequisitesByMaterial = [],
    array $tagsByMaterial = []
): array {
    return array_map(function (array $row) use ($prerequisitesByMaterial, $tagsByMaterial) {
        $id = (int) $row['id'];

        return [
            'id' => $id,
            'title' => $row['title'],
            'description' => $row['description'],
            'course' => $row['course'],
            'topic' => $row['topic'],
            'fileType' => $row['file_type'],
            'fileName' => $row['file_name'],
            'filePath' => $row['file_path'],
            'prerequisites' => $prerequisitesByMaterial[$id] ?? [],
            'tags' => $tagsByMaterial[$id] ?? [],
            'regulationStatus' => $row['regulation_status'],
            'uploadedAt' => !empty($row['uploaded_at'])
                ? substr($row['uploaded_at'], 0, 10)
                : null,
        ];
    }, $rows);
}
