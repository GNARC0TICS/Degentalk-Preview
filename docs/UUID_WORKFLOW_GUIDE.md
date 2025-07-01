# UUID Workflow Guide - DegenTalk Database Types

## 🎯 **Overview**

This guide outlines the enhanced UUID workflow for DegenTalk's database type system, providing developers with comprehensive patterns, utilities, and best practices for working with branded UUID types.

## 📁 **Architecture Overview**

```
db/types/
├── id.types.ts          # 106+ branded ID type definitions
├── utils.ts             # Enhanced UUID utilities and helpers  
└── index.ts             # Main exports

shared/utils/
└── id.ts                # Cross-platform UUID utilities

migrations/postgres/
├── 0014_dev_uuid_schema_fixes.sql     # Development FK fixes
└── 0014_fix_uuid_foreign_keys.sql     # Production migration plan
```

## 🏗️ **Core Components**

### **1. Branded ID Types (`db/types/id.types.ts`)**

**Current Status**: 106 branded types defined using utility-types library

```typescript
// Generic pattern
export type Id<Tag extends string> = Brand<string, `${Capitalize<Tag>}Id`>;

// Specific implementations  
export type UserId = Id<'user'>;
export type ThreadId = Id<'thread'>;
export type WalletId = Id<'wallet'>;
// ... 103 more types
```

**Benefits:**
- **Compile-time type safety** - prevents mixing different ID types
- **Zero runtime overhead** - brands are erased at compile time  
- **IntelliSense support** - clear type hints in IDEs
- **Refactoring safety** - TypeScript catches ID type mismatches

### **2. Enhanced Utilities (`db/types/utils.ts`)**

**New Features Added:**

#### **Type-Safe ID Operations**
```typescript
import { toId, generateId, isValidUuid } from '@db/types';

// Safe conversion with validation
const userId = toId<'user'>('123e4567-e89b-12d3-a456-426614174000');

// Generate new UUIDs 
const newId = generateId<'thread'>();

// Validate UUID format
if (isValidUuid(input)) {
  // Safe to use as ID
}
```

#### **Batch Operations**
```typescript
import { IdBatch } from '@db/types';

const userBatch = new IdBatch<'user'>()
  .add(userId1)
  .addMany([userId2, userId3])
  .toArray(); // Get all IDs as array
```

#### **API Parameter Parsing**
```typescript
import { parseIdParam } from '@db/types';

// In route handlers
const userId = parseIdParam<'user'>(req.params.id, 'userId');
// Throws descriptive error for invalid UUIDs
```

### **3. Cross-Platform Utilities (`shared/utils/id.ts`)**

**Shared Functions** (available in both client and server):

```typescript
import { generateId, isValidId, filterValidIds } from '@shared/utils/id';

// Generate UUIDs with fallback support
const id = generateId<'post'>(); 

// Safe validation
if (isValidId(userInput)) {
  // Process valid UUID
}

// Array filtering
const validIds = filterValidIds([id1, null, id2, undefined]);
```

## 🔧 **Development Workflow**

### **Adding New Entity Types**

**Step 1**: Add branded type definition
```typescript
// db/types/id.types.ts
export type NewEntityId = Id<'newEntity'>;
```

**Step 2**: Create schema with UUID primary key
```typescript
// db/schema/domain/newEntities.ts
export const newEntities = pgTable('new_entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... other fields
});
```

**Step 3**: Add validation schemas
```typescript
// shared/validators/newEntity.ts  
export const newEntityIdSchema = z.string().uuid('Invalid NewEntity ID');
```

### **API Route Patterns**

**Recommended Pattern**:
```typescript
import { parseIdParam } from '@db/types';

async function getEntity(req: Request, res: Response) {
  try {
    // Type-safe parameter parsing
    const entityId = parseIdParam<'newEntity'>(req.params.id, 'entityId');
    
    // Database operations
    const entity = await entityService.getById(entityId);
    
    res.json(entity);
  } catch (error) {
    if (error instanceof InvalidIdError) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
}
```

### **Service Layer Patterns**

**Standard Service Interface**:
```typescript
class EntityService {
  async getById(id: NewEntityId): Promise<NewEntity | null> {
    // Type-safe database query
    const [entity] = await db
      .select()
      .from(newEntities) 
      .where(eq(newEntities.id, id))
      .limit(1);
      
    return entity || null;
  }
  
  async create(data: CreateEntityData): Promise<NewEntity> {
    const [entity] = await db
      .insert(newEntities)
      .values({
        id: generateId<'newEntity'>(), // Generate UUID
        ...data
      })
      .returning();
      
    return entity;
  }
}
```

## 🚨 **Critical Migration Status**

### **✅ Successfully Migrated (UUID Primary Keys)**
- **Core Business Logic**: users, threads, posts, wallets ✅
- **Forum System**: forumStructure, tags, prefixes ✅  
- **Economy**: transactions, badges, titles ✅
- **User System**: avatarFrames, roles (intentional integer) ✅

### **🔧 Recently Fixed Critical Issues**
- **threads.structureId**: integer → uuid (forum system was broken)
- **transactions.walletId**: integer → uuid (economy was broken)
- **users.activeTitleId/activeBadgeId**: integer → uuid (cosmetics broken)
- **thread_tags.tagId**: integer → uuid (tagging system broken)

### **📊 Migration Metrics**
- **126/145 schema files** migrated to UUID (87% complete)
- **106 branded ID types** defined and ready to use
- **9 critical foreign key mismatches** fixed
- **2 migration scripts** created for deployment

## 🛠️ **Development Tools**

### **ESLint Integration**

The `no-number-id` ESLint rule prevents regression to numeric ID patterns:

```json
// .eslintrc.json
{
  "rules": {
    "degen/no-number-id": "warn" // Currently warning, will become error
  }
}
```

**Detects patterns like**:
```typescript
// ❌ Will trigger ESLint warning
interface BadInterface {
  userId: number;
  threadId: number;
}

// ✅ Correct branded type usage
interface GoodInterface {
  userId: UserId;
  threadId: ThreadId;
}
```

### **Type Checking & Validation**

**Runtime Validation**:
```typescript
import { IdValidators } from '@db/types';

// Specific type guards
if (IdValidators.user(input)) {
  // input is now typed as Id<'user'>
}
```

**Zod Schema Integration**:
```typescript
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
});
```

## 🧪 **Testing Patterns**

### **Mock ID Generation**
```typescript
import { createMockId } from '@db/types';

describe('UserService', () => {
  it('should create user correctly', async () => {
    const mockUserId = createMockId<'user'>();
    const mockUser = { id: mockUserId, name: 'Test User' };
    
    // Test with type-safe mock IDs
  });
});
```

### **Test Utilities**
```typescript
import { validateIds, IdBatch } from '@db/types';

// Batch validation in tests
const testIds = validateIds<'user'>([
  'valid-uuid-1',
  'invalid-id',
  'valid-uuid-2'
]); // Returns only valid UUIDs
```

## 📈 **Performance Considerations**

### **UUID vs Integer Performance**
- **Storage**: UUIDs use ~36 characters vs 4-8 bytes for integers
- **Index Performance**: ~5-10% slower for range queries
- **Foreign Key Lookups**: Minimal performance impact
- **Generation Speed**: crypto.randomUUID() is highly optimized

### **Optimization Strategies**
- **Use UUIDs for business logic** (users, content, transactions)
- **Keep integers for system config** (roles, permissions, settings)  
- **Batch operations** when processing many IDs
- **Database indexing** remains effective with UUIDs

## 🔒 **Security Benefits**

### **Enumeration Attack Prevention**
```typescript
// ❌ Vulnerable integer IDs
GET /api/users/1, /api/users/2, /api/users/3 // Can enumerate all users

// ✅ Secure UUID IDs  
GET /api/users/123e4567-e89b-12d3-a456-426614174000 // Cannot enumerate
```

### **Information Disclosure Prevention**
- **No sequence information** - UUIDs don't reveal creation order
- **No count estimation** - Cannot estimate total records from ID
- **Cross-system uniqueness** - Safe to use across environments

## 🔄 **Migration Deployment**

### **Development Environment**
```bash
# Run the development migration
psql -f migrations/postgres/0014_dev_uuid_schema_fixes.sql

# Re-seed data with UUIDs  
pnpm run seed:all
```

### **Production Environment**
```bash
# 1. Backup database
pg_dump database_name > backup_before_uuid_migration.sql

# 2. Run migration with data preservation
psql -f migrations/postgres/0014_fix_uuid_foreign_keys.sql

# 3. Verify foreign key constraints
# Run verification queries included in migration script
```

## 📞 **Support & Troubleshooting**

### **Common Issues**

**Foreign Key Constraint Violations**:
```sql
-- Verify all FK relationships are correct
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE referenced_table_name IN ('users', 'threads', 'posts');
```

**Type Conversion Errors**:
```typescript
// ❌ Unsafe casting
const userId = req.params.id as UserId;

// ✅ Safe conversion
const userId = parseIdParam<'user'>(req.params.id, 'userId');
```

**Invalid UUID Format**:
```typescript
// Use validation utilities
import { isValidUuid, InvalidIdError } from '@db/types';

if (!isValidUuid(input)) {
  throw new InvalidIdError(input, 'User');
}
```

### **Debug Utilities**

**ID Format Validation**:
```typescript
import { ID_CONSTANTS } from '@db/types';

console.log('UUID Pattern:', ID_CONSTANTS.UUID_PATTERN);
console.log('UUID Length:', ID_CONSTANTS.UUID_LENGTH);
```

---

## 🎉 **Next Steps**

1. **Complete remaining schema migrations** (19 files remaining)
2. **Enhance ESLint rule** to error level once migration complete
3. **Add performance monitoring** for UUID vs integer comparison
4. **Create automated testing** for foreign key constraint validation
5. **Document production deployment** process with data migration strategy

**The UUID migration represents a major architectural improvement providing enhanced security, type safety, and scalability for DegenTalk's future growth.**