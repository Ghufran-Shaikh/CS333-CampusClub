<?php
header("Content-Type: application/json");
require 'db.php';
require 'auth.php';

// Validate JWT for all endpoints except GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    $tokenData = validateJWT();
    
    // You can access user ID with $tokenData->sub
    // Add user_id to events table and set it when creating events
}

// Enable CORS for frontend access
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// Get pagination parameters
$page = $_GET['page'] ?? 1;
$limit = $_GET['limit'] ?? 10;
$offset = ($page - 1) * $limit;

// Get filtering parameters
$search = $_GET['search'] ?? null;
$sort = $_GET['sort'] ?? 'start_time';
$order = $_GET['order'] ?? 'ASC';

// Validate and sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags($data));
}

$input = sanitizeInput($input);
require 'auth.php';

// Validate JWT for all endpoints except GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    $tokenData = validateJWT();
    
    
}

// API Endpoints
switch ($method) {
    case 'GET':
        // List all events with pagination and filtering
        $query = "SELECT * FROM events WHERE 1=1";
        $params = [];
        
        if ($search) {
            $query .= " AND title LIKE :search";
            $params[':search'] = "%$search%";
        }
        
        $query .= " ORDER BY $sort $order LIMIT :limit OFFSET :offset";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $events = $stmt->fetchAll();
        
        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) FROM events";
        if ($search) {
            $countQuery .= " WHERE title LIKE :search";
        }
        $countStmt = $pdo->prepare($countQuery);
        if ($search) {
            $countStmt->bindValue(':search', "%$search%");
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();
        
        echo json_encode([
            'data' => $events,
            'pagination' => [
                'total' => $total,
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
        break;

    case 'POST':
        // Create new event
        if (!isset($input['title'], $input['start_time'], $input['end_time'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO events (title, description, start_time, end_time) 
                                  VALUES (:title, :description, :start_time, :end_time)");
            $stmt->execute([
                ':title' => $input['title'],
                ':description' => $input['description'] ?? '',
                ':start_time' => $input['start_time'],
                ':end_time' => $input['end_time']
            ]);
            
            http_response_code(201);
            echo json_encode([
                'message' => 'Event created',
                'id' => $pdo->lastInsertId(),
                'data' => $input
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update existing event
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Event ID is required']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE events SET 
                                  title = :title, 
                                  description = :description, 
                                  start_time = :start_time, 
                                  end_time = :end_time 
                                  WHERE id = :id");
            
            $stmt->execute([
                ':title' => $input['title'] ?? '',
                ':description' => $input['description'] ?? '',
                ':start_time' => $input['start_time'] ?? '',
                ':end_time' => $input['end_time'] ?? '',
                ':id' => $_GET['id']
            ]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => 'Event updated']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Event not found or no changes made']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete an event
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Event ID is required']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM events WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => 'Event deleted']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Event not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>