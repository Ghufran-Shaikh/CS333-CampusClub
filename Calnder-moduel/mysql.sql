-- Database schema for event calendar
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO events (title, description, start_time, end_time) VALUES
('Math Club Meetup', 'Join us for a session on problem solving', '2025-05-15 14:00:00', '2025-05-15 16:00:00'),
('AI Workshop', 'Beginner-friendly workshop on AI', '2025-05-18 10:00:00', '2025-05-18 12:00:00'),
('Graduation Ceremony', 'Celebrate the class of 2025!', '2025-05-25 09:00:00', '2025-05-25 12:00:00');