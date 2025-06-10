# Example: /api/admin/users Query (Paginated, Zod-validated)

## Request

```
GET /api/admin/users?page=2&pageSize=3&search=alice
```

## Response

```
{
  "data": [
    {
      "id": 12,
      "username": "alice42",
      "email": "alice42@example.com",
      "role": "user",
      "status": "active",
      "posts": 17,
      "threads": 2,
      "createdAt": "4/28/2025",
      "bio": "I love DegenTalk!",
      "avatarUrl": "https://cdn.degentalk.com/avatars/alice42.png",
      "profileBannerUrl": null,
      "groupId": 2,
      "groupName": "VIP",
      "isVerified": true
    },
    {
      "id": 13,
      "username": "alice_dev",
      "email": "alice_dev@example.com",
      "role": "banned",
      "status": "banned",
      "posts": 0,
      "threads": 0,
      "createdAt": "4/29/2025",
      "bio": null,
      "avatarUrl": null,
      "profileBannerUrl": null,
      "groupId": null,
      "groupName": null,
      "isVerified": false
    },
    {
      "id": 14,
      "username": "alice_test",
      "email": "alice_test@example.com",
      "role": "user",
      "status": "inactive",
      "posts": 1,
      "threads": 0,
      "createdAt": "4/30/2025",
      "bio": null,
      "avatarUrl": null,
      "profileBannerUrl": null,
      "groupId": null,
      "groupName": null,
      "isVerified": false
    }
  ],
  "total": 7,
  "page": 2,
  "pageSize": 3
}
```

## Error Example (Invalid Query)

```
GET /api/admin/users?page=0&pageSize=200
```

```
{
  "error": "Invalid query params",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "Number must be greater than or equal to 1",
      "path": ["page"]
    },
    {
      "code": "too_big",
      "maximum": 100,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "Number must be less than or equal to 100",
      "path": ["pageSize"]
    }
  ]
}
```
