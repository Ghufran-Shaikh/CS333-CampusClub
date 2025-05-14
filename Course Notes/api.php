<?php
// Add at the top of the file
$uploadDir = __DIR__ . '/uploads/';

// Ensure upload directory exists
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// DB config
$host = "localhost";
$dbname = "mydb";
$username = "Maymoona";
$password = "maymoona34";

// Connect with PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// ---------- GET ----------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['college']) && !isset($_GET['courseId']) && !isset($_GET['colleges'])) {
        $stmt = $pdo->query("SELECT id, name, icon, color FROM colleges");
        $colleges = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($colleges);
    }

    if (isset($_GET['colleges'])) {
        $collegeId = intval($_GET['colleges']);
        $stmt = $pdo->prepare("SELECT id, title, code FROM courses WHERE college_id = ?");
        $stmt->execute([$collegeId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    if (isset($_GET['college'])) {
        $collegeId = intval($_GET['college']);
        $stmt = $pdo->prepare("
            SELECT
                notes.id,
                notes.course_id,
                notes.title,
                notes.content,
                notes.path,
                courses.title AS course_title,
                colleges.name AS college_name
            FROM notes
            JOIN courses ON notes.course_id = courses.id
            JOIN colleges ON courses.college_id = colleges.id
            WHERE colleges.id = ?
        ");
        $stmt->execute([$collegeId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// ---------- POST (Add New Note) ----------
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['course_title'], $input['title'], $input['content'], $input['path'])) {
        // Retrieve the course ID based on the course title
        $stmtCourse = $pdo->prepare("SELECT id FROM courses WHERE title = :course_title");
        $stmtCourse->execute([':course_title' => $input['course_title']]);
        $course = $stmtCourse->fetch(PDO::FETCH_ASSOC);

        if ($course) {
            $course_id = $course['id'];

            // Prepare to insert the note
            $stmt = $pdo->prepare("
                INSERT INTO notes (course_id, title, content, path)
                VALUES (:course_id, :title, :content, :path)
            ");

            try {
                $stmt->execute([
                    ':course_id' => intval($course_id),
                    ':title' => $input['title'], // Note title
                    ':content' => $input['content'],
                    ':path' => $input['path'] // Now required
                ]);

                echo json_encode([
                    "message" => "Note created successfully.",
                    "id" => $pdo->lastInsertId()
                ]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "Failed to insert note: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["error" => "Course not found."]);
        }
    } else {
        echo json_encode(["error" => "Missing required fields."]);
    }
}

// ---------- PUT (Update Existing Note) ----------
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        header("Content-Type: application/json");

        $input = json_decode(file_get_contents("php://input"), true);

        // Validate input
        if (!isset($input['course_title'], $input['title'], $input['content'], $input['path'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // 1. Get course ID
            $courseStmt = $pdo->prepare("SELECT id FROM courses WHERE title = :course_title LIMIT 1");
            $courseStmt->execute([':course_title' => $input['course_title']]);
            $course = $courseStmt->fetch(PDO::FETCH_ASSOC);

            if (!$course) {
                http_response_code(404);
                echo json_encode(["error" => "Course not found"]);
                exit;
            }

            // 2. Update note by course_id + title
            $updateStmt = $pdo->prepare("
                UPDATE notes 
                SET content = :content,
                    path = :path,
                    created_at = NOW()
                WHERE course_id = :course_id 
                AND title = :title
            ");

            $updateStmt->execute([
                ':content' => $input['content'],
                ':path' => $input['path'],
                ':course_id' => $course['id'],
                ':title' => $input['title']
            ]);

            if ($updateStmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["error" => "Note not found in this course"]);
                $pdo->rollBack();
                exit;
            }

            $pdo->commit();
            echo json_encode(["message" => "Note updated successfully"]);

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
// ---------- DELETE ----------
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $noteId = intval(basename($_SERVER['REQUEST_URI']));

    if ($noteId > 0) {
        $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ?");
        $stmt->execute([$noteId]);

        
        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Note deleted successfully."]);
        } else {
            echo json_encode(["error" => "Note not found."]);
        }
    } else {
        echo json_encode(["error" => "Invalid note ID."]);
    }
}
?>
