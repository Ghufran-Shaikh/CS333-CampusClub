<?php
require 'config/database.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("SELECT * FROM reviews ORDER BY published_date DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $reviews = $stmt->fetchAll();

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM reviews");
    $stmt->execute();
    $total = $stmt->fetch()['total'];

    echo json_encode([
        'reviews' => $reviews,
        'total' => (int)$total,
        'page' => $page,
        'limit' => $limit
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch reviews: ' . $e->getMessage()]);
}
?>