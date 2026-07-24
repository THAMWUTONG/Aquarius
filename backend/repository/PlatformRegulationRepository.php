<?php
// dir use to find everywhere the file located
// find database.php, require once avoid duplicate
require_once __DIR__ . '/../config/db.php';

class PlatformRegulationRepository {
    
    // get all the pending study materials
    // connect db and execute sql query
    // join sm table with user name, id, topic, course where pending
    // order by asc (see from the late not latest)
    // fetch all the suite results
    public function getPendingStudyMaterials(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT sm.*, u.name as uploaded_by_name, t.title as topic_title, c.title as course_title
            FROM study_materials sm
            JOIN users u ON sm.uploaded_by = u.id
            JOIN topics t ON sm.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            WHERE sm.regulation_status = 'pending'
            ORDER BY sm.uploaded_at ASC
        ");
        return $stmt->fetchAll();
    }
    
    // prepare sql search for a material using material id
    // get db connect and join sm, user, title, course where smid=material id
    // bindValue (like authorize identity), authorize material id with int format
    // execute sql and fetch record
    // return the material table with record...false return null, true return record
    public function getStudyMaterialById(int $materialId): ?array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT sm.*, u.name as uploaded_by_name, t.title as topic_title, c.title as course_title
            FROM study_materials sm
            JOIN users u ON sm.uploaded_by = u.id
            JOIN topics t ON sm.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            WHERE sm.id = :material_id
        ");
        $stmt->bindValue(':material_id', $materialId, PDO::PARAM_INT);
        $stmt->execute();
        $material = $stmt->fetch();
        return $material === false ? null : $material;
    }
    
    // search for material using id to update status (pending--> approved/rejected)
    public function updateStudyMaterialRegulation(int $materialId, string $status): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            UPDATE study_materials 
            SET regulation_status = :status 
            WHERE id = :material_id
        ");
        return $stmt->execute([
            ':material_id' => $materialId,
            ':status' => $status
        ]);
    }
    
    // get all the pending quizzes
    // connect db and execute sql query
    // join quizzes table with user name, id, topic, course where pending
    // order by asc (see from the late not latest)
    // fetch all the suite results
    public function getPendingQuizzes(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT q.*, u.name as created_by_name, t.title as topic_title, c.title as course_title,
                   (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
            FROM quizzes q
            JOIN users u ON q.created_by = u.id
            JOIN topics t ON q.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            WHERE q.regulation_status = 'pending'
            ORDER BY q.created_at ASC
        ");
        return $stmt->fetchAll();
    }
    
    // prepare sql search for a quizzes using quizzes id
    // get db connect and join q, user, title, course where q.id=quizzes id
    // count how many question inside the quizzes 
    // bindValue (like authorize identity), authorize quizzes id with int format
    // execute sql and fetch record
    // return the quizzes table with record...false return null, true return record
    public function getQuizById(int $quizId): ?array {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT q.*, u.name as created_by_name, t.title as topic_title, c.title as course_title,
                   (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
            FROM quizzes q
            JOIN users u ON q.created_by = u.id
            JOIN topics t ON q.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            WHERE q.id = :quiz_id
        ");
        $stmt->bindValue(':quiz_id', $quizId, PDO::PARAM_INT);
        $stmt->execute();
        $quiz = $stmt->fetch();
        return $quiz === false ? null : $quiz;
    }
    
    // search for quizzes using id to update status (pending--> approved/rejected)
    public function updateQuizRegulation(int $quizId, string $status): bool {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            UPDATE quizzes 
            SET regulation_status = :status 
            WHERE id = :quiz_id
        ");
        return $stmt->execute([
            ':quiz_id' => $quizId,
            ':status' => $status
        ]);
    }
    
    // get all the stats below display
    // for the last access==now-24 hrs interval [exp 8am now, lastaccess from yesterday 8am until now]
    public function getPlatformStats(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM students) as total_students,
                (SELECT COUNT(*) FROM lecturers) as total_lecturers,
                (SELECT COUNT(*) FROM admins) as total_admins,
                (SELECT COUNT(*) FROM courses) as total_courses,
                (SELECT COUNT(*) FROM topics) as total_topics,
                (SELECT COUNT(*) FROM enrollment WHERE status = 'active') as total_enrollments,
                (SELECT COUNT(*) FROM study_materials) as total_study_materials,
                (SELECT COUNT(*) FROM quizzes) as total_quizzes,
                (SELECT COUNT(*) FROM quiz_attempts) as total_quiz_attempts,
                (SELECT COUNT(*) FROM study_materials WHERE regulation_status = 'pending') as pending_materials,
                (SELECT COUNT(*) FROM quizzes WHERE regulation_status = 'pending') as pending_quizzes,
                (SELECT COUNT(*) FROM users WHERE last_access >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as active_users_today
        ");
        return $stmt->fetch();
    }
    
    // connect db and execute sql query
    // distinct is avoid duplicate (maybe student attempt twice--only count one)
    // coalesce to return 0 instead of null if no avg score
    // den count for student passed test join table
    // fetch all the data
    public function getCoursePerformance(): array {
        $pdo = getDbConnection();
        $stmt = $pdo->query("
            SELECT 
                c.id as course_id,
                c.title as course_title,
                COUNT(DISTINCT e.student_id) as total_students,
                COALESCE(AVG(qa.score), 0) as average_score,
                COALESCE(COUNT(DISTINCT qa.student_id), 0) as students_tested,
                COALESCE((
                    SELECT COUNT(DISTINCT qa2.student_id) 
                    FROM quiz_attempts qa2 
                    JOIN quizzes q2 ON qa2.quiz_id = q2.id 
                    JOIN topics t2 ON q2.topic_id = t2.id 
                    WHERE t2.course_id = c.id AND qa2.score >= 60
                ), 0) as students_passed
            FROM courses c
            LEFT JOIN enrollment e ON c.id = e.course_id AND e.status = 'active'
            LEFT JOIN topics t ON c.id = t.course_id
            LEFT JOIN quizzes q ON t.id = q.topic_id
            LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
            GROUP BY c.id
            ORDER BY c.title
        ");
        return $stmt->fetchAll();
    }
    
    // suspect every action by admin (create admin, disenrolled admin/student)
    // recorded by admin id, action, timestamp
    // using void to return nothing, it just record log entry
    public function logAction(int $adminId, string $action): void {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("INSERT INTO audit_logs (admin_id, action) VALUES (:admin_id, :action)");
        $stmt->execute([
            ':admin_id' => $adminId,
            ':action' => $action
        ]);
    }
}