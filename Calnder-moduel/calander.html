<?php
// database connection attributes or data
$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");

// Set HTTP headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }

    // Get all events with comments
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['event_id'])) {
            $event_id = $_GET['event_id'];
            $stmt = $pdo->prepare("SELECT * FROM comments WHERE event_id = ?");
            $stmt->execute([$event_id]);
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($comments);
        } else {
            $stmt = $pdo->query("SELECT * FROM event ORDER BY event_id DESC");
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($events as &$event) {
                $event_id = $event['event_id'];
                $commentStmt = $pdo->prepare("SELECT * FROM comments WHERE event_id = ?");
                $commentStmt->execute([$event_id]);
                $event['comments'] = $commentStmt->fetchAll(PDO::FETCH_ASSOC);
            }

            echo json_encode($events);
        }

    // Posting a new event
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['title'], $data['description'], $data['event_datetime'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO event (title, description, event_datetime) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['event_datetime']
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Event added successfully.",
            "data" => [
                "id" => $pdo->lastInsertId(),
                "title" => $data['title'],
                "description" => $data['description'],
                "event_datetime" => $data['event_datetime']
            ]
        ]);

    // Adding a comment to a specific event
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = json_decode(file_get_contents("php://input"), true);
        $event_id = $data['event_id'] ?? null;
        $newComment = $data['comment'] ?? null;

        if (!$event_id || !$newComment) {
            http_response_code(400);
            echo json_encode(["error" => "Missing event ID or comment."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO comments (comment, event_id) VALUES (?, ?)");
        $stmt->execute([$newComment, $event_id]);

        echo json_encode(["success" => true, "message" => "Comment added."]);

    // Deleting an event
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        parse_str($_SERVER['QUERY_STRING'], $queryParams);
        $id = $queryParams['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing event ID."]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM event WHERE event_id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Event not found or already deleted."]);
        } else {
            echo json_encode(["success" => true, "message" => "Event deleted successfully."]);
        }

    } else {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
