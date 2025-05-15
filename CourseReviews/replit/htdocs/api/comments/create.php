<?php
require 'config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['reviewId'], $data['commentText'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$reviewId = (int)$data['reviewId'];
$commentText = $data['commentText'];
$postedBy = $data['postedBy'] ?? 'Anonymous';

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("
        INSERT INTO comments (review_id, comment_text, posted_by)
        VALUES (:review_id, :comment_text, :posted_by)
    ");
    $stmt->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
    $stmt->bindParam(':comment_text', $commentText);
    $stmt->bindParam(':posted_by', $postedBy);
    $stmt->execute();

    http_response_code(201);
    echo json_encode(['message' => 'Comment created successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create comment: ' . $e->getMessage()]);
}
?>