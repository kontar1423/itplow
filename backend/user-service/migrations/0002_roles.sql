UPDATE users
SET role = 'volunteer'
WHERE role = 'user';

UPDATE users
SET role = 'volunteer'
WHERE role NOT IN ('volunteer', 'scientist', 'admin');

ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'volunteer';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_allowed_values'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_role_allowed_values
    CHECK (role IN ('volunteer', 'scientist', 'admin'));
  END IF;
END $$;
