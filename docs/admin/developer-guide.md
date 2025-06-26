# Developer Guide - Admin Modular System

## 🎯 Overview

This guide covers technical implementation details for developers working with the Degentalk modular admin system.

## 🏗️ Architecture

### Core Components

```
shared/
├── config/
│   └── admin.config.ts          # Module definitions and permissions
└── lib/
    └── admin-module-registry.ts # Module management and registration

client/src/
├── hooks/
│   └── use-admin-modules.ts     # React hooks for module integration
├── components/admin/
│   └── protected-admin-route.tsx # Security wrapper component
└── pages/admin/
    └── [module-pages].tsx      # Individual admin modules
```

### Data Flow

```
Module Registration → Permission Check → Component Render → Settings Application
       ↓                    ↓               ↓                    ↓
AdminModuleRegistry  → useAdminModule → ProtectedAdminRoute → Module Content
```

## 📝 Module Definition

### Basic Module Structure

```typescript
interface AdminModule {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description?: string;          // Optional description
  icon: string;                  // Lucide icon name
  route: string;                 // Router path
  component: LazyComponent;      // React component
  permissions: string[];         // Required permissions
  enabled: boolean;              // Enable/disable flag
  order: number;                 // Navigation order
  settings?: ModuleSettings;     // Module-specific config
  subModules?: AdminModule[];    // Nested modules
}
```

### Permission Mapping

```typescript
// Define permissions in admin.config.ts
export const ADMIN_PERMISSIONS = {
  'admin.users.view': 'View users',
  'admin.users.manage': 'Manage users',
  'admin.users.delete': 'Delete users',
  'admin.xp.view': 'View XP configuration',
  'admin.xp.manage': 'Manage XP levels',
  // ... more permissions
} as const;

// Map to user roles
export const adminConfig = {
  defaultPermissions: {
    superAdmin: Object.keys(ADMIN_PERMISSIONS) as AdminPermission[],
    admin: [
      'admin.users.view',
      'admin.users.manage',
      'admin.xp.view',
      'admin.xp.manage',
      // ... admin permissions
    ] as AdminPermission[],
    moderator: [
      'admin.users.view',
      'admin.forum.moderate',
      'admin.reports.view',
      // ... moderator permissions
    ] as AdminPermission[],
  }
};
```

## 🔧 Module Development

### 1. Create Module Configuration

```typescript
// In shared/config/admin.config.ts
{
  id: 'my-feature',
  name: 'My Feature',
  description: 'Custom feature for platform management',
  icon: 'Star',
  route: '/admin/my-feature',
  component: lazy(() => import('@/pages/admin/my-feature')),
  permissions: ['admin.myfeature.view', 'admin.myfeature.manage'],
  enabled: true,
  order: 50,
  settings: {
    enableAdvancedMode: false,
    maxItems: 100,
    refreshInterval: 30000
  }
}
```

### 2. Implement Protected Component

```typescript
// pages/admin/my-feature.tsx
import React from 'react';
import ProtectedAdminRoute from '@/components/admin/protected-admin-route';
import { useAdminModule } from '@/hooks/use-admin-modules';
import { Card, CardContent } from '@/components/ui/card';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';

// Module content component
function MyFeatureModuleContent() {
  const { module, isEnabled, hasPermission } = useAdminModule('my-feature');
  
  // Apply module settings
  const enableAdvancedMode = module?.settings?.enableAdvancedMode || false;
  const maxItems = module?.settings?.maxItems || 50;
  
  // Module disabled state
  if (!isEnabled) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">My Feature Module Disabled</h3>
            <p className="text-muted-foreground">
              The My Feature module has been disabled by an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminPageShell 
      title={module?.name || "My Feature"}
      pageActions={
        <div className="flex gap-2">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
          {enableAdvancedMode && (
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Your module content */}
        <FeatureList maxItems={maxItems} />
        {enableAdvancedMode && <AdvancedFeatures />}
      </div>
    </AdminPageShell>
  );
}

// Main exported component with protection
export default function MyFeaturePage() {
  return (
    <ProtectedAdminRoute moduleId="my-feature">
      <MyFeatureModuleContent />
    </ProtectedAdminRoute>
  );
}
```

### 3. Register Module Runtime

```typescript
// For dynamic registration
import { adminModuleRegistry } from '@/../../shared/lib/admin-module-registry';

// Register new module
adminModuleRegistry.register({
  id: 'dynamic-feature',
  name: 'Dynamic Feature',
  icon: 'Zap',
  route: '/admin/dynamic-feature',
  component: lazy(() => import('./dynamic-feature')),
  permissions: ['admin.dynamic.view'],
  enabled: true,
  order: 60
});

// Update existing module settings
adminModuleRegistry.updateModuleSettings('my-feature', {
  enableAdvancedMode: true,
  maxItems: 200
});

// Enable/disable module
adminModuleRegistry.setModuleEnabled('my-feature', false);
```

## 🔐 Security Implementation

### Permission Checking

```typescript
// Component-level permission check
function SecureComponent() {
  const { hasPermission } = useAdminPermission('my-feature');
  
  if (!hasPermission) {
    return <AccessDenied />;
  }
  
  return <ProtectedContent />;
}

// Hook-based permission checking
function useFeatureAccess() {
  const { hasPermission } = useAdminModules();
  
  return {
    canView: hasPermission('my-feature'),
    canManage: hasPermission('advanced-feature'),
    canDelete: hasPermission('dangerous-feature')
  };
}
```

### Backend Integration

```typescript
// Backend permission validation (example)
app.get('/api/admin/my-feature', 
  requireAuth,
  requirePermission('admin.myfeature.view'),
  async (req, res) => {
    // Handle request
  }
);

// Audit logging
import { auditLog } from '@/lib/audit';

async function handleFeatureAction(userId: string, action: string, data: any) {
  // Perform action
  const result = await performAction(data);
  
  // Log the action
  await auditLog(userId, `my-feature.${action}`, {
    data,
    result,
    timestamp: new Date().toISOString()
  });
  
  return result;
}
```

## ⚙️ Configuration Management

### Module Settings Schema

```typescript
interface MyFeatureSettings {
  enableAdvancedMode: boolean;
  maxItems: number;
  refreshInterval: number;
  allowedFileTypes: string[];
  theme: {
    primaryColor: string;
    accentColor: string;
  };
}

// Validation with Zod
import { z } from 'zod';

const MyFeatureSettingsSchema = z.object({
  enableAdvancedMode: z.boolean().default(false),
  maxItems: z.number().min(1).max(1000).default(100),
  refreshInterval: z.number().min(5000).default(30000),
  allowedFileTypes: z.array(z.string()).default(['jpg', 'png', 'gif']),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
    accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#10B981')
  }).default({})
});
```

### Settings Usage

```typescript
function MyFeatureComponent() {
  const { module } = useAdminModule('my-feature');
  
  // Get settings with defaults
  const settings = MyFeatureSettingsSchema.parse(module?.settings || {});
  
  // Use settings
  const refreshData = useCallback(() => {
    // Refresh logic
  }, []);
  
  useEffect(() => {
    const interval = setInterval(refreshData, settings.refreshInterval);
    return () => clearInterval(interval);
  }, [settings.refreshInterval, refreshData]);
  
  return (
    <div style={{ '--primary-color': settings.theme.primaryColor }}>
      {/* Component content */}
    </div>
  );
}
```

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/my-feature.test.ts
import { render, screen } from '@testing-library/react';
import { AdminModuleRegistry } from '@/../../shared/lib/admin-module-registry';
import MyFeaturePage from '../my-feature';

describe('MyFeature Module', () => {
  let registry: AdminModuleRegistry;
  
  beforeEach(() => {
    registry = new AdminModuleRegistry({ devMode: true });
    registry.initialize();
  });

  it('should register module correctly', () => {
    expect(registry.hasModule('my-feature')).toBe(true);
    
    const module = registry.getModule('my-feature');
    expect(module?.name).toBe('My Feature');
    expect(module?.permissions).toContain('admin.myfeature.view');
  });

  it('should respect permissions', () => {
    const mockUser = { role: 'user' };
    expect(registry.hasPermission('my-feature', mockUser)).toBe(false);
    
    const mockAdmin = { role: 'admin' };
    expect(registry.hasPermission('my-feature', mockAdmin)).toBe(true);
  });

  it('should handle disabled state', () => {
    registry.setModuleEnabled('my-feature', false);
    
    // Test component behavior when disabled
    render(<MyFeaturePage />);
    expect(screen.getByText(/module disabled/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/admin-navigation.test.ts
import { renderHook } from '@testing-library/react';
import { useAdminNavigation } from '@/hooks/use-admin-modules';

describe('Admin Navigation', () => {
  it('should generate navigation based on permissions', () => {
    const { result } = renderHook(() => useAdminNavigation());
    
    expect(result.current.navigationItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'my-feature',
          name: 'My Feature',
          route: '/admin/my-feature'
        })
      ])
    );
  });
});
```

## 🚀 Performance Optimization

### Lazy Loading

```typescript
// Module components are lazy loaded by default
const MyFeatureComponent = lazy(() => 
  import('@/pages/admin/my-feature').then(module => ({
    default: module.MyFeatureContent
  }))
);

// Custom loading fallback
function MyFeatureWithSuspense() {
  return (
    <Suspense fallback={<AdminLoadingSpinner />}>
      <MyFeatureComponent />
    </Suspense>
  );
}
```

### Query Optimization

```typescript
function MyFeatureComponent() {
  const { isEnabled } = useAdminModule('my-feature');
  
  // Only fetch data if module is enabled
  const { data, isLoading } = useQuery({
    queryKey: ['my-feature-data'],
    queryFn: fetchMyFeatureData,
    enabled: isEnabled, // Important: conditional fetching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return <FeatureContent data={data} loading={isLoading} />;
}
```

## 🐛 Debugging

### Development Tools

```typescript
// Enable debug mode
const registry = new AdminModuleRegistry({
  devMode: true,
  strictPermissions: false // Bypass permissions for testing
});

// Log module registration
registry.register(myModule);
console.log('Registered modules:', registry.getAllModules());

// Check permissions
const user = getCurrentUser();
console.log('User permissions for my-feature:', 
  registry.hasPermission('my-feature', user)
);
```

### Error Boundaries

```typescript
// Custom error boundary for modules
class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, moduleId: props.moduleId };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Module error [${this.state.moduleId}]:`, error);
    
    // Send to monitoring service
    logError('admin-module-error', {
      moduleId: this.state.moduleId,
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ModuleErrorFallback moduleId={this.state.moduleId} />;
    }

    return this.props.children;
  }
}
```

## 📦 Module Packaging

### NPM Package Structure

```
my-admin-module/
├── package.json
├── src/
│   ├── index.ts              # Module registration
│   ├── components/           # React components
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── dist/                    # Built files
└── README.md               # Module documentation
```

### Package Configuration

```json
{
  "name": "@degentalk/admin-my-feature",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "@degentalk/admin-core": "^1.0.0"
  },
  "exports": {
    ".": "./dist/index.js",
    "./components": "./dist/components/index.js"
  }
}
```

## 🔗 Best Practices

### Code Organization
- Keep modules focused and single-purpose
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error boundaries

### Security
- Always validate permissions on both frontend and backend
- Use the module registry for all access control
- Implement audit logging for sensitive actions
- Sanitize all user inputs

### Performance
- Use lazy loading for large modules
- Implement proper caching strategies
- Optimize database queries
- Monitor bundle sizes

### Testing
- Write unit tests for all modules
- Test permission scenarios
- Implement integration tests
- Use realistic test data

---

**Next: [User Guide](./user-guide.md)**