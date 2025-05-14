<?php
require 'config/database.php';

$reviewId = basename($_SERVER['REQUEST_URI'], '/like');

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("UPDATE reviews SET likes = likes + 1 WHERE id = :id");
    $stmt->bindParam(':id', $reviewId, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Review not found']);
    } else {
        echo json_encode(['message' => 'Review liked successfully']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to like review: ' . $e->getMessage()]);
}
?>