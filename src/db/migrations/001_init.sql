CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bpm INT,
  key_signature VARCHAR(10),
  description TEXT,
  cover_art_path VARCHAR(500),
  preview_path VARCHAR(500),
  status ENUM('draft', 'published', 'sold_exclusive') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beat_tags (
  beat_id INT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (beat_id, tag),
  FOREIGN KEY (beat_id) REFERENCES beats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS beat_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beat_id INT NOT NULL,
  file_type ENUM('mp3', 'wav', 'stems') NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_size INT,
  FOREIGN KEY (beat_id) REFERENCES beats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS license_tiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  terms_template TEXT,
  is_exclusive BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS beat_prices (
  beat_id INT NOT NULL,
  tier_id INT NOT NULL,
  price_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GHS',
  PRIMARY KEY (beat_id, tier_id),
  FOREIGN KEY (beat_id) REFERENCES beats(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_id) REFERENCES license_tiers(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  provider ENUM('paystack', 'stripe') NOT NULL,
  provider_ref VARCHAR(255),
  amount_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  beat_id INT NOT NULL,
  tier_id INT NOT NULL,
  price_cents INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (beat_id) REFERENCES beats(id),
  FOREIGN KEY (tier_id) REFERENCES license_tiers(id)
);

CREATE TABLE IF NOT EXISTS licenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  licensee_name VARCHAR(255) NOT NULL,
  pdf_path VARCHAR(500),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  license_code VARCHAR(50) UNIQUE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS download_grants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  downloads_used INT NOT NULL DEFAULT 0,
  max_downloads INT NOT NULL DEFAULT 3,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beat_id INT NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_hash VARCHAR(64),
  FOREIGN KEY (beat_id) REFERENCES beats(id) ON DELETE CASCADE
);

INSERT INTO license_tiers (name, description, is_exclusive) VALUES
  ('MP3 Lease', 'Non-exclusive lease, MP3 file only, limited streams', FALSE),
  ('WAV Lease', 'Non-exclusive lease, WAV file, higher usage limits', FALSE),
  ('Trackout', 'Non-exclusive lease, includes stems for mixing', FALSE),
  ('Exclusive', 'Full exclusive rights, beat removed from sale after purchase', TRUE);