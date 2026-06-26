-- Enterprise Security Upgrade Migrations

-- 1. Create trusted_devices table
CREATE TABLE IF NOT EXISTS trusted_devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    user_role VARCHAR(20) DEFAULT 'customer',
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    timezone VARCHAR(100),
    language VARCHAR(50),
    screen_resolution VARCHAR(50),
    ip VARCHAR(50),
    country VARCHAR(50),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trusted BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, user_role, device_id)
);

-- Index for device verification speed
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_device ON trusted_devices(user_id, user_role, device_id);

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_role VARCHAR(20) DEFAULT 'customer',
    refresh_token_hash TEXT NOT NULL,
    device_id VARCHAR(255),
    browser VARCHAR(100),
    ip VARCHAR(50),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for session verification and revocation speed
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, user_role);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

-- 3. Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
    event_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_role VARCHAR(20),
    event_type VARCHAR(100) NOT NULL,
    risk_score INTEGER DEFAULT 0,
    ip VARCHAR(50),
    country VARCHAR(50),
    city VARCHAR(50),
    device TEXT,
    browser TEXT,
    status VARCHAR(50),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for security event aggregation and reporting
CREATE INDEX IF NOT EXISTS idx_security_events_type_time ON security_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_user_time ON security_events(user_id, user_role, timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip);
CREATE INDEX IF NOT EXISTS idx_security_events_time ON security_events(timestamp);
