# Live Database Editor - Administrator Guide

## Overview

The Live Database Editor provides safe, controlled access to database tables for administrative tasks, moderation, and emergency data management. This system is designed to exclude configuration tables and focus exclusively on moderation and metadata operations.

## 🚫 Excluded from Live Editor

**Configuration tables are permanently blocked** and must be edited through dedicated admin panels:

- `site_settings`, `feature_flags`, `xp_action_settings`
- `forum_categories`, `forum_structure`, `roles`, `permissions`
- `treasury_settings`, `dgt_packages`, `custom_emojis`
- All other configuration data (47+ tables total)

## ✅ Supported Table Categories

### Moderation Tables
Primary focus for live administration and emergency moderation:

- **`users`** - User accounts, status, ban management
- **`threads`** - Forum threads, lock/unlock, moderation status
- **`posts`** - Forum posts, content moderation
- **`bans`** - User ban records and reasons
- **`reports`** - User reports and review status

### Metadata Tables  
Safe structural data that can be modified:

- **`roles`** - User roles and hierarchies
- **`categories`** - Content categorization
- **`forum_structure`** - Forum organization
- **`tags`** - Content tagging system

### Read-Only Tables
View-only access for monitoring and analysis:

- `audit_logs`, `sessions`, `analytics_events`
- `rate_limits`, `platform_stats`, `leaderboards`

## 🛡️ Safety Features

### Multi-Layer Access Control

1. **Table Classification System**
   - Editable, read-only, configuration, and blacklisted categories
   - Automatic permission checking and enforcement
   - Smart error responses with guidance

2. **Visual Safety Indicators**
   - **Red Banner**: Blocked/restricted tables with security warnings
   - **Amber Banner**: Configuration tables with config panel links
   - **Blue Banner**: Moderation tables with enhanced actions
   - **Green Banner**: Metadata tables safe for structural changes

3. **Audit Trail**
   - All operations logged with admin user ID
   - Detailed metadata for actions and changes
   - Comprehensive operation history

### Permission Requirements

- **View Access**: `admin.database.view`
- **Edit Access**: `admin.database.edit` 
- **Export Access**: `admin.database.export`

Admin users automatically receive all database permissions. Moderators receive view-only access to moderation tables.

## 🔧 Features & Capabilities

### Table Browsing
- Paginated table data with search and filtering
- Schema information with column details
- Foreign key relationship navigation
- Real-time row counts and metadata

### Moderation Actions
Context-aware quick actions for moderation workflows:

#### User Management (`users` table)
- **Ban User**: Set status to 'banned' with reason
- **Unban User**: Restore 'active' status
- **Reset 2FA**: Clear two-factor authentication settings
- **Role Changes**: Modify user roles and permissions

#### Content Moderation (`threads`, `posts` tables)
- **Lock Thread**: Prevent new posts/replies
- **Unlock Thread**: Restore posting capability
- **Mark Reviewed**: Update moderation status
- **Content Flags**: Manage content moderation flags

#### Report Management (`reports` table)
- **Mark Reviewed**: Update report status to 'reviewed'
- **Assign Moderator**: Route reports to specific moderators
- **Bulk Actions**: Process multiple reports simultaneously

### Data Operations
- **Inline Editing**: Direct field modification with validation
- **Bulk Operations**: Multi-row updates and deletions (max 100 rows)
- **CSV Export**: Full table data export
- **Import Templates**: Download CSV templates for bulk imports
- **Data Validation**: Schema-based validation before operations

### Advanced Features
- **Search & Filter**: Text search across table contents
- **Column Sorting**: Sortable table views
- **Relationship Navigation**: Click foreign keys to navigate to related records
- **Change Tracking**: Visual indicators for recent modifications

## 📋 Usage Workflows

### Emergency User Ban
1. Navigate to Live Database Editor
2. Select `users` table
3. Search for target user
4. Use dropdown → "Ban User"
5. Confirm action with reason
6. Verification via audit log

### Bulk Content Moderation
1. Select `threads` or `posts` table
2. Use filters to identify problematic content
3. Select multiple rows for bulk action
4. Apply "Lock" or "Delete" operations
5. Review audit trail for confirmation

### Forum Structure Changes
1. Select `forum_structure` table
2. Modify hierarchy or organization
3. Use drag-to-reorder for priority changes
4. Validate changes in frontend
5. Monitor for any issues

### Report Processing
1. Select `reports` table  
2. Filter by status: 'pending'
3. Review report details
4. Mark as 'reviewed' or escalate
5. Add moderator notes if needed

## ⚠️ Important Limitations

### What You CANNOT Do
- Edit configuration tables (redirected to proper admin panels)
- Access system/security tables (`sessions`, `api_keys`, etc.)
- Execute DDL operations (CREATE, ALTER, DROP)
- Bypass validation rules or constraints
- Access production secrets or sensitive data

### Rate Limits & Safeguards
- Bulk operations limited to 100 rows maximum
- File uploads limited to 10MB for CSV imports
- Query execution restricted to read-only operations
- Automatic validation before any data modifications

## 🔍 Troubleshooting

### Common Issues

**"Table not in allowed list"**
- Table may be a configuration table - use dedicated admin panel
- Check permissions - may need admin.database.edit
- Verify table exists and spelling is correct

**"Configuration table - use dedicated config panel"**
- This is expected behavior for safety
- Click provided link to proper admin configuration page
- Configuration changes should never bypass validation systems

**"Validation failed"**
- Check required fields are not null/empty
- Verify data types match schema requirements
- Review foreign key constraints

**"Operation failed"**
- Check audit logs for detailed error information
- Verify user has appropriate permissions
- Ensure table is not read-only or restricted

### Error Recovery
- All operations are transactional - failed operations don't cause partial updates
- Audit logs provide complete operation history for debugging
- Configuration tables remain accessible through proper admin panels
- Contact system administrator for persistent issues

## 📊 Monitoring & Analytics

### Audit Logging
All database operations are comprehensively logged:

```typescript
{
  adminUserId: string,
  action: 'database_row_updated' | 'database_bulk_import' | etc,
  details: string,
  metadata: {
    table: string,
    rowId: any,
    updatedFields: string[],
    // ... operation-specific data
  },
  timestamp: Date
}
```

### Performance Monitoring
- Database query execution time tracking
- Bulk operation success/failure rates
- Table access frequency analytics
- User operation patterns and trends

### Security Monitoring
- Failed access attempts to restricted tables
- Permission escalation attempts
- Suspicious bulk operation patterns
- Configuration bypass attempts

## 🎯 Best Practices

### Data Safety
1. Always use search/filters to verify target records before bulk operations
2. Export data before large modifications for backup
3. Use validation-only mode for CSV imports first
4. Test changes on staging environment when possible

### Operational Efficiency
1. Use moderation-specific quick actions rather than manual field editing
2. Leverage bulk operations for repetitive tasks
3. Export data for analysis rather than manual browsing
4. Use proper config panels for configuration changes

### Security Compliance
1. Never attempt to bypass table access restrictions
2. Document reasons for emergency moderation actions
3. Review audit logs regularly for compliance
4. Coordinate with team for significant bulk operations

---

**⚡ Emergency Contact**: For critical database issues outside the live editor scope, contact system administrators immediately. This tool is designed for operational tasks, not system-level emergencies.