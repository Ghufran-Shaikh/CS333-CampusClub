<?php
// database connection attributes or data
$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");

// Set HTTP headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PATCH, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }

    $action = $_GET['action'] ?? null;
    $data = json_decode(file_get_contents("php://input"), true) ?? [];

    // Handle Events
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_events') {
        $stmt = $pdo->query("SELECT * FROM event ORDER BY event_datetime ASC");
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($events);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add_event') {
        if (!isset($data['title'], $data['event_datetime'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO event (title, description, event_datetime) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['event_datetime']
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Event added successfully.",
            "event_id" => $pdo->lastInsertId()
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'update_event') {
        if (!isset($data['event_id'], $data['title'], $data['event_datetime'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields."]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE event SET title = ?, description = ?, event_datetime = ? WHERE event_id = ?");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['event_datetime'],
            $data['event_id']
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Event updated successfully."
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete_event') {
        if (!isset($data['event_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing event ID."]);
            exit;
        }

        
        $pdo->beginTransaction();

        try {
          
            $stmt = $pdo->prepare("DELETE FROM comments WHERE event_id = ?");
            $stmt->execute([$data['event_id']]);

           
            $stmt = $pdo->prepare("DELETE FROM event WHERE event_id = ?");
            $stmt->execute([$data['event_id']]);

            $pdo->commit();

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["error" => "Event not found or already deleted."]);
            } else {
                echo json_encode(["success" => true, "message" => "Event deleted successfully."]);
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        exit;
    }

    // Handle Comments
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_comments') {
        $event_id = $_GET['event_id'] ?? null;
        if (!$event_id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing event ID."]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM comments WHERE event_id = ? ORDER BY comment_id DESC");
        $stmt->execute([$event_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($comments);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add_comment') {
        if (!isset($data['event_id'], $data['comment'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields."]);
            exit;
        }

        $author = $data['author'] ?? 'Anonymous';

        $stmt = $pdo->prepare("INSERT INTO comments (event_id, comment) VALUES (?, ?)");
        $stmt->execute([
            $data['event_id'],
            $data['comment']
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Comment added successfully.",
            "comment_id" => $pdo->lastInsertId(),
            "author" => $author
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>