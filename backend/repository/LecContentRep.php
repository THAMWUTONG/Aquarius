<?php
/**
 * LecContentRep.php
 *
 * Repository layer for the lecturer's OWN teaching content.
 *
 *   1. getLecturerQuizzes()   -> quizzes under the lecturer's course topics
 *   2. getLecturerMaterials() -> study materials under the same topics
 *   3. getLecturerTags()      -> study tags the lecturer created themselves
 *
 * Ownership is always resolved the same way:
 *   lecturers.id (int, from session)
 *     -> lecturers.lecturer_id ('LC000001', varchar)
 *       -> courses.lecturer_id
 *         -> topics.course_id
 *           -> quizzes.topic_id / study_materials.topic_id
 *
 * Study tags are the one exception: tags.created_by points straight at
 * lecturers.id, so a tag is owned by the lecturer who typed it - never by
 * whoever owns the material it is stuck on.
 */

require_once __DIR__ . '/../config/db.php';

/**
 * All quizzes belonging to this lecturer's courses.
 *
 * Question count and feedback count are scalar subqueries rather than extra
 * JOINs: joining quiz_questions AND quiz_feedback in one GROUP BY would let
 * the two one-to-many relationships multiply each other's rows and inflate
 * both counts.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerQuizzes(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                q.id,
                q.title,
                c.title AS course,
                t.title AS topic,
                q.duration_min,
                q.is_published,
                q.regulation_status,
                (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions,
                (SELECT COUNT(*) FROM quiz_feedback qf WHERE qf.quiz_id = q.id) AS comments
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN quizzes q ON q.topic_id = t.id
            WHERE l.id = :lecturerId
            ORDER BY c.title ASC, t.order_index ASC, q.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerQuizzes failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Every topic under this lecturer's courses, for the create/upload dropdowns.
 *
 * The modals used to hard-code a topic list ('Topic 1 - Variables', ...) whose
 * ids did not match this database, so a submitted quiz either landed under the
 * wrong topic or was rejected by the topics foreign key. Feeding the dropdown
 * from here means it can only ever offer topics the lecturer actually owns.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerTopics(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                t.id,
                t.title AS topic,
                c.id AS course_id,
                c.title AS course
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            WHERE l.id = :lecturerId
            ORDER BY c.title ASC, t.order_index ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerTopics failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * True when this topic sits under a course the lecturer owns.
 *
 * Every write path calls this BEFORE inserting. Without it a lecturer could
 * post any topic_id - including a colleague's - and drop content into a course
 * that is not theirs, because the foreign key only checks that the topic
 * exists, never who owns it.
 *
 * @param int $lecturerUserId
 * @param int $topicId
 * @return bool
 */
