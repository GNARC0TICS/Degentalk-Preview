# MCP Quick Reference - Cursor/Claude Code

## 🚀 Status: READY TO USE

### Configuration

- ✅ **Cursor MCP Config**: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- ✅ **Neon Server**: v0.6.1 with your production API key
- ✅ **PostgreSQL Server**: v0.6.2 with production connection string
- ✅ **Brave Search**: v0.6.2 for documentation lookup

## 📋 Quick Test Commands

After restarting Cursor, test with:

```
1. "List all tables in the database"
2. "Show me the forum_structure table schema"
3. "Count threads in each forum"
4. "Search for Drizzle ORM foreign key examples"
```

## 🎯 DegenTalk-Specific Queries

### Validate Forum Migration

```
"Show me the forum_structure table and its relationships"
"Count how many threads reference forum_structure vs old categories"
"List all foreign keys pointing to forum_structure"
```

### Development Debugging

```
"What's the structure of the threads table?"
"Show me the last 10 threads created and their forum structure"
"Check if all forum IDs in threads table exist in forum_structure"
```

### Performance Analysis

```
"Show me thread count by forum structure"
"What's the average post count per thread?"
"List the most active forums by thread count"
```

## ⚡ Benefits

- **No More Terminal Waits**: Direct database queries
- **Real-time Validation**: Instant schema verification
- **Enhanced Debugging**: SQL access for troubleshooting
- **Smart Research**: Auto-search for solutions

## 🔄 Next Step

**Restart Cursor** to activate MCP configuration

---

_Ready for seamless DegenTalk development with MCP!_
