BEGIN;

TRUNCATE
  reisearch_users
  RESTART IDENTITY CASCADE;

INSERT INTO reisearch_users (user_name, first_name, last_name, password)
VALUES
  ('BradR', 'Brad', 'Wilson', '$2a$04$wR8bUTCAYo5CjADgnyFACO8WUasIc/QYWPVxTId7M51vHX24CF.5y');

COMMIT;