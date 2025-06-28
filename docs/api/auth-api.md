---
title: auth api
status: STABLE
updated: 2025-06-28
---

# Authentication API

> **Base Path:** `/api/auth`
>
> All authentication endpoints are available under the `/api/auth` namespace. The older root-level aliases (`/api/login`, `/api/register`, etc.) are still exposed for legacy clients but **will be removed in v2**. Update integrations as soon as possible.

## Endpoints

| Method | Path | Description |
| ------ | ------------------- | --------------------------------------------- |
| **GET** | `/user` | Get the currently authenticated user (session required). |
| **POST** | `/login` | Authenticate with username & password. Returns user object and sets session cookie. |
| **POST** | `/register` | Create a new account. |
| **POST** | `/logout` | Destroy the current session. |
| **GET** | `/verify-email` | Verify a user's email address (token query param). |
| **POST** | `/resend-verification` | Resend the verification email. |
| **GET** | `/dev-mode/set-role` *(dev only)* | Switch mock role while running locally. |

### Example – Login

```bash
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "username": "alice",
  "password": "hunter2"
}
```

Successful response sets a `session` cookie and returns:

```json
{
  "success": true,
  "data": {
    "id": 42,
    "username": "alice",
    "role": "user",
    "email": "alice@example.com"
  }
}
```

### Notes

* All endpoints use HTTP-only, secure session cookies in production.
* JWT support is planned but not yet committed.
* Rate-limited at **30 requests / minute** per IP.
* In development mode the backend may return mock users if `DEV_FORCE_AUTH` is not enabled.

---

_Last updated: 2025-06-26_ 