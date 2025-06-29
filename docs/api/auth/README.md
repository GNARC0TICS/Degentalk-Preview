# Authentication API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | JWT | JSON Web Token |
| 🔓 | public | | sess | session |
| 🔒 | auth required | | dev | development |

## Overview

Authentication system w/ Passport.js, session management & role-based access control.

**Base Path:** `/api/auth`

## Endpoints

### User Registration
```http
POST /api/auth/register
```

**Body:**
```json
{
  "username": "cryptoking",
  "email": "king@crypto.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "cryptoking",
    "email": "king@crypto.com",
    "emailVerified": false,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Validation Rules:**
- Username: 3-20 chars, alphanumeric + underscore
- Email: Valid email format
- Password: 8+ chars, uppercase, lowercase, number, special char

### User Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "username": "cryptoking",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "cryptoking",
      "email": "king@crypto.com",
      "roles": ["user"],
      "level": 15,
      "dgtBalance": 1500.50
    },
    "session": {
      "id": "sess_abc123",
      "expiresAt": "2025-01-08T00:00:00Z"
    }
  }
}
```

**Sets Session Cookie:** `connect.sid`

### Get Current User
```http
GET /api/auth/user
```

**Headers:** `Cookie: connect.sid=<session>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "cryptoking",
    "email": "king@crypto.com",
    "roles": ["user"],
    "level": 15,
    "xp": 8750,
    "dgtBalance": 1500.50,
    "reputation": 42,
    "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
    "profileData": {
      "bio": "Crypto enthusiast since 2017",
      "location": "Moon",
      "website": "https://cryptoking.io"
    },
    "stats": {
      "totalPosts": 156,
      "totalThreads": 23,
      "totalLikes": 89
    }
  }
}
```

**401 Response:**
```json
{
  "error": "Authentication required"
}
```

### User Logout
```http
POST /api/auth/logout
```

**Headers:** `Cookie: connect.sid=<session>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Clears Session Cookie**

### Email Verification
```http
GET /api/auth/verify-email?token=<verification-token>
```

**Query Params:**
- `token` - Email verification token

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Verification Email
```http
POST /api/auth/resend-verification
```

**Body:**
```json
{
  "email": "king@crypto.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

### Password Reset Request
```http
POST /api/auth/forgot-password
```

**Body:**
```json
{
  "email": "king@crypto.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset link sent to email"
}
```

### Password Reset
```http
POST /api/auth/reset-password
```

**Body:**
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Development Endpoints 🛠️

### Role Switching (Dev Only)
```http
GET /api/auth/dev-mode/set-role?role=admin&userId=1
```

**Query Params:**
- `role` - Target role: `user`, `moderator`, `admin`
- `userId` - User ID to modify

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "oldRole": "user",
    "newRole": "admin"
  }
}
```

**Environment:** `NODE_ENV=development` only

## Authentication Middleware

### Session-Based (Primary)
```javascript
// Frontend - automatic cookie handling
fetch('/api/auth/user', {
  credentials: 'include'
});
```

### JWT Token (API Access)
```javascript
// API client
fetch('/api/auth/user', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
});
```

### Role Requirements

| Role | Permissions |
|------|-------------|
| `user` | Basic forum access |
| `moderator` | Thread moderation, user warnings |
| `admin` | Full system access, user management |

## Security Features

### Password Requirements
- **Length:** 8+ characters
- **Complexity:** Uppercase, lowercase, number, special char
- **Validation:** Zod schema w/ custom rules

### Session Security
- **HttpOnly cookies** prevent XSS
- **Secure flag** in production
- **SameSite=strict** CSRF protection
- **Session rotation** on login

### Rate Limiting
- **Login attempts:** 5 per 15 minutes per IP
- **Registration:** 3 per hour per IP
- **Password reset:** 3 per hour per email

### Development Security
```env
# env.local - Force real authentication
DEV_FORCE_AUTH=true          # Disables auto-login
DEV_BYPASS_PASSWORD=false    # Enforces password validation
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_001` | Invalid credentials | Username/password incorrect |
| `AUTH_002` | Account not verified | Email verification required |
| `AUTH_003` | Account suspended | Account temporarily disabled |
| `AUTH_004` | Session expired | Login session has expired |
| `AUTH_005` | Rate limit exceeded | Too many auth attempts |
| `AUTH_006` | Password too weak | Password doesn't meet requirements |
| `AUTH_007` | Username taken | Username already registered |
| `AUTH_008` | Email already registered | Email already in use |

## Integration Examples

### React Hook
```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }
  
  return (
    <div>
      Welcome, {user.username}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Express Middleware
```typescript
import { isAuthenticated, isAdmin } from '@/middleware/auth';

// Protect route
router.get('/profile', isAuthenticated, getUserProfile);

// Admin only
router.delete('/users/:id', isAdmin, deleteUser);
```

### Frontend Auth Check
```typescript
// Check auth status
const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    return null;
  }
};
```

## Session Management

### Session Storage
- **Store:** PostgreSQL w/ connect-pg-simple
- **Expiry:** 7 days default
- **Cleanup:** Automated expired session removal

### Session Data
```json
{
  "userId": 123,
  "username": "cryptoking",
  "roles": ["user"],
  "loginTime": "2025-01-01T00:00:00Z",
  "lastActivity": "2025-01-01T12:30:00Z"
}
```

### Logout Behavior
- **Server:** Destroys session in database
- **Client:** Clears session cookie
- **Frontend:** Redirects to login page

---

**📚 Documentation:** `/docs/api/auth/README.md`

**Related:**
- [User Management API](../admin/users.md)
- [Role Management](../admin/roles.md)
- [Security Configuration](../admin/security.md)