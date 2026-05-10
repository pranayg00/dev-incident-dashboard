CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')),
  ai_analysis TEXT,
  ai_root_cause TEXT,
  ai_fix_suggestion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('UP', 'DOWN', 'DEGRADED')),
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Seed demo services
INSERT INTO services (name, url, description, is_demo) VALUES
  ('Payment API', 'https://httpstat.us/200', 'Handles payment processing', true),
  ('Auth Service', 'https://httpstat.us/200', 'User authentication service', true),
  ('Product API', 'https://httpstat.us/200', 'Product catalog service', true),
  ('Notification Service', 'https://httpstat.us/200', 'Email and push notifications', true)
ON CONFLICT DO NOTHING;