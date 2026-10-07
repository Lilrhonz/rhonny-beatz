CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beat_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beat_id) REFERENCES beats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY one_review_per_user_per_beat (beat_id, user_id)
);