-- ============================================
-- SQL Script to create test user in Neon DB
-- Run this in your Neon DB SQL Editor
-- ============================================

-- STEP 1: Clean up any existing test users
DELETE FROM session WHERE "userId" IN (SELECT id FROM "user" WHERE email IN ('test@socialhub.com', 'test@gmail.com'));
DELETE FROM account WHERE "userId" IN (SELECT id FROM "user" WHERE email IN ('test@socialhub.com', 'test@gmail.com'));
DELETE FROM "user" WHERE email IN ('test@socialhub.com', 'test@gmail.com');

-- STEP 2: Create test user
INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
VALUES (
    'test-user-socialhub',
    'Test User',
    'test@socialhub.com',
    true,
    null,
    NOW(),
    NOW()
);

-- STEP 3: Create account with password for test user
-- Password: TestPassword123!
-- Bcrypt hash generated with bcryptjs (rounds: 10)
INSERT INTO account (
    id, 
    "accountId", 
    "providerId", 
    "userId", 
    "accessToken", 
    "refreshToken", 
    "idToken", 
    "accessTokenExpiresAt", 
    "refreshTokenExpiresAt", 
    scope, 
    password, 
    "createdAt", 
    "updatedAt"
)
VALUES (
    'test-account-socialhub',
    'test@socialhub.com',
    'credential',
    'test-user-socialhub',
    null,
    null,
    null,
    null,
    null,
    null,
    '$2b$10$SkVi3opjX3kIn1vAnMcwTefhwvjKyn22J9tSIA8n',
    NOW(),
    NOW()
);

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the user was created:
-- ============================================
-- SELECT u.id, u.name, u.email, u."emailVerified", a.password 
-- FROM "user" u 
-- LEFT JOIN account a ON a."userId" = u.id 
-- WHERE u.email = 'test@socialhub.com';

-- ============================================
-- TEST USER LOGIN CREDENTIALS:
-- ============================================
-- Email: test@socialhub.com
-- Password: TestPassword123!
-- ============================================
