<?php
// db.php - Database connection with table creation and initial data

$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db   = getenv("db_name");
$charset = "utf8mb4";

// Data Source Name
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Connect to database
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Create events table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            event_datetime DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Insert sample events (only if table is empty)
    $stmt = $pdo->query("SELECT COUNT(*) FROM events");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO events (title, description, event_datetime) VALUES
            ('Orientation Day', 'Welcome session for new students.', '2025-06-01 09:00:00'),
            ('Tech Talk: AI Trends', 'Discussion about latest trends in Artificial Intelligence.', '2025-06-05 14:00:00'),
            ('Sports Day', 'Inter-departmental sports competitions.', '2025-06-10 08:30:00'),
            ('Career Fair', 'Meet with companies and explore job opportunities.', '2025-06-15 10:00:00'),
            ('Art Exhibition', 'Display of student artworks.', '2025-06-18 12:00:00'),
            ('Midterm Exams Begin', 'First day of midterm examinations.', '2025-06-22 08:00:00'),
            ('Hackathon', '24-hour coding competition.', '2025-06-25 10:00:00'),
            ('Blood Donation Drive', 'Organized by the college health club.', '2025-06-28 09:00:00'),
            ('Guest Lecture: Entrepreneurship', 'Talk by a successful startup founder.', '2025-07-01 13:30:00'),
            ('Music Night', 'Live performances by college bands.', '2025-07-03 18:00:00')
        ");
    }

    // Create comments table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            comment_id INT AUTO_INCREMENT PRIMARY KEY,
            comment TEXT NOT NULL,
            event_id INT NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        )
    ");

    // Insert sample comments (only if table is empty)
    $stmt = $pdo->query("SELECT COUNT(*) FROM comments");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO comments (comment, event_id) VALUES
            ('Looking forward to this!', 1),
            ('Very informative session. I learned a lot.', 2),
            ('Can’t wait to compete!', 3),
            ('Great opportunity to meet employers.', 4),
            ('Loved the creativity on display.', 5),
            ('Exams are stressful, but I’m ready.', 6),
            ('Team Alpha will win the hackathon!', 7),
            ('Proud to donate and help.', 8),
            ('Inspiring lecture by the guest speaker.', 9),
            ('Best night ever!', 10),
            ('I wish it lasted longer.', 10),
            ('Is there a replay of the talk?', 2),
            ('First time participating in a hackathon!', 7)
        ");
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'details' => $e->getMessage()
    ]);
    exit;
}
?>
