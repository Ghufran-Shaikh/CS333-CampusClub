<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require '../index.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
  case 'GET':
    
    $stmt = $pdo->query("SELECT * FROM activities ORDER BY date ASC");
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    
    echo json_encode($activities);
    break;

  case 'POST':
   
    if (!isset($input['club'], $input['title'], $input['date'], $input['time'], $input['location'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Missing required fields']);
      exit;
    }

    
    $stmt = $pdo->prepare("INSERT INTO activities (club, title, date, time, location, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
      $input['club'],
      $input['title'],
      $input['date'],
      $input['time'],
      $input['location'],
      $input['description'] ?? null]);
    
    echo json_encode(['message' => 'Activity created successfully']);
    break;

  case 'PUT':
  
    if (!isset($input['id'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Missing activity ID']);
      exit;
    }

  
    $stmt = $pdo->prepare("UPDATE activities SET club=?, title=?, date=?, time=?, location=?, description=? WHERE id=?");
    $stmt->execute([
      $input['club'],
      $input['title'],
      $input['date'],
      $input['time'],
      $input['location'],
      $input['description'] ?? null,
      $input['id']
    ]);
    
    echo json_encode(['message' => 'Activity updated successfully']);
    break;

  case 'DELETE':
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing activity ID']);
    exit;
  }

  $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
  $stmt->execute([$data['id']]);
  
  echo json_encode(['message' => 'Activity deleted successfully']);
  break;

}




?>