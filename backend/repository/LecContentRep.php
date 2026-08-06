<?php
/**
 * LecContentRep.php
 *
 * Repository layer for the lecturer's OWN teaching content.
 *
 *   1. getLecturerQuizzes()   -> quizzes under the lecturer's course topics
 *   2. getLecturerMaterials() -> study materials under the same topics
 *
 * Ownership is always resolved the same way:
 *   lecturers.id (int, from session)
 *     -> lecturers.lecturer_id ('LC000001', varchar)
 *       -> courses.lecturer_id
 *         -> topics.course_id
 *           -> quizzes.topic_id / study_materials.topic_id
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
 * Every prerequisite LINK under this lecturer's materials, one row per pair.
 *
 * A prerequisite is itself a study material - "you should read Python Basics
 * before Database Systems" - so both sides of the pair are study_materials rows
 * and the second join is back onto the same table under an alias.
 *
 * This is fetched as ONE flat query rather than per material: the table lists
 * every material at once, and a per-row lookup would be N+1 queries for a page
 * that already knows it needs all of them.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getMaterialPrerequisites(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                p.material_id,
                p.prerequisite_id,
                pre.title AS prerequisite_title
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            JOIN study_material_prerequisites p ON p.material_id = sm.id
            JOIN study_materials pre ON pre.id = p.prerequisite_id
            WHERE l.id = :lecturerId
            ORDER BY pre.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getMaterialPrerequisites failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Every prerequisite link on the platform, as raw (material, prerequisite) pairs.
 *
 * Deliberately NOT scoped to one lecturer, unlike getMaterialPrerequisites().
 * That one answers "what do I show this lecturer"; this one answers "would this
 * new link close a loop", and a loop can run through a material the current
 * lecturer cannot see - so a lecturer-scoped view would miss exactly the edge
 * that completes the cycle. No titles are selected, so nothing about another
 * lecturer's content leaks out of this function.
 *
 * @return array{success: bool, data?: array, error?: string}
 */
function getAllPrerequisiteEdges(): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->query(
            "SELECT material_id, prerequisite_id FROM study_material_prerequisites"
        );

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecContentRepository] getAllPrerequisiteEdges failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * True when EVERY one of these material ids sits under a course the lecturer owns.
 *
 * lecturerOwnsMaterial() answers the same question for a single id; a chosen
 * prerequisite list has to be checked as a set, otherwise a lecturer could
 * point their own material at a colleague's private material and expose its
 * title through the materials table.
 *
 * @param int   $lecturerUserId
 * @param int[] $materialIds
 * @return bool
 */
function lecturerOwnsAllMaterials(int $lecturerUserId, array $materialIds): bool
{
    if (count($materialIds) === 0) {
        return true;
    }

    $pdo = getDbConnection();

    // One named placeholder per id - the list length varies per request, so it
    // cannot be a fixed prepared statement, and interpolating the ids straight
    // into the SQL would be an injection point.
    $placeholders = [];
    foreach (array_keys($materialIds) as $index) {
        $placeholders[] = ':id' . $index;
    }

    $sql = "SELECT COUNT(DISTINCT sm.id)
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            JOIN topics t  ON t.course_id = c.id
            JOIN study_materials sm ON sm.topic_id = t.id
            WHERE l.id = :lecturerId
              AND sm.id IN (" . implode(', ', $placeholders) . ")";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
    foreach (array_values($materialIds) as $index => $materialId) {
        $stmt->bindValue(':id' . $index, $materialId, PDO::PARAM_INT);
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn() === count($materialIds);
}

/**
 * Replaces one material's prerequisite list with exactly the ids given.
 *
 * Delete-then-insert rather than a diff: the modal always submits the complete
 * list, so "what the lecturer unticked" is simply everything not resubmitted.
 * Both statements run in one transaction, because a delete that succeeds while
 * the inserts fail would silently wipe a dependency chain the lecturer meant to
 * keep. An empty list is a valid request - prerequisites are optional.
 *
 * @param int   $materialId
 * @param int[] $prerequisiteIds already validated and de-duplicated
 * @return array{success: bool, error?: string}
 */
function replaceMaterialPrerequisites(int $materialId, array $prerequisiteIds): array
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
        error_log('[LecContentRepository] replaceMaterialPrerequisites failed: ' . $e->getMessage());
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
 * Inserts one study material row.
 *
 * file_name and file_path are not written: materials are metadata only, so the
 * two columns stay NULL on every new row. They are left on the table rather
 * than dropped so the already-uploaded materials keep pointing at their files.
 *
 * @param int   $lecturerUserId becomes study_materials.uploaded_by
 * @param array $material       title, description, file_type, topic_id
 * @return array{success: bool, materialId?: int, error?: string}
 */
function createMaterial(int $lecturerUserId, array $material): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO study_materials
                (title, description, file_type, topic_id, uploaded_by, regulation_status)
             VALUES
                (:title, :description, :fileType, :topicId, :uploadedBy, 'pending')"
        );
        $stmt->bindValue(':title', $material['title'], PDO::PARAM_STR);
        $stmt->bindValue(':description', $material['description'], PDO::PARAM_STR);
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
 * Deletes one study material.
 *
 * study_material_prerequisites declares ON DELETE CASCADE on both of its
 * foreign keys, so this also clears the links pointing AT this material - a
 * material that no longer exists cannot stay a prerequisite of another one.
 *
 * @param int $materialId
 * @return array{success: bool, error?: string}
 */
function deleteMaterialById(int $materialId): array
{
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("DELETE FROM study_materials WHERE id = :materialId");
        $stmt->bindValue(':materialId', $materialId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
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
