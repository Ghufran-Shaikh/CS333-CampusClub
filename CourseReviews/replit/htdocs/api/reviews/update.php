<?php
require 'config/database.php';

$reviewId = basename($_SERVER['REQUEST_URI']);
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
        UPDATE reviews
        SET course_code = :course_code, course_title = :course_title, department = :department,
            instructor = :instructor, semester = :semester, rating = :rating, review_text = :review_text
        WHERE id = :id
    ");
    $stmt->bindParam(':course_code', $courseCode);
    $stmt->bindParam(':course_title', $courseTitle);
    $stmt->bindParam(':department', $department);
    $stmt->bindParam(':instructor', $instructor);
    $stmt->bindParam(':semester', $semester);
    $stmt->bindParam(':rating', $rating, PDO::PARAM_INT);
    $stmt->bindParam(':review_text', $reviewText);
    $stmt->bindParam(':id', $reviewId, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Review not found']);
    } else {
        echo json_encode(['message' => 'Review updated successfully']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update review: ' . $e->getMessage()]);
}
?>