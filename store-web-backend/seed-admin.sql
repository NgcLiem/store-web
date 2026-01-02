-- Create admin user with password 'admin123'
-- Password hash: bcrypt hash của 'admin123' = $2b$10$VRCzW0m/FepAK2rGGWWs5OQaZgxg8F2VLqG5vW7nQj.JxVgCxQwha

INSERT INTO users (email, password, full_name, role, sex, status, created_at, updated_at) 
VALUES (
  'admin@example.com',
  '$2b$10$VRCzW0m/FepAK2rGGWWs5OQaZgxg8F2VLqG5vW7nQj.JxVgCxQwha',
  'Admin User',
  'admin',
  'male',
  'active',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = '$2b$10$VRCzW0m/FepAK2rGGWWs5OQaZgxg8F2VLqG5vW7nQj.JxVgCxQwha',
  role = 'admin',
  status = 'active';

-- Create another admin user
INSERT INTO users (email, password, full_name, role, sex, status, created_at, updated_at) 
VALUES (
  'admin@test.com',
  '$2b$10$VRCzW0m/FepAK2rGGWWs5OQaZgxg8F2VLqG5vW7nQj.JxVgCxQwha',
  'Test Admin',
  'admin',
  'male',
  'active',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = '$2b$10$VRCzW0m/FepAK2rGGWWs5OQaZgxg8F2VLqG5vW7nQj.JxVgCxQwha',
  role = 'admin',
  status = 'active';
