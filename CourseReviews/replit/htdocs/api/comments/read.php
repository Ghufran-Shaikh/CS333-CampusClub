<?php
require 'config/database.php';

$reviewId = isset($_GET['reviewId']) ? (int)$_GET['reviewId'] : null;

if (!$reviewId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing reviewId']);
    exit;
}

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("SELECT * FROM comments WHERE review_id = :review_id ORDER BY posted_date DESC");
    $stmt->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
    $stmt->execute();
    $comments = $stmt->fetchAll();

    echo json_encode(['comments' => $comments]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch comments: ' . $e->getMessage()]);
}
?>