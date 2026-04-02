PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS societies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Security', 'Resident')),
  status TEXT NOT NULL CHECK (status IN ('Invited', 'Active', 'Suspended', 'Deactivated')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS apartments (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  tower TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  floor INTEGER NOT NULL,
  occupancy_status TEXT NOT NULL CHECK (occupancy_status IN ('Occupied', 'Vacant', 'Maintenance', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  UNIQUE (society_id, tower, unit_number)
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  requester_user_id TEXT NOT NULL,
  apartment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  space_type TEXT NOT NULL CHECK (space_type IN ('Community Hall', 'Co-Work Space', 'Gym', 'Pool', 'Court')),
  visibility TEXT NOT NULL CHECK (visibility IN ('Public', 'Private')),
  message TEXT,
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Pending', 'Approved', 'Rejected', 'Confirmed', 'Completed', 'Cancelled', 'NoShow')),
  approved_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  host_user_id TEXT NOT NULL,
  apartment_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Pending', 'Approved', 'Rejected', 'Used', 'Expired', 'Cancelled')),
  approved_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gate_logs (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  invitation_id TEXT,
  apartment_id TEXT NOT NULL,
  resident_user_id TEXT,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  entry_status TEXT NOT NULL CHECK (entry_status IN ('Pending', 'Approved', 'Rejected', 'Entered', 'Exited')),
  security_user_id TEXT,
  approved_by_user_id TEXT,
  entry_at TEXT,
  exit_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('AllResidents', 'Tower', 'Custom')),
  tower_scope TEXT,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Scheduled', 'Published', 'Expired', 'Archived')),
  publish_at TEXT,
  author_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS market_items (
  id TEXT PRIMARY KEY,
  society_id TEXT NOT NULL,
  seller_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'PendingApproval', 'Approved', 'Rejected', 'Active', 'Inactive', 'Archived')),
  approved_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_society_status ON bookings (society_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_requester ON bookings (requester_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apartments_society_tower_unit ON apartments (society_id, tower, unit_number);
CREATE INDEX IF NOT EXISTS idx_gate_logs_society_status ON gate_logs (society_id, entry_status);
