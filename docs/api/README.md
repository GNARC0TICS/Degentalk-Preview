---
title: README
status: STABLE
updated: 2025-06-28
---

# Degentalk API Documentation

This documentation covers all the API endpoints available in the Degentalk platform, organized by domain.

## Table of Contents

- [XP System API](./xp-api.md) - Experience points, levels, and action rewards
- [Shop API](./shop-api.md) - Digital goods marketplace and transactions
- [Forum API](./forum-api.md) - Threads, posts, users, and forum management
- [Admin API](./admin-api.md) - Administrative functions and modular system
- [Wallet API](./wallet-api.md) - DGT tokens, crypto deposits, transactions
- [Authentication API](./auth-api.md) - User authentication and session management

## Base URL

```
Development: http://localhost:5001/api
Production: https://degentalk.com/api
```

## Authentication

Most endpoints require authentication via session cookies or JWT tokens. Include the authentication header:

```bash
# Session-based (browser)
Cookie: session=your_session_id

# JWT-based (API clients)
Authorization: Bearer your_jwt_token
```

## Standard Response Format

All API responses follow this standard format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

## Error Handling

HTTP status codes follow REST conventions:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited based on user and endpoint:

- **General endpoints**: 100 requests/minute
- **XP award endpoints**: 20 requests/minute  
- **Admin endpoints**: 50 requests/minute
- **File upload endpoints**: 10 requests/minute

## Common Query Parameters

Many endpoints support these standard query parameters:

- `limit` - Number of items to return (default: 20, max: 100)
- `offset` - Number of items to skip for pagination
- `sort` - Sort field (varies by endpoint)
- `order` - Sort direction (`asc` or `desc`)
- `filter` - Filter criteria (varies by endpoint)

## Webhooks

Some endpoints support webhook notifications for real-time updates:

- **XP Level Up**: User reaches new level
- **Transaction Complete**: DGT transaction finalized
- **Thread Activity**: New posts, likes, replies
- **Admin Actions**: Moderation events

## Development Notes

### Local Development

```bash
# Start the API server
npm run dev:backend

# API available at:
http://localhost:5001/api
```

### Testing

```bash
# Run API tests
npm run test:api

# Validate XP system
npm run test:xp

# Test forum endpoints
npm run test:forum-endpoints
```

### Database Migrations

```bash
# Apply migrations
npm run db:migrate:Apply

# View database in GUI
npm run db:studio
```

## Security

- All user inputs are validated and sanitized
- SQL injection prevention via parameterized queries
- Rate limiting on all endpoints
- CORS configured for production domains
- Helmet.js security headers
- Content Security Policy enforced

## Support

For API questions or issues:

1. Check the specific API documentation for your domain
2. Review the [troubleshooting guide](../troubleshooting.md)
3. Check server logs for detailed error messages
4. Open an issue in the project repository