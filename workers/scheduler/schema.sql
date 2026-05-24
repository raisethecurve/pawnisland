CREATE TABLE IF NOT EXISTS holds (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    start_utc TEXT NOT NULL,
    end_utc TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_holds_window
ON holds (expires_at, start_utc, end_utc);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    calendar_event_id TEXT,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    event_type TEXT NOT NULL,
    start_utc TEXT NOT NULL,
    end_utc TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    player_name TEXT,
    rating TEXT,
    goals TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_window
ON bookings (status, start_utc, end_utc);
