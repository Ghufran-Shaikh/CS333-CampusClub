<?php
// Database configuration
 $host = "127.0.0.1";
 $user = getenv("db_user");
 $pass = getenv("db_pass");
 $db   = getenv("db_name");
 $charset = "utf8mb4";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e){
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    die(); // Stop further execution
}
?>