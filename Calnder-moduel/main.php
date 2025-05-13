<?php

  $host = "127.0.0.1";
  $user = getenv("db_user");
  $pass = getenv("db_pass");
  $db = getenv("db_name");

  $conn = new mysqli($host, $user, $pass, $db);
  if ($conn->connect_error)
      die("Connection failed: " . $conn->connect_error);
  echo "<p>DATABASE connected succesfully!</p>";
  $conn->close();

// Required headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); // Allow requests from any origin (DEVELOPMENT ONLY!)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database configuration
include_once 'config.php';


// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get the item ID from the request (if applicable)
$itemId = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null; // Validate ID

// --- Input Validation and Sanitization ---
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        if ($itemId !== false && $itemId !== null) { // Check if $itemId is a valid integer
            getItem($pdo, $itemId); // Read a single item
        } else {
            listItems($pdo); // List all items (with pagination and filtering)
        }
        break;
    case 'POST':
        createItem($pdo); // Create a new item
        break;
    case 'PUT':
        updateItem($pdo, $itemId); // Update an existing item
        break;
    case 'DELETE':
        deleteItem($pdo, $itemId); // Delete an item
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method not allowed."]);
        break;
}

// --- CRUD Operations ---

function listItems($pdo) {
    // Pagination parameters
    $page = isset($_GET['page']) ? max(1, filter_var($_GET['page'], FILTER_VALIDATE_INT)) : 1; // Validate page
    $recordsPerPage = isset($_GET['recordsPerPage']) ? max(1, filter_var($_GET['recordsPerPage'], FILTER_VALIDATE_INT)) : 5; // Validate recordsPerPage
    $offset = ($page - 1) * $recordsPerPage;

    // Filtering parameters
    $nameFilter = isset($_GET['name']) ? sanitizeInput($_GET['name']) : '';
    $descriptionFilter = isset($_GET['description']) ? sanitizeInput($_GET['description']) : '';

    // Build the WHERE clause
    $whereClauses = [];
    $queryParams = [];

    if (!empty($nameFilter)) {
        $whereClauses[] = "name LIKE ?";
        $queryParams[] = "%" . $nameFilter . "%";
    }

    if (!empty($descriptionFilter)) {
        $whereClauses[] = "description LIKE ?";
        $queryParams[] = "%" . $descriptionFilter . "%";
    }

    $whereClause = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";

    // Prepare the query
    $sql = "SELECT id, name, description FROM items " . $whereClause . " ORDER BY created_at DESC LIMIT :offset, :recordsPerPage";
    $stmt = $pdo->prepare($sql);

    // Bind parameters
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':recordsPerPage', $recordsPerPage, PDO::PARAM_INT);

    // Bind filter parameters
    for ($i = 0; $i < count($queryParams); $i++) {
        $stmt->bindValue($i + 1, $queryParams[$i], PDO::PARAM_STR);
    }

    // Execute the query
    try {
        $stmt->execute();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $items = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $item = array(
                    "id" => $id,
                    "name" => $name,
                    "description" => $description
                );
                array_push($items, $item);
            }

            http_response_code(200); // OK
            echo json_encode($items);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(["message" => "No items found."]);
        }
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}


/**
 * Retrieves a single item by ID.
 *
 * @param PDO $pdo Database connection.
 * @param int $itemId Item ID.
 */
function getItem($pdo, $itemId) {
    $stmt = $pdo->prepare("SELECT id, name, description FROM items WHERE id = ?");
    try {
        $stmt->execute([$itemId]);
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            extract($row);
            $item = array(
                "id" => $id,
                "name" => $name,
                "description" => $description
            );
            http_response_code(200); // OK
            echo json_encode($item);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(["message" => "Item not found."]);
        }
    }  catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Creates a new item.
 *
 * @param PDO $pdo Database connection.
 */
function createItem($pdo) {
    // Get raw posted data
    $data = json_decode(file_get_contents("php://input"));

    // Validate data
    if (empty($data->name) || empty($data->description)) {
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Unable to create item. Data is incomplete."]);
        return;
    }

    $name = sanitizeInput($data->name);
    $description = sanitizeInput($data->description);

    // Prepare query
    $stmt = $pdo->prepare("INSERT INTO items (name, description) VALUES (?, ?)");

    // Execute query
    try {
        if ($stmt->execute([$name, $description])) {
            http_response_code(201); // Created
            echo json_encode(["message" => "Item created."]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Unable to create item."]);
        }
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Updates an existing item.
 *
 * @param PDO $pdo Database connection.
 * @param int $itemId Item ID.
 */
function updateItem($pdo, $itemId) {
    // Get raw posted data
    $data = json_decode(file_get_contents("php://input"));

     // Validate item ID
     if ($itemId === null || $itemId === false) {
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Invalid item ID."]);
        return;
    }

    // Validate data
    if (empty($data->name) || empty($data->description)) {
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Unable to update item. Data is incomplete."]);
        return;
    }

    $name = sanitizeInput($data->name);
    $description = sanitizeInput($data->description);

    // Prepare query
    $stmt = $pdo->prepare("UPDATE items SET name = ?, description = ? WHERE id = ?");

    // Execute query
    try {
        if ($stmt->execute([$name, $description, $itemId])) {
            http_response_code(200); // OK
            echo json_encode(["message" => "Item updated."]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Unable to update item."]);
        }
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Deletes an item.
 *
 * @param PDO $pdo Database connection.
 * @param int $itemId Item ID.
 */
function deleteItem($pdo, $itemId) {
    // Validate item ID
    if ($itemId === null || $itemId === false) {
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Invalid item ID."]);
        return;
    }

    // Prepare query
    $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");

    // Execute query
    try {
        if ($stmt->execute([$itemId])) {
            http_response_code(200); // OK
            echo json_encode(["message" => "Item deleted."]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Unable to delete item."]);
        }
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}
?>