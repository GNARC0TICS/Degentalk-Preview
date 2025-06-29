# Database Live Editor - Restricted Scope Implementation

## Overview

The Database Live Editor provides safe, controlled access to database tables for administrative purposes. **This system has been specifically designed to EXCLUDE configuration tables** to preserve the integrity of DegenTalk's established configuration management system.

## 🚨 Critical Design Principles

### 1. Configuration System Preservation

- **ALL configuration tables are BLOCKED** from live editing
- Configuration changes MUST use dedicated admin config panels
- Live editor is ONLY for operational data (users, content, moderation)

### 2. Table Classification System

#### ✅ **EDITABLE TABLES** (Live Editor Allowed)

- **User Management**: `users`, `user_groups`, `user_roles`, `bans`, etc.
- **Forum Content**: `threads`, `posts`, `post_likes`, `tags`, etc.
- **Economy Transactions**: `transactions`, `wallets`, `xp_logs`, etc.
- **Messaging**: `messages`, `conversations`, `shoutbox_messages`, etc.
- **Moderation**: `reports`, `moderation_actions`, `user_abuse_flags`, etc.

#### ⚠️ **READ-ONLY TABLES** (View Only)

- **Analytics**: `analytics_events`, `ui_analytics`, `platform_stats`
- **Security**: `sessions`, `audit_logs`, `rate_limits`
- **System Monitoring**: `event_logs`, `cooldown_state`

#### 🔒 **CONFIGURATION TABLES** (Use Config Panels)

- **Core Config**: `site_settings`, `feature_flags`, `brand_configurations`
- **UI Config**: `ui_quotes`, `ui_collections`, `themes`
- **Economy Config**: `xp_action_settings`, `treasury_settings`, `dgt_packages`
- **Forum Config**: `forum_categories`, `rules`, `custom_emojis`
- **Shop Config**: `product_categories`, `rarities`, `animation_packs`
- **User Config**: `roles`, `permissions`, `titles`, `badges`

#### ❌ **SYSTEM BLACKLISTED** (Complete Block)

- **Security**: `password_reset_tokens`, `api_keys`, `webhooks`
- **PostgreSQL**: `pg_stat_activity`, `information_schema`
- **Audit**: `audit_logs` (integrity protection)

## API Endpoints

### Base URL: `/api/admin/database`

#### Table Introspection

- `GET /tables` - List all accessible tables with access info
- `GET /tables/:table/schema` - Get table structure
- `GET /tables/:table/data` - Get table data (paginated)
- `GET /tables/:table/relationships` - Get foreign key relationships

#### Data Manipulation (Editable Tables Only)

- `POST /tables/rows/create` - Create new row
- `PUT /tables/rows/update` - Update existing row
- `DELETE /tables/rows/delete` - Delete row
- `POST /tables/rows/bulk` - Bulk operations

#### Query Execution

- `POST /query/execute` - Execute custom SQL queries
- `POST /query/validate` - Validate SQL before execution

## Access Control Response Format

When accessing configuration tables, the API returns:

```json
{
	"success": false,
	"error": "Configuration table - use dedicated config panel",
	"tableType": "configuration",
	"configRoute": "/admin/config/xp",
	"message": "This is a configuration table. Please use the dedicated config panel: /admin/config/xp"
}
```

## Configuration Panel Routes

| Table                | Config Panel Route         |
| -------------------- | -------------------------- |
| `site_settings`      | `/admin/settings`          |
| `feature_flags`      | `/admin/settings/features` |
| `xp_action_settings` | `/admin/config/xp`         |
| `treasury_settings`  | `/admin/config/economy`    |
| `forum_categories`   | `/admin/config/zones`      |
| `roles`              | `/admin/roles`             |
| `permissions`        | `/admin/permissions`       |
| `custom_emojis`      | `/admin/emojis`            |

## Security Features

### 1. **Table Access Validation**

```typescript
const accessInfo = await databaseService.getTableAccessInfo(tableName);
if (!accessInfo.canEdit) {
	// Blocked with appropriate guidance
}
```

### 2. **SQL Injection Prevention**

- Table name validation with regex
- Parameterized queries only
- No dynamic SQL construction

### 3. **Audit Logging**

- All database operations logged
- Admin user tracking
- Change history preservation

### 4. **Data Validation**

- Schema-based validation
- Type checking
- Required field enforcement

## Usage Guidelines

### ✅ **DO Use Live Editor For**

- Emergency user account modifications
- Content moderation (deleting posts, banning users)
- Transaction history investigation
- Message system management
- Debugging operational issues

### ❌ **DON'T Use Live Editor For**

- Changing XP reward values → Use `/admin/config/xp`
- Updating site settings → Use `/admin/settings`
- Modifying forum structure → Use `forumMap.config.ts`
- Managing user roles → Use `/admin/roles`
- Shop configuration → Use `/admin/shop-management`

## Development Integration

### Backend Integration

```typescript
import { DatabaseService } from './database.service';

const databaseService = new DatabaseService();

// Check table access
const accessInfo = await databaseService.getTableAccessInfo('users');
if (accessInfo.canEdit) {
	// Proceed with operation
}
```

### Frontend Integration

```typescript
// Table list includes access information
const tables = await fetch('/api/admin/database/tables');
tables.forEach((table) => {
	if (table.accessInfo.isConfig) {
		showConfigPanelButton(table.accessInfo.configRoute);
	} else if (table.accessInfo.canEdit) {
		showEditButtons();
	}
});
```

## Error Handling

### Configuration Table Access

```json
{
	"success": false,
	"error": "Configuration table - use dedicated config panel",
	"tableType": "configuration",
	"configRoute": "/admin/config/economy"
}
```

### System Table Access

```json
{
	"success": false,
	"error": "System table access is restricted for security",
	"tableType": "restricted",
	"blocked": true
}
```

## Migration from Legacy System

If you previously had unrestricted database access:

1. **Identify Configuration Operations** - Move to proper config panels
2. **Update Admin Workflows** - Use dedicated interfaces
3. **Audit Current Usage** - Ensure no config table dependencies
4. **Test New Restrictions** - Verify operations still work

## Monitoring & Maintenance

### Health Checks

- Table access validation
- Configuration panel availability
- Audit log integrity

### Performance Monitoring

- Query execution times
- Table access patterns
- Configuration vs operational split

## Support & Troubleshooting

### Common Issues

1. **"Table editing not allowed"** → Check if it's a config table, use proper panel
2. **"Unknown table"** → Table not in approved editable list
3. **"Read-only table"** → Analytics/monitoring table, view only

### Emergency Procedures

For critical configuration changes when panels are unavailable:

1. Direct database access through PostgreSQL client
2. Configuration file updates + restart
3. Admin override procedures (documented separately)

---

**⚠️ IMPORTANT**: This system enforces DegenTalk's architectural separation between operational data management and configuration management. Bypassing these restrictions can compromise system integrity and break established admin workflows.
