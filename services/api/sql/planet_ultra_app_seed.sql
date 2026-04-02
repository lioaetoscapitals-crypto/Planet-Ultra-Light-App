INSERT INTO societies (id, name, city, country, created_at)
VALUES
  ('soc-001', 'Planet Housing Society', 'Pune', 'India', '2026-04-02T10:00:00.000Z');

INSERT INTO users (id, society_id, full_name, email, phone, role, status, created_at, updated_at)
VALUES
  ('usr-admin-001', 'soc-001', 'Planet Admin', 'admin@planet.app', '9999999999', 'Admin', 'Active', '2026-04-02T10:00:00.000Z', '2026-04-02T10:00:00.000Z'),
  ('usr-res-001', 'soc-001', 'Andrea Resident', 'andrea@planet.app', '9777777777', 'Resident', 'Active', '2026-04-02T10:00:00.000Z', '2026-04-02T10:00:00.000Z'),
  ('usr-res-002', 'soc-001', 'Karan Resident', 'karan@planet.app', '9666666666', 'Resident', 'Active', '2026-04-02T10:00:00.000Z', '2026-04-02T10:00:00.000Z'),
  ('usr-sec-001', 'soc-001', 'Security Desk', 'security@planet.app', '9888888888', 'Security', 'Active', '2026-04-02T10:00:00.000Z', '2026-04-02T10:00:00.000Z');

INSERT INTO apartments (id, society_id, tower, unit_number, floor, occupancy_status, created_at, updated_at)
VALUES
  ('apt-a-102', 'soc-001', 'A', '102', 1, 'Occupied', '2026-04-02T10:00:00.000Z', '2026-04-02T10:00:00.000Z'),
  ('apt-b-203', 'soc-001', 'B', '203', 2, 'Occupied', '2026-04-02T10:00:00.000Z', '2026-04-02T10:00:00.000Z');

INSERT INTO bookings (
  id, society_id, requester_user_id, apartment_id, event_type, space_type, visibility, message,
  booking_date, start_time, end_time, status, approved_by_user_id, created_at, updated_at
)
VALUES
  (
    'book-seed-001', 'soc-001', 'usr-res-001', 'apt-a-102', 'Meeting with Planet Smart City company',
    'Co-Work Space', 'Public', 'Resident activity request for workspace discussion',
    '2026-04-12', '18:46', '19:46', 'Rejected', 'usr-admin-001',
    '2026-04-02T10:00:00.000Z', '2026-04-02T10:30:00.000Z'
  ),
  (
    'book-seed-002', 'soc-001', 'usr-res-001', 'apt-a-102', 'Activity 12345',
    'Gym', 'Public', 'Morning yoga activity',
    '2026-04-13', '18:46', '19:46', 'Approved', 'usr-admin-001',
    '2026-04-02T11:00:00.000Z', '2026-04-02T11:15:00.000Z'
  ),
  (
    'book-seed-003', 'soc-001', 'usr-res-001', 'apt-a-102', 'Meeting with Planet Smart City company executive',
    'Community Hall', 'Private', 'Private meeting with committee',
    '2026-04-14', '18:46', '19:46', 'Pending', NULL,
    '2026-04-02T12:00:00.000Z', '2026-04-02T12:00:00.000Z'
  ),
  (
    'book-seed-004', 'soc-001', 'usr-res-002', 'apt-b-203', 'Activity 12345',
    'Court', 'Public', 'Dance class for residents',
    '2026-04-15', '18:46', '19:46', 'Approved', 'usr-admin-001',
    '2026-04-02T13:00:00.000Z', '2026-04-02T13:10:00.000Z'
  );
