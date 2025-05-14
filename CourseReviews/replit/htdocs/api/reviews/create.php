<?php
require 'config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['courseCode'], $data['courseTitle'], $data['department'], $data['instructor'], $data['rating'], $data['reviewText'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$courseCode = $data['courseCode'];
$courseTitle = $data['courseTitle'];
$department = $data['department'];
$instructor = $data['instructor'];
$semester = $data['semester'] ?? null;
$rating = (int)$data['rating'];
$reviewText = $data['reviewText'];

if (!preg_match('/^[A-Z]{4}[0-9]{3}$/', $courseCode) || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid course code or rating']);
    exit;
}

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("
        INSERT INTO reviews (course_code, course_title, department, instructor, semester, rating, review_text)
        VALUES (:course_code, :course_title, :department, :instructor, :semester, :rating, :review_text)
    ");
    $stmt->bindParam(':course_code', $courseCode);
    $stmt->bindParam(':course_title', $courseTitle);
    $stmt->bindParam(':department', $department);
    $stmt->bindParam(':instructor', $instructor);
    $stmt->bindParam(':semester', $semester);
    $stmt->bindParam(':rating', $rating, PDO::PARAM_INT);
    $stmt->bindParam(':review_text', $reviewText);
    $stmt->execute();

    http_response_code(201);
    echo json_encode(['message' => 'Review created successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create review: ' . $e->getMessage()]);
}
?>