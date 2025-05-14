<?php
require 'config/database.php';
$db = (new Database())->getConnection();
echo json_encode(['message' => 'Connected successfully to mydb database']);
?>