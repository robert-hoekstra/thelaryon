INSERT INTO "users" ("id", "email", "name")
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'demo@thelaryon.com',
  'Thelaryon Collector'
)
ON CONFLICT ("id") DO NOTHING;
