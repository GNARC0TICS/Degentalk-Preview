-- 0016_roles_uuid_to_int.sql
-- Full migration of roles primary key from UUID to INT, with data preservation.
-- Steps:
-- 1. Add new serial column role_id_int to roles
-- 2. Add mirror integer columns to users, user_roles, role_permissions
-- 3. Copy data by joining on old uuid
-- 4. Drop FK constraints, drop old uuid columns, rename new columns
-- 5. Recreate PK & FK constraints
-- ---------------------------------------------------------------
BEGIN;

-- 1. Add new serial column to roles
ALTER TABLE roles ADD COLUMN role_id_int SERIAL;

-- 2. Add mirror columns to FK tables
ALTER TABLE users ADD COLUMN primary_role_id_int INTEGER;
ALTER TABLE user_roles ADD COLUMN role_id_int INTEGER;
ALTER TABLE role_permissions ADD COLUMN role_id_int INTEGER;

-- 3. Copy data
UPDATE users u
SET primary_role_id_int = r.role_id_int
FROM roles r
WHERE u.primary_role_id = r.role_id;

UPDATE user_roles ur
SET role_id_int = r.role_id_int
FROM roles r
WHERE ur.role_id = r.role_id;

UPDATE role_permissions rp
SET role_id_int = r.role_id_int
FROM roles r
WHERE rp.role_id = r.role_id;

-- 4. Drop old constraints (will be recreated)
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_roles_role_id_fk;
ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_roles_role_id_fk;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_primary_role_id_roles_role_id_fk;
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_pkey;

-- 5. Remove old columns
ALTER TABLE users DROP COLUMN primary_role_id;
ALTER TABLE user_roles DROP COLUMN role_id;
ALTER TABLE role_permissions DROP COLUMN role_id;
ALTER TABLE roles DROP COLUMN role_id;

-- 6. Rename new columns to expected names
ALTER TABLE roles RENAME COLUMN role_id_int TO role_id;
ALTER TABLE users RENAME COLUMN primary_role_id_int TO primary_role_id;
ALTER TABLE user_roles RENAME COLUMN role_id_int TO role_id;
ALTER TABLE role_permissions RENAME COLUMN role_id_int TO role_id;

-- 7. Set NOT NULL where appropriate
ALTER TABLE roles ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE user_roles ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE role_permissions ALTER COLUMN role_id SET NOT NULL;

-- 8. Recreate PK & FKs
ALTER TABLE roles ADD PRIMARY KEY (role_id);
ALTER TABLE users ADD CONSTRAINT users_primary_role_id_roles_role_id_fk FOREIGN KEY (primary_role_id) REFERENCES roles(role_id) ON DELETE SET NULL;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_roles_role_id_fk FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_id_roles_role_id_fk FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;

-- 9. Recreate unique indexes dropped with pk (if any)
ALTER TABLE roles ADD CONSTRAINT roles_name_unique UNIQUE(name);
ALTER TABLE roles ADD CONSTRAINT roles_slug_unique UNIQUE(slug);

COMMIT; 