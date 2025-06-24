# MCP Configuration for DegenTalk (Cursor)

## Overview

Model Context Protocol (MCP) servers have been configured for Cursor to provide direct database access and enhanced development capabilities according to Neon's official documentation.

## Configuration Location

- **File**: `.cursor/mcp.json` (project-specific)
- **Type**: Cursor-specific MCP configuration

## Configured MCP Servers

### 1. 🔥 Neon Database Server

- **Command**: `@neondatabase/mcp-server-neon`
- **API Key**: Your production Neon API key
- **Capabilities**:
  - Direct Neon database management
  - Execute SQL queries without terminal
  - Real-time schema inspection
  - Database migrations and maintenance
  - Natural language interaction with Neon projects

### 2. 🐘 PostgreSQL Server

- **Command**: `@modelcontextprotocol/server-postgres`
- **Connection**: Your production Neon PostgreSQL connection string
- **Capabilities**:
  - Advanced PostgreSQL operations
  - Complex SQL query execution
  - Database analysis and optimization
  - Performance monitoring

### 3. 🔍 Brave Search Server

- **Command**: `@modelcontextprotocol/server-brave-search`
- **Capabilities**:
  - Search for library documentation
  - Find solutions to technical issues
  - Research best practices
  - Real-time web information

## Usage Examples

### Direct Database Queries

```
"Show me the forum_structure table schema"
"List all tables in the database"
"Count threads in each forum structure"
"What's the structure of the threads table?"
"Show me the last 5 users created"
"List my Neon projects"
```

### Development Workflow

```
"Verify the forum structure migration was successful"
"Check if all foreign keys are properly set up"
"Show me which tables reference forum_structure"
"Analyze the thread distribution across forums"
"Create a backup of the database"
```

### Research & Documentation

```
"Search for best practices for Drizzle ORM migrations"
"Find documentation for PostgreSQL foreign key constraints"
"Look up examples of forum database schema design"
```

## Benefits for DegenTalk Development

1. **🚀 Zero Terminal Delays**: Direct database access without waiting for commands
2. **🔍 Real-time Validation**: Instant schema and data verification
3. **🐛 Enhanced Debugging**: Direct SQL capabilities for troubleshooting
4. **⚡ Faster Development**: Immediate feedback on database changes
5. **📊 Data Analysis**: Quick insights into forum usage and structure
6. **🔧 Migration Verification**: Instant validation of schema changes

## DegenTalk-Specific Use Cases

### Forum Structure Validation

- Verify the categories → forum_structure migration
- Check thread count distribution across forums
- Validate foreign key relationships

### Development Debugging

- Inspect thread and post relationships
- Validate XP and wallet integrations
- Check user permission structures

### Performance Analysis

- Analyze query performance on large tables
- Check index usage and optimization
- Monitor database growth patterns

## Security & Access

- **Production Database**: Uses your live Neon database
- **Secure Connection**: SSL-required PostgreSQL connection
- **Local Execution**: MCP servers run locally in Cursor
- **API Key Authentication**: Direct Neon API access

## Installation Status

- ✅ **@neondatabase/mcp-server-neon**: Available via npx
- ✅ **@modelcontextprotocol/server-postgres**: Available via npx
- ✅ **@modelcontextprotocol/server-brave-search**: Available via npx

## Configuration Format

The `.cursor/mcp.json` file follows the official Cursor MCP format:

```json
{
	"mcpServers": {
		"Neon": {
			"command": "npx",
			"args": ["-y", "@neondatabase/mcp-server-neon", "start", "YOUR_API_KEY"]
		}
	}
}
```

## Testing MCP Connection

After Cursor restart, test with:

1. "List my Neon projects"
2. "Show me the forum_structure table schema"
3. "Count total threads and posts"
4. "Search for Drizzle ORM best practices"

## Restart Required

**Important**: Restart Cursor to activate the new MCP configuration.

## Troubleshooting

If MCP servers don't connect:

1. Restart Cursor completely
2. Check the `.cursor/mcp.json` file exists and is valid JSON
3. Verify your Neon API key is correct
4. Check terminal output for MCP server errors

## Avatar Frame System Integration

With MCP configured, you can now directly:

- Query user frame ownership: `"Show users who own avatar frames"`
- Validate wallet transactions: `"Check DGT transactions for frame purchases"`
- Analyze frame popularity: `"Which avatar frames are most popular?"`
- Debug XP awards: `"Show XP transactions for frame_equipped events"`

---

_MCP Configuration optimized for DegenTalk forum development workflow_
