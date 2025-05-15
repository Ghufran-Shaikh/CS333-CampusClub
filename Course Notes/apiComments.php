<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection details
$host = "localhost";
$username = "Maymoona";
$password = "maymoona34";
$database = "mydb";

$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(array("error" => "Connection failed: " . $conn->connect_error)));
}

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle fetching courses for the dropdown
    if (isset($_GET['action']) && $_GET['action'] === 'get_courses') {
        if (!isset($_GET['college_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "college_id parameter is required"]);
            exit();
        }

        $collegeId = (int)$_GET['college_id'];
        $sql = "SELECT id, title FROM courses WHERE college_id = $collegeId";
        $result = $conn->query($sql);
        $courses = array();
        while ($row = $result->fetch_assoc()) {
            $courses[] = $row;
        }
        echo json_encode($courses);
        exit();
    }

    // Handle fetching comments (existing logic)
    $collegeId = isset($_GET['college_id']) ? intval($_GET['college_id']) : 0;
    $courseId = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

    if ($collegeId > 0) {
        // Get all comments for a college
        $sql = "SELECT comments.*, courses.title AS course_title
                FROM comments
                JOIN courses ON comments.course_id = courses.id
                JOIN colleges ON courses.college_id = colleges.id
                WHERE colleges.id = $collegeId";
    } elseif ($courseId > 0) {
        // Get comments for a specific course
        $sql = "SELECT comments.*, courses.title AS course_title
                FROM comments
                JOIN courses ON comments.course_id = courses.id
                WHERE comments.course_id = $courseId";
    } else {
        echo json_encode(array("error" => "Either college_id or course_id must be provided"));
        exit();
    }

    $result = $conn->query($sql);
    $comments = array();
    while ($row = $result->fetch_assoc()) {
        $comments[] = $row;
    }
    echo json_encode($comments);
}

// Handle POST requests to add a new comment
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (isset($input['user_name'], $input['course_id'], $input['comment'])) {
        $userName = $conn->real_escape_string($input['user_name']);
        $courseId = intval($input['course_id']);
        $comment = $conn->real_escape_string($input['comment']);

        $sql = "INSERT INTO comments (user_name, course_id, comment) VALUES ('$userName', '$courseId', '$comment')";
        if ($conn->query($sql) === TRUE) {
            $lastId = $conn->insert_id;
            // Fetch the newly inserted comment with the course title
            $selectSql = "SELECT c.*, co.title AS course_title FROM comments c JOIN courses co ON c.course_id = co.id WHERE c.id = $lastId";
            $result = $conn->query($selectSql);
            if ($result && $row = $result->fetch_assoc()) {
                echo json_encode(array("message" => "Comment added successfully.", "comment" => $row));
            } else {
                echo json_encode(array("message" => "Comment added successfully.", "id" => $lastId));
            }
        } else {
            echo json_encode(array("error" => "Error: " . $conn->error));
        }
    } else {
        echo json_encode(array("error" => "Invalid input. Missing user_name, course_id, or comment."));
    }
}

// Handle DELETE requests to delete a comment
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $commentId = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($commentId > 0) {
        $sql = "DELETE FROM comments WHERE id = $commentId";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(array("message" => "Comment deleted successfully."));
        } else {
            echo json_encode(array("error" => "Error deleting comment: " . $conn->error));
        }
    } else {
        echo json_encode(array("error" => "Invalid comment ID."));
    }
}

// Handle PUT requests to update a comment
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents("php://input"), true);
    $commentId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($commentId > 0 && isset($input['comment'], $input['user_name'], $input['course_id'])) {
        $newComment = $conn->real_escape_string($input['comment']);
        $newUserName = $conn->real_escape_string($input['user_name']);
        $newCourseId = intval($input['course_id']);

        $sql = "UPDATE comments SET user_name='$newUserName', course_id='$newCourseId', comment='$newComment' WHERE id=$commentId";
        if ($conn->query($sql) === TRUE) {
            // Fetch the updated comment with the course title
            $selectSql = "SELECT c.*, co.title AS course_title FROM comments c JOIN courses co ON c.course_id = co.id WHERE c.id = $commentId";
            $result = $conn->query($selectSql);
            if ($result && $row = $result->fetch_assoc()) {
                echo json_encode(array("message" => "Comment updated.", "comment" => $row));
            } else {
                echo json_encode(array("message" => "Comment updated."));
            }
        } else {
            echo json_encode(array("error" => "Update failed: " . $conn->error));
        }
    } else {
        echo json_encode(array("error" => "Invalid data for update. Missing comment, user_name, or course_id."));
    }
}

$conn->close();
?>     