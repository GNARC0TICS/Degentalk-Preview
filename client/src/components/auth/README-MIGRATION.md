# Auth Component Migration

## DEPRECATED COMPONENTS - DO NOT USE

- `protected-route.tsx` → Use `ProtectedRoute.tsx` 
- `withRouteProtection.tsx` → Use `ProtectedRoute.tsx`
- `GlobalRouteGuard.tsx` → Use `RouteGuards.tsx`

## CANONICAL COMPONENTS

- **`ProtectedRoute.tsx`** - Main route protection component
- **`RouteGuards.tsx`** - Global route guard logic

## Migration Example

```tsx
// OLD - DEPRECATED
import { ProtectedRoute } from './protected-route'

// NEW - CANONICAL  
import { ProtectedRoute } from './ProtectedRoute'
```