INSERT INTO "Space" ("id", "name", "description", "capacity", "isActive", "createdAt", "updatedAt")
VALUES
  ('00000000-0000-4000-8000-000000000001', 'Quiet study room', 'A calm room for focused individual work.', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000002', 'Collaboration room', 'A shared room for group study and project work.', 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000003', 'Community table', 'An open table for casual study and reading.', 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
