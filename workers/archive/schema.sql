-- The owner is fixed in the Worker's OWNER_EMAIL binding, outside the editable list.
CREATE TABLE IF NOT EXISTS archive_viewers (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  added_at TEXT NOT NULL,
  added_by TEXT NOT NULL,
  CHECK (email = lower(trim(email)))
);

CREATE TABLE IF NOT EXISTS archive_access_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email TEXT NOT NULL,
  target_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('added', 'removed')),
  occurred_at TEXT NOT NULL
);