function lecturerOwnsTopic(int $lecturerUserId, int $topicId): bool
{
    $pdo = getDbConnection();

    $sql = "SELECT 1
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            WHERE l.id = :lecturerId AND t.id = :topicId
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    $stmt->bindValue(':topicId', $topicId, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchColumn() !== false;
}

/**
 * True when this quiz sits under a course the lecturer owns.
 *
 * @param int $lecturerUserId
 * @param int $quizId
 * @return bool
 */
function lecturerOwnsQuiz(int $lecturerUserId, int $quizId): bool
{
    $pdo = getDbConnection();

    $sql = "SELECT 1
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN quizzes q ON q.topic_id = t.id
            WHERE l.id = :lecturerId AND q.id = :quizId
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchColumn() !== false;
}

/**
 * True when this material sits under a course the lecturer owns.
 *
 * @param int $lecturerUserId
 * @param int $materialId
 * @return bool
 */
function lecturerOwnsMaterial(int $lecturerUserId, int $materialId): bool
{
    $pdo = getDbConnection();

    $sql = "SELECT 1
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            WHERE l.id = :lecturerId AND sm.id = :materialId
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    $stmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchColumn() !== false;
}

/**
 * All study materials belonging to this lecturer's courses.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerMaterials(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                sm.id,
                sm.title,
                sm.description,
                c.title AS course,
                t.title AS topic,
                sm.file_type,
                sm.file_name,
                sm.file_path,
                sm.regulation_status,
                sm.uploaded_at
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            WHERE l.id = :lecturerId
            ORDER BY c.title ASC, t.order_index ASC, sm.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerMaterials failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Every prerequisite link under this lecturer's courses, one row per pair.
 *
 * A prerequisite is itself a study material - the one a student should revise
 * before the current one (Chapter 1 is the prerequisite of Chapter 2) - so the
 * prerequisite's own title is joined in and the caller groups the rows by
 * material_id. This is fetched as ONE query for the whole table rather than a
 * per-row subquery, which would be a query per material rendered.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerMaterialPrerequisites(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                p.material_id,
                pre.id    AS prerequisite_id,
                pre.title AS prerequisite_title
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            JOIN study_material_prerequisites p ON p.material_id = sm.id
            JOIN study_materials pre ON pre.id = p.prerequisite_id
            WHERE l.id = :lecturerId
            ORDER BY p.material_id ASC, pre.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerMaterialPrerequisites failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * How many of the given material ids the lecturer actually owns.
 *
 * Used to reject a prerequisite list containing someone else's material: the
 * foreign key only checks the row exists, never who it belongs to.
 *
 * @param int   $lecturerUserId
 * @param int[] $materialIds non-empty, already cast to int
 * @return int
 */
function countOwnedMaterials(int $lecturerUserId, array $materialIds): int
{
    if (count($materialIds) === 0) {
        return 0;
    }

    $pdo = getDbConnection();

    // Reindexed first: a caller's array may have gaps (array_filter leaves
    // them), and the placeholder names must line up with the bind loop below.
    $materialIds = array_values($materialIds);

    // Named placeholders per id: the list length varies, so the statement
    // cannot be a fixed string, but the values still never touch the SQL.
    $placeholders = [];
    foreach (array_keys($materialIds) as $index) {
        $placeholders[] = ':id' . $index;
    }

    $sql = "SELECT COUNT(*)
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            WHERE l.id = :lecturerId AND sm.id IN (" . implode(', ', $placeholders) . ")";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    foreach (array_values($materialIds) as $index => $materialId) {
        $stmt->bindValue(':id' . $index, $materialId, PDO::PARAM_INT);
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

/**
 * Replaces the whole prerequisite list of one material.
 *
 * Delete-then-insert inside a transaction, because a half-applied edit would
 * leave the material pointing at a mix of its old and new prerequisites - worse
 * than either list on its own. An empty list simply clears them, which is what
 * "prerequisites are optional" means once one has been set.
 *
 * Ownership of both the material and every prerequisite must already have been
 * checked by the caller.
 *
 * @param int   $materialId
 * @param int[] $prerequisiteIds
 * @return array{success: bool, error?: string}
 */
function setMaterialPrerequisites(int $materialId, array $prerequisiteIds): array
{
    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $deleteStmt = $pdo->prepare(
            "DELETE FROM study_material_prerequisites WHERE material_id = :materialId"
        );
        $deleteStmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $deleteStmt->execute();

        if (count($prerequisiteIds) > 0) {
            $insertStmt = $pdo->prepare(
                "INSERT INTO study_material_prerequisites (material_id, prerequisite_id)
                 VALUES (:materialId, :prerequisiteId)"
            );

            foreach ($prerequisiteIds as $prerequisiteId) {
                $insertStmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
                $insertStmt->bindValue(':prerequisiteId', $prerequisiteId, PDO::PARAM_INT);
                $insertStmt->execute();
            }
        }

        $pdo->commit();

        return ['success' => true];
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[LecContentRepository] setMaterialPrerequisites failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Every study tag this lecturer created, with how many materials use it.
 *
 * The count is a scalar subquery rather than a JOIN + GROUP BY so a tag that is
 * not on any material yet still comes back, with a count of 0 - a brand new tag
 * must be visible in the manage list before it has been used anywhere.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerTags(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                tg.id,
                tg.name,
                (SELECT COUNT(*) FROM study_material_tags smt WHERE smt.tag_id = tg.id) AS material_count
            FROM tags tg
            WHERE tg.created_by = :lecturerId
            ORDER BY tg.name ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerTags failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Every tag link on this lecturer's materials, one row per pair.
 *
 * Deliberately restricted to tags the lecturer CREATED (tg.created_by = l.id):
 * a colleague may have tagged one of these materials, and showing a tag the
 * lecturer cannot edit or remove would be a control they have no way to use.
 * Fetched as ONE query for the whole table, like the prerequisites are.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerMaterialTags(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                smt.material_id,
                tg.id   AS tag_id,
                tg.name AS tag_name
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            JOIN study_material_tags smt ON smt.material_id = sm.id
            JOIN tags tg ON tg.id = smt.tag_id AND tg.created_by = l.id
            WHERE l.id = :lecturerId
            ORDER BY smt.material_id ASC, tg.name ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getLecturerMaterialTags failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * True when this tag was created by this lecturer.
 *
 * @param int $lecturerUserId
 * @param int $tagId
 * @return bool
 */
function lecturerOwnsTag(int $lecturerUserId, int $tagId): bool
{
    $pdo = getDbConnection();

    $stmt = $pdo->prepare(
        "SELECT 1 FROM tags WHERE id = :tagId AND created_by = :lecturerId LIMIT 1"
    );
    $stmt->bindValue(':tagId', $tagId, PDO::PARAM_INT);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchColumn() !== false;
}

/**
 * How many of the given tag ids this lecturer actually created.
 *
 * Same reasoning as countOwnedMaterials(): the foreign key only proves the tag
 * row exists, so without this a lecturer could post a colleague's tag id and
 * stick someone else's tag onto their material.
 *
 * @param int   $lecturerUserId
 * @param int[] $tagIds already cast to int
 * @return int
 */
function countOwnedTags(int $lecturerUserId, array $tagIds): int
{
    if (count($tagIds) === 0) {
        return 0;
    }

    $pdo = getDbConnection();

    $tagIds = array_values($tagIds);

    $placeholders = [];
    foreach (array_keys($tagIds) as $index) {
        $placeholders[] = ':id' . $index;
    }

    $sql = "SELECT COUNT(*)
            FROM tags
            WHERE created_by = :lecturerId AND id IN (" . implode(', ', $placeholders) . ")";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    foreach ($tagIds as $index => $tagId) {
        $stmt->bindValue(':id' . $index, $tagId, PDO::PARAM_INT);
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

/**
 * Who created the tag with this exact name, if anyone.
 *
 * tags.name carries a UNIQUE index across the WHOLE platform, so a lecturer can
 * collide with a colleague's tag they are not even allowed to see. This lets the
 * logic layer say which of the two happened instead of reporting a bare
 * constraint violation the lecturer cannot act on.
 *
 * @param string $name
 * @param int    $excludeTagId ignore this row - the tag being renamed to itself
 * @return int|null lecturers.id, or null when the name is free
 */
function getTagOwnerByName(string $name, int $excludeTagId = 0): ?int
{
    $pdo = getDbConnection();

    $stmt = $pdo->prepare(
        "SELECT created_by FROM tags WHERE name = :name AND id <> :excludeId LIMIT 1"
    );
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':excludeId', $excludeTagId, PDO::PARAM_INT);
    $stmt->execute();

    $owner = $stmt->fetchColumn();

    return $owner === false ? null : (int) $owner;
}

/**
 * Inserts one study tag owned by this lecturer.
 *
 * @param int    $lecturerUserId becomes tags.created_by
 * @param string $name
 * @return array{success: bool, tagId?: int, error?: string}
 */
function createTag(int $lecturerUserId, string $name): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO tags (name, created_by) VALUES (:name, :createdBy)"
        );
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':createdBy', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'tagId' => (int) $pdo->lastInsertId()];
    } catch (PDOException $e) {
        // 23000 is the integrity-violation class - here it can only be the
        // UNIQUE name index, which the caller reports as a name clash rather
        // than a server error.
        if ($e->getCode() === '23000') {
            return ['success' => false, 'error' => 'DUPLICATE_NAME'];
        }

        error_log('[LecContentRepository] createTag failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Renames one study tag. Ownership must already have been checked.
 *
 * @param int    $tagId
 * @param string $name
 * @return array{success: bool, error?: string}
 */
function updateTagById(int $tagId, string $name): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("UPDATE tags SET name = :name WHERE id = :tagId");
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':tagId', $tagId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            return ['success' => false, 'error' => 'DUPLICATE_NAME'];
        }

        error_log('[LecContentRepository] updateTagById failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Deletes one study tag.
 *
 * study_material_tags declares ON DELETE CASCADE against tags, so this also
 * pulls the tag off every material carrying it - which is the point: a deleted
 * tag must not linger on the materials table. The materials themselves are
 * untouched. Ownership must already have been checked by the caller.
 *
 * @param int $tagId
 * @return array{success: bool, error?: string}
 */
function deleteTagById(int $tagId): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("DELETE FROM tags WHERE id = :tagId");
        $stmt->bindValue(':tagId', $tagId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] deleteTagById failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Replaces the tags ONE lecturer has put on one material.
 *
 * The delete is scoped to tags this lecturer created, not to the material as a
 * whole: another lecturer's tag on the same material is not part of this
 * selection - it was never shown in the picker - so clearing it would be
 * silent data loss caused by an edit that never mentioned it.
 *
 * Delete-then-insert inside a transaction, for the same reason as
 * setMaterialPrerequisites(): a half-applied edit leaves a mix of the old and
 * new selection, which is worse than either.
 *
 * @param int   $materialId
 * @param int   $lecturerUserId
 * @param int[] $tagIds ownership already checked by the caller
 * @return array{success: bool, error?: string}
 */
function setMaterialTags(int $materialId, int $lecturerUserId, array $tagIds): array
{
    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $deleteStmt = $pdo->prepare(
            "DELETE smt
               FROM study_material_tags smt
               JOIN tags tg ON tg.id = smt.tag_id
              WHERE smt.material_id = :materialId AND tg.created_by = :lecturerId"
        );
        $deleteStmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $deleteStmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $deleteStmt->execute();

        if (count($tagIds) > 0) {
            $insertStmt = $pdo->prepare(
                "INSERT INTO study_material_tags (material_id, tag_id)
                 VALUES (:materialId, :tagId)"
            );

            foreach ($tagIds as $tagId) {
                $insertStmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
                $insertStmt->bindValue(':tagId', $tagId, PDO::PARAM_INT);
                $insertStmt->execute();
            }
        }

        $pdo->commit();

        return ['success' => true];
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[LecContentRepository] setMaterialTags failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Inserts a quiz plus its questions and their answer options.
 *
 * This spans THREE tables (quizzes -> quiz_questions -> quiz_answers) and is
 * wrapped in one transaction on purpose: a quiz row with no questions, or a
 * question with no answer options, is not a partially saved quiz - it is a
 * broken one that would render an unanswerable test to students. Either the
 * whole structure lands or none of it does.
 *
 * @param int   $lecturerUserId  becomes quizzes.created_by
 * @param array $quiz            title, description, topic_id, duration_min, is_published
 * @param array $questions       each: question, score, explanation, answers[{text, is_correct}]
 * @return array{success: bool, quizId?: int, error?: string}
 */
function createQuizWithQuestions(int $lecturerUserId, array $quiz, array $questions): array
{
    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $quizStmt = $pdo->prepare(
            "INSERT INTO quizzes
                (title, description, topic_id, created_by, duration_min, is_published, regulation_status)
             VALUES
                (:title, :description, :topicId, :createdBy, :durationMin, :isPublished, 'pending')"
        );
        $quizStmt->bindValue(':title', $quiz['title'], PDO::PARAM_STR);
        $quizStmt->bindValue(':description', $quiz['description'], PDO::PARAM_STR);
        $quizStmt->bindValue(':topicId', $quiz['topic_id'], PDO::PARAM_INT);
        $quizStmt->bindValue(':createdBy', $lecturerUserId, PDO::PARAM_INT);
        $quizStmt->bindValue(':durationMin', $quiz['duration_min'], PDO::PARAM_INT);
        $quizStmt->bindValue(':isPublished', $quiz['is_published'], PDO::PARAM_INT);
        $quizStmt->execute();

        $quizId = (int) $pdo->lastInsertId();

        $questionStmt = $pdo->prepare(
            "INSERT INTO quiz_questions (quiz_id, question, score, explanation, order_index)
             VALUES (:quizId, :question, :score, :explanation, :orderIndex)"
        );
        $answerStmt = $pdo->prepare(
            "INSERT INTO quiz_answers (question_id, answer_text, is_correct)
             VALUES (:questionId, :answerText, :isCorrect)"
        );

        foreach ($questions as $index => $question) {
            $questionStmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
            $questionStmt->bindValue(':question', $question['question'], PDO::PARAM_STR);
            $questionStmt->bindValue(':score', $question['score']);
            $questionStmt->bindValue(':explanation', $question['explanation'], PDO::PARAM_STR);
            $questionStmt->bindValue(':orderIndex', $index + 1, PDO::PARAM_INT);
            $questionStmt->execute();

            $questionId = (int) $pdo->lastInsertId();

            foreach ($question['answers'] as $answer) {
                $answerStmt->bindValue(':questionId', $questionId, PDO::PARAM_INT);
                $answerStmt->bindValue(':answerText', $answer['text'], PDO::PARAM_STR);
                $answerStmt->bindValue(':isCorrect', $answer['is_correct'] ? 1 : 0, PDO::PARAM_INT);
                $answerStmt->execute();
            }
        }

        $pdo->commit();

        return ['success' => true, 'quizId' => $quizId];
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[LecContentRepository] createQuizWithQuestions failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Deletes one quiz.
 *
 * quiz_questions, quiz_answers, quiz_attempts and quiz_feedback all declare
 * ON DELETE CASCADE against quizzes, so this single statement removes the whole
 * tree. Ownership must already have been checked by the caller.
 *
 * @param int $quizId
 * @return array{success: bool, error?: string}
 */
function deleteQuizById(int $quizId): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("DELETE FROM quizzes WHERE id = :quizId");
        $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] deleteQuizById failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Updates the editable fields of one quiz. Questions are not touched.
 *
 * @param int   $quizId
 * @param array $quiz title, description, topic_id, duration_min, is_published
 * @return array{success: bool, error?: string}
 */
function updateQuizById(int $quizId, array $quiz): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare(
            "UPDATE quizzes
                SET title = :title,
                    description = :description,
                    topic_id = :topicId,
                    duration_min = :durationMin,
                    is_published = :isPublished
              WHERE id = :quizId"
        );
        $stmt->bindValue(':title', $quiz['title'], PDO::PARAM_STR);
        $stmt->bindValue(':description', $quiz['description'], PDO::PARAM_STR);
        $stmt->bindValue(':topicId', $quiz['topic_id'], PDO::PARAM_INT);
        $stmt->bindValue(':durationMin', $quiz['duration_min'], PDO::PARAM_INT);
        $stmt->bindValue(':isPublished', $quiz['is_published'], PDO::PARAM_INT);
        $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] updateQuizById failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Student comments left on one quiz.
 *
 * @param int $quizId
 * @return array{success: bool, data?: array, error?: string}
 */
function getQuizFeedback(int $quizId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                qf.id,
                qf.comment,
                qf.submitted_at,
                u.name AS student_name
            FROM quiz_feedback qf
            JOIN users u ON u.id = qf.student_id
            WHERE qf.quiz_id = :quizId
            ORDER BY qf.submitted_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getQuizFeedback failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Inserts one study material row after its file has been stored on disk.
 *
 * @param int   $lecturerUserId becomes study_materials.uploaded_by
 * @param array $material       title, description, file_name, file_path, file_type, topic_id
 * @return array{success: bool, materialId?: int, error?: string}
 */
function createMaterial(int $lecturerUserId, array $material): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO study_materials
                (title, description, file_name, file_path, file_type, topic_id, uploaded_by, regulation_status)
             VALUES
                (:title, :description, :fileName, :filePath, :fileType, :topicId, :uploadedBy, 'pending')"
        );
        $stmt->bindValue(':title', $material['title'], PDO::PARAM_STR);
        $stmt->bindValue(':description', $material['description'], PDO::PARAM_STR);
        $stmt->bindValue(':fileName', $material['file_name'], PDO::PARAM_STR);
        $stmt->bindValue(':filePath', $material['file_path'], PDO::PARAM_STR);
        $stmt->bindValue(':fileType', $material['file_type'], PDO::PARAM_STR);
        $stmt->bindValue(':topicId', $material['topic_id'], PDO::PARAM_INT);
        $stmt->bindValue(':uploadedBy', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'materialId' => (int) $pdo->lastInsertId()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] createMaterial failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Deletes one study material and reports the stored file path so the caller can
 * remove the file afterwards.
 *
 * The path is read BEFORE the delete - afterwards the row is gone and the file
 * on disk would be orphaned with no way to find it.
 *
 * @param int $materialId
 * @return array{success: bool, filePath?: ?string, error?: string}
 */
function deleteMaterialById(int $materialId): array
{
    $pdo = getDbConnection();

    try {
        $pathStmt = $pdo->prepare("SELECT file_path FROM study_materials WHERE id = :materialId");
        $pathStmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $pathStmt->execute();
        $filePath = $pathStmt->fetchColumn();

        $stmt = $pdo->prepare("DELETE FROM study_materials WHERE id = :materialId");
        $stmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'filePath' => $filePath === false ? null : $filePath];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] deleteMaterialById failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Updates the editable metadata of one study material. The file is not replaced.
 *
 * @param int   $materialId
 * @param array $material title, description, topic_id
 * @return array{success: bool, error?: string}
 */
function updateMaterialById(int $materialId, array $material): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare(
            "UPDATE study_materials
                SET title = :title,
                    description = :description,
                    topic_id = :topicId
              WHERE id = :materialId"
        );
        $stmt->bindValue(':title', $material['title'], PDO::PARAM_STR);
        $stmt->bindValue(':description', $material['description'], PDO::PARAM_STR);
        $stmt->bindValue(':topicId', $material['topic_id'], PDO::PARAM_INT);
        $stmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] updateMaterialById failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}