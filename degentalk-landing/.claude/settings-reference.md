# Claude Code Settings.json Reference

## All Available Properties

### 1. `apiKeyHelper`
Custom script to generate authentication value for API requests.
```json
{
  "apiKeyHelper": "/path/to/auth-script.sh"
}
```

### 2. `cleanupPeriodDays`
Number of days to retain local chat transcripts (default: 30).
```json
{
  "cleanupPeriodDays": 60
}
```

### 3. `env`
Environment variables to apply to every session.
```json
{
  "env": {
    "DEGENTALK_ROOT": "/home/developer/Degentalk-BETA",
    "NODE_ENV": "development",
    "CUSTOM_VAR": "value"
  }
}
```

### 4. `includeCoAuthoredBy`
Whether to include "co-authored by Claude" in git commits (default: true).
```json
{
  "includeCoAuthoredBy": false
}
```

### 5. `permissions`
Configure allowed and denied tool usage.
```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Write",
      "Read"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
```

### 6. `hooks`
Define custom commands to run before/after tool executions.
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write {filePath}"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Command executed: {command}'"
          }
        ]
      }
    ]
  }
}
```

### 7. `model`
Override default model for Claude Code.
```json
{
  "model": "claude-3-opus-20240229"
}
```

### 8. `forceLoginMethod`
Restrict login to specific account types.
```json
{
  "forceLoginMethod": "claudeai"  // or "console"
}
```

### 9. `enableAllProjectMcpServers`
Automatically approve all MCP servers.
```json
{
  "enableAllProjectMcpServers": true
}
```

### 10. `enabledMcpjsonServers`
List specific MCP servers to approve.
```json
{
  "enabledMcpjsonServers": [
    "degentalk-fs",
    "postgres",
    "eslint"
  ]
}
```

### 11. `disabledMcpjsonServers`
List specific MCP servers to reject.
```json
{
  "disabledMcpjsonServers": [
    "dangerous-server",
    "untrusted-mcp"
  ]
}
```

### 12. `awsAuthRefresh`
Custom script to modify AWS directory credentials.
```json
{
  "awsAuthRefresh": "/path/to/aws-refresh.sh"
}
```

### 13. `awsCredentialExport`
Custom script to output AWS credentials.
```json
{
  "awsCredentialExport": "/path/to/aws-export.sh"
}
```

## Settings Hierarchy

Settings follow this precedence (highest to lowest):
1. Enterprise policies
2. Command line arguments
3. Local project settings (`.claude/settings.json`)
4. Shared project settings (`.claude/settings.json` checked into git)
5. User settings (`~/.config/claude/settings.json`)

## Example Complete Settings File

```json
{
  "env": {
    "DEGENTALK_ROOT": "/home/developer/Degentalk-BETA",
    "NODE_ENV": "development"
  },
  "cleanupPeriodDays": 90,
  "includeCoAuthoredBy": true,
  "model": "claude-3-opus-20240229",
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(pnpm *)",
      "Bash(npm *)",
      "Bash(node *)",
      "Bash(tsx *)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo rm *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node /home/developer/Degentalk-BETA/tools/claude-hooks/run-checks.cjs --mode pre-edit --file \"{filePath}\" --hook enforce-repository-pattern"
          }
        ]
      }
    ]
  },
  "enabledMcpjsonServers": [
    "degentalk-fs",
    "postgres",
    "eslint",
    "filesystem",
    "puppeteer",
    "sequential-thinking"
  ]
}
```