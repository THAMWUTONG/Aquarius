<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "aquarius_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed"]);
    exit();
}

// 1. Fetch Stats Counts
$totalStudents = $conn->query("SELECT COUNT(*) AS total FROM students")->fetch_assoc()['total'];
$totalQuizzes = $conn->query("SELECT COUNT(*) AS total FROM quizzes")->fetch_assoc()['total'];
$totalMaterials = $conn->query("SELECT COUNT(*) AS total FROM study_materials")->fetch_assoc()['total'];
$totalFeedback = $conn->query("SELECT COUNT(*) AS total FROM quiz_feedback")->fetch_assoc()['total'];

// 2. Fetch Roster
$sqlRoster = "
    SELECT 
        u.name, 
        u.email, 
        GROUP_CONCAT(c.code SEPARATOR ', ') AS classes
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN enrollment e ON s.id = e.student_id
    LEFT JOIN courses c ON e.course_id = c.id
    GROUP BY s.id
";

$resRoster = $conn->query($sqlRoster);
$roster = array();

if ($resRoster && $resRoster->num_rows > 0) {
    while ($row = $resRoster->fetch_assoc()) {
        $roster[] = $row;
    }
}

// 3. Return JSON Response
echo json_encode([
    "stats" => [
        "totalStudents" => (int)$totalStudents,
        "totalQuizzes" => (int)$totalQuizzes,
        "totalMaterials" => (int)$totalMaterials,
        "totalFeedback" => (int)$totalFeedback
    ],
    "roster" => $roster
]);

$conn->close();
?>