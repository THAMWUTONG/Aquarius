<?php
/**
 * LecPerformanceRep.php
 *
 * Repository layer for the lecturer's performance analytics page.
 *
 *   1. getLecturerCourseAverages()  -> avg quiz % per course
 *   2. getLecturerTopicCompletion() -> attempted vs enrolled per topic
 *   3. getLecturerGradebook()       -> attempts + best score per student
 *
 * A quiz attempt is turned into a PERCENTAGE the same way everywhere:
 *     attempt.score / SUM(quiz_questions.score for that quiz) * 100
 * The denominator comes from a derived table (qmax) so a quiz with no
 * questions - max_score 0 - can never cause a divide-by-zero.
 */

require_once __DIR__ . '/../config/db.php';

/**
 * Average quiz percentage per course.
 *
 * Uses LEFT JOINs from courses downward so a course with no topics, no quizzes
 * or no attempts still appears in the result - with NULL, which the logic layer
 * turns into 0. An INNER JOIN would silently drop those courses from the chart.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerCourseAverages(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                c.id,
                c.title AS course,
                AVG(qa.score / qmax.max_score * 100) AS average
            FROM lecturers l
            JOIN courses c ON c.lecturer_id = l.lecturer_id
            LEFT JOIN topics t  ON t.course_id = c.id
            LEFT JOIN quizzes q ON q.topic_id = t.id
            LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
            LEFT JOIN (
                SELECT quiz_id, SUM(score) AS max_score
                FROM quiz_questions
                GROUP BY quiz_id
            ) qmax ON qmax.quiz_id = q.id AND qmax.max_score > 0
            WHERE l.id = :lecturerId
            GROUP BY c.id, c.title
            ORDER BY c.title ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecPerformanceRepository] getLecturerCourseAverages failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Per topic: how many distinct students attempted a quiz in it, and how many
 * are actively enrolled in the owning course.
 *
 * The RATE is deliberately NOT calculated here. Returning the two raw numbers
 * keeps the divide-by-zero decision (a topic in a course with 0 students) in
 * the logic layer where it can be handled explicitly.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerTopicCompletion(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $sql = "SELECT
                t.id,
                t.title AS topic,
                c.title AS course,
                (SELECT COUNT(DISTINCT qa.student_id)
                   FROM quizzes q2
                   JOIN quiz_attempts qa ON qa.quiz_id = q2.id
                  WHERE q2.topic_id = t.id) AS attempted,
                (SELECT COUNT(DISTINCT e.student_id)
                   FROM enrollment e
                  WHERE e.course_id = c.id
                    AND e.status = 'active') AS enrolled
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
        error_log('[LecPerformanceRepository] getLecturerTopicCompletion failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Gradebook: one row per enrolled student with attempt count and best score.
 *
 * COUNT(DISTINCT qa.id) and MAX(...) are both immune to the row multiplication
 * caused by joining topics -> quizzes -> attempts, which is exactly why they
 * are safe to use together in one query.
 *
 * The quiz_attempts JOIN carries "AND qa.student_id = s.id" in its ON clause,
 * not in WHERE. In a LEFT JOIN that difference matters: in WHERE it would
 * discard students who never attempted anything - the very rows we want.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, data?: array, error?: string}
 */
function getLecturerGradebook(int $lecturerUserId, ?int $courseId = null, ?int $quizId = null): array
{
    $pdo = getDbConnection();

    // The course filter restricts WHICH STUDENTS appear (only those enrolled in
    // it), so it belongs in WHERE. The quiz filter restricts WHICH ATTEMPTS
    // count, so it goes in the quizzes ON clause instead - putting it in WHERE
    // would drop every student who has not sat that specific quiz, which is
    // precisely the "No Attempt" row the gradebook exists to show.
    $courseCondition = $courseId !== null ? ' AND c.id = :courseId' : '';
    $quizCondition = $quizId !== null ? ' AND q.id = :quizId' : '';

    $sql = "SELECT
                s.id AS student_id,
                u.name,
                u.email,
                COUNT(DISTINCT qa.id) AS attempts,
                MAX(qa.score / qmax.max_score * 100) AS best_score
            FROM lecturers l
            JOIN courses c    ON c.lecturer_id = l.lecturer_id
            JOIN enrollment e ON e.course_id = c.id AND e.status = 'active'
            JOIN students s   ON s.id = e.student_id
            JOIN users u      ON u.id = s.id
            LEFT JOIN topics t  ON t.course_id = c.id
            LEFT JOIN quizzes q ON q.topic_id = t.id{$quizCondition}
            LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = s.id
            LEFT JOIN (
                SELECT quiz_id, SUM(score) AS max_score
                FROM quiz_questions
                GROUP BY quiz_id
            ) qmax ON qmax.quiz_id = q.id AND qmax.max_score > 0
            WHERE l.id = :lecturerId{$courseCondition}
            GROUP BY s.id, u.name, u.email
            ORDER BY u.name ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        if ($courseId !== null) {
            $stmt->bindValue(':courseId', $courseId, PDO::PARAM_INT);
        }
        if ($quizId !== null) {
            $stmt->bindValue(':quizId', $quizId, PDO::PARAM_INT);
        }
        $stmt->execute();

        return ['success' => true, 'data' => $stmt->fetchAll()];
    } catch (PDOException $e) {
        error_log('[LecPerformanceRepository] getLecturerGradebook failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}

/**
 * Courses and quizzes this lecturer owns, for the gradebook filter dropdowns.
 *
 * The dropdowns previously listed hard-coded titles ('Calculus I', 'HTML5
 * Semantic Elements Quiz') that exist in no database, so selecting one could
 * never match a row.
 *
 * @param int $lecturerUserId
 * @return array{success: bool, courses?: array, quizzes?: array, error?: string}
 */
function getLecturerFilterOptions(int $lecturerUserId): array
{
    $pdo = getDbConnection();

    $courseSql = "SELECT c.id, c.title
                  FROM lecturers l
                  JOIN courses c ON c.lecturer_id = l.lecturer_id
                  WHERE l.id = :lecturerId
                  ORDER BY c.title ASC";

    // course_id travels with each quiz so the frontend can narrow the quiz list
    // when a course is picked, without a second round trip.
    $quizSql = "SELECT q.id, q.title, c.id AS course_id
                FROM lecturers l
                JOIN courses c ON c.lecturer_id = l.lecturer_id
                JOIN topics t  ON t.course_id = c.id
                JOIN quizzes q ON q.topic_id = t.id
                WHERE l.id = :lecturerId
                ORDER BY c.title ASC, q.title ASC";

    try {
        $courseStmt = $pdo->prepare($courseSql);
        $courseStmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $courseStmt->execute();

        $quizStmt = $pdo->prepare($quizSql);
        $quizStmt->bindValue(':lecturerId', $lecturerUserId, PDO::PARAM_INT);
        $quizStmt->execute();

        return [
            'success' => true,
            'courses' => $courseStmt->fetchAll(),
            'quizzes' => $quizStmt->fetchAll(),
        ];
    } catch (PDOException $e) {
        error_log('[LecPerformanceRepository] getLecturerFilterOptions failed: ' . $e->getMessage());
        return ['success' => false, 'error' => 'DB_QUERY_FAILED'];
    }
}
