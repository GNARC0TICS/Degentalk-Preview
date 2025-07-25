# Forum API Inconsistencies Report

## Summary
This report documents API inconsistencies, naming confusion, and type mismatches found in the forum system between client and server implementations.

## 1. API Endpoint Mismatches

### Missing Server Endpoints
The client `forumApi.ts` expects these endpoints, but they don't exist on the server:

1. **Thread Management**
   - `PATCH /api/forum/threads/:threadId` - Client expects this for updating threads
   - `DELETE /api/forum/threads/:threadId` - Client expects this for deleting threads
   - `POST /api/forum/threads/:threadId/unsolve` - Client has unsolveThread() method
   
   **Server Reality**: 
   - Only has `PUT /api/forum/threads/:threadId/solve` for toggling solved status
   - Thread updates/deletion handled through admin API: `PUT /api/admin/forum/threads/:id/moderate`
   - Regular users cannot update/delete threads directly

2. **Thread Actions**
   - Server uses different patterns for thread actions:
     - Lock: `POST/DELETE /api/forum/threads/:threadId/lock`
     - Pin: `POST/DELETE /api/forum/threads/:threadId/pin`
     - Feature: `POST/DELETE /api/forum/threads/:threadId/feature`
   - Client's `updateThread()` method expects a single PATCH endpoint
   - These actions are admin/moderator only, but client doesn't reflect this

### Response Format Inconsistencies

1. **getPosts() Response Wrapping**
   ```typescript
   // Client expects and handles unwrapping:
   if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
     return (response as any).data;
   }
   ```
   This suggests server might be double-wrapping responses inconsistently.

2. **getThread() Response Format**
   ```typescript
   // Client has to handle two possible formats:
   // 1) { thread: {...}, posts?: [...] }
   // 2) Raw thread object
   ```

## 2. Zone/Category/Forum Naming Confusion

### Server Side Still Uses "Zone" Terminology
- `/api/forum/zone-stats` endpoint exists
- `getZoneStats()` method in structure controller
- Structure controller returns `{ zones: [], forums: [] }`
- Forum transformer still has `zone` fields
- Thread types reference `ZoneId` type

### Client Side Mixed Terminology
- Files renamed from Zone* to FeaturedForum* (e.g., `FeaturedForumCard.tsx`)
- But ForumStructureContext still uses `zones` array for top-level forums
- Comments like "// We need zones because that's where top-level forums are stored (unfortunately)"

## 3. Type Mismatches

### Thread Type Expectations
1. **Client expects `ThreadWithUser`** but server `Thread` type has:
   - `featuredForum` object instead of `zone`
   - Different user structure (`ThreadUser` vs inline user fields)

2. **Structure Types**
   - Client expects forums to have a `parentId` field to determine if it's a "zone"
   - Server filters by `parentId === null` to find zones
   - But types don't clearly distinguish between top-level forums and subforums

### Missing Type Definitions
- `ThreadWithPostsAndUser` interface exists in client but server controller manually constructs this shape
- No clear contract for what fields are included in different API responses

## 4. Remaining "Zone" References

### High Priority (User-Facing)
- `/api/forum/zone-stats` endpoint
- Zone-related error messages: "Zone not found"
- URL patterns still support zone slugs

### Code Organization
- `ZoneId` type still exists in shared types
- Zone fields in database schemas
- Zone-related services and methods

## 5. Permission & Authorization Issues

### Client Assumes More Permissions Than Server Provides
1. **Thread Management**
   - Client has methods for `updateThread()` and `deleteThread()` available to all users
   - Server restricts these to admin/moderator roles only
   - No client-side permission checks before showing edit/delete UI

2. **Missing Permission Context**
   - Thread response doesn't include user-specific permissions
   - Client can't determine if user can edit/delete/moderate
   - Leads to failed API calls for non-privileged users

## 6. Recommendations

### Immediate Fixes Needed

1. **Standardize Thread Update API**
   - Add missing PATCH and DELETE endpoints for threads
   - Or update client to use existing POST/DELETE pattern for actions

2. **Fix solve/unsolve inconsistency**
   - Either add separate `/unsolve` endpoint
   - Or make `/solve` endpoint toggle-based with proper documentation

3. **Standardize Response Formats**
   - Remove double-wrapping of responses
   - Document expected response shapes in types

### Medium-term Improvements

1. **Complete Zone → Featured Forum Migration**
   - Rename `/zone-stats` to `/featured-forum-stats`
   - Update all "zone" references in error messages
   - Update ForumStructureContext to use clearer naming

2. **Type Alignment**
   - Create shared API response types in `shared/types`
   - Ensure client and server use same type definitions
   - Add runtime validation for API responses

3. **API Documentation**
   - Document all endpoints with expected request/response formats
   - Add OpenAPI/Swagger spec for forum APIs
   - Include examples of each response type

### Long-term Refactoring

1. **Simplify Forum Hierarchy**
   - Clear distinction between forums and featured forums
   - Remove confusing "zones" intermediate concept
   - Use consistent terminology throughout

2. **API Versioning**
   - Consider versioned API endpoints for breaking changes
   - Maintain backwards compatibility during migration

## Conclusion

The forum system has significant inconsistencies between client expectations and server implementations. The incomplete migration from "zones" to "featured forums" has created confusion throughout the codebase. Priority should be given to fixing the missing endpoints and standardizing response formats to prevent runtime errors.