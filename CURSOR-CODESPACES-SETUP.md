# 🎯 Cursor + GitHub Codespaces Setup Guide

## Overview

You can use Cursor with the GitHub Codespaces setup in several ways, each with different benefits:

---

## 🚀 **Option 1: Cursor Remote SSH to Codespace (Recommended)**

**Best for:** Full Cursor experience with cloud computing power

### Setup Steps:

1. **Create GitHub Codespace** (as per migration guide)
2. **Enable SSH in Codespace:**

   ```bash
   # In your Codespace terminal
   sudo service ssh start
   sudo passwd codespace  # Set password for codespace user
   ```

3. **Get Codespace SSH details:**

   ```bash
   # In Codespace, run:
   gh codespace ssh --codespace YOUR_CODESPACE_NAME
   ```

4. **Connect Cursor via Remote SSH:**
   - Open Cursor
   - `Cmd/Ctrl + Shift + P` → "Remote-SSH: Connect to Host"
   - Use the SSH connection details from step 3

### Benefits:

- ✅ Full Cursor AI features
- ✅ Cloud computing resources
- ✅ Pre-configured environment
- ✅ All extensions and settings

---

## 🔄 **Option 2: Local Dev Container in Cursor**

**Best for:** Local development with consistent environment

### Setup Steps:

1. **Install Docker Desktop** on your machine
2. **Install Dev Containers extension** in Cursor
3. **Clone your repo locally:**

   ```bash
   git clone https://github.com/GNARC0TICS/Degentalk-BETA.git
   cd Degentalk-BETA
   ```

4. **Create local env.local:**

   ```bash
   cp codespaces-secrets.md env.local
   # Edit env.local with your actual secrets
   ```

5. **Open in Cursor:**
   - `Cmd/Ctrl + Shift + P` → "Dev Containers: Reopen in Container"
   - Cursor will build the container using `.devcontainer/devcontainer.json`

### Benefits:

- ✅ Local development with Cursor AI
- ✅ Consistent environment via containers
- ✅ Offline development capability
- ✅ Full file system access

---

## 💻 **Option 3: Hybrid Approach (Best of Both)**

**Best for:** Maximum flexibility

### Workflow:

1. **Use Codespaces for:**

   - Initial setup and testing
   - Quick fixes and reviews
   - Team collaboration
   - CI/CD validation

2. **Use Cursor locally for:**
   - Main development work
   - AI-assisted coding
   - Complex refactoring
   - Performance-intensive tasks

### Sync Strategy:

```bash
# Pull latest from Codespace work
git pull origin main

# Push local changes
git add .
git commit -m "feature: implement X"
git push origin feature/my-feature

# Test in Codespace before merging
```

---

## 🛠️ **Cursor-Specific Configuration**

Create a Cursor-optimized setup:

### 1. Cursor Settings for DegenTalk

```json
// .cursor/settings.json
{
	"typescript.preferences.useAliasesForRenames": false,
	"typescript.updateImportsOnFileMove.enabled": "always",
	"editor.formatOnSave": true,
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": "explicit"
	},
	"cursor.ai.enabled": true,
	"cursor.ai.model": "claude-3.5-sonnet",
	"files.exclude": {
		"**/.pnpm-store": true,
		"**/node_modules/.pnpm": true
	}
}
```

### 2. Cursor AI Rules for DegenTalk

```markdown
// .cursor/rules

# DegenTalk Development Rules for Cursor AI

## Architecture

- Use domain-driven design in server/src/domains/
- Follow React 18 patterns with hooks
- Use Drizzle ORM for database operations
- Implement forum business logic in lib/forum/

## Import Patterns

- Use @/ alias for client imports
- Server cannot import from client/
- Prefer named exports for utilities

## Code Style

- Use TypeScript strict mode
- Follow existing ESLint configuration
- No comments unless requested
- Use Tailwind CSS for styling

## Database

- All operations through Drizzle ORM
- Use transactions for multi-table operations
- Follow schema in db/schema/
```

---

## 🔧 **Local Environment Setup for Cursor**

If you choose local development, here's the optimized setup:

### 1. Local Prerequisites

```bash
# Install requirements
brew install node@20 pnpm docker
corepack enable pnpm

# Global tools
pnpm add -g drizzle-kit tsx concurrently
```

### 2. Project Setup

```bash
# Clone and setup
git clone https://github.com/GNARC0TICS/Degentalk-BETA.git
cd Degentalk-BETA

# Install dependencies
pnpm install
cd server && pnpm install && cd ..

# Setup environment
cp codespaces-secrets.md env.local
# Edit env.local with your actual values

# Start development
pnpm dev
```

### 3. Cursor Integration

```bash
# Open in Cursor
cursor .

# Or via command line
code . # if you have Cursor aliased to 'code'
```

---

## 🎯 **Recommended Workflow**

**For your situation, I recommend Option 1 (Remote SSH to Codespace):**

1. **Create Codespace** → automatic setup in ~90 seconds
2. **Connect Cursor via SSH** → full IDE experience
3. **Develop normally** → all Cursor AI features work
4. **Use cloud resources** → no local resource usage

This gives you:

- ✅ Zero local setup time
- ✅ Full Cursor experience
- ✅ Cloud computing power
- ✅ Consistent environment
- ✅ Easy team collaboration

---

## 🚀 **Quick Start Commands**

Once connected (any method):

```bash
# Verify setup
pnpm --version && node --version

# Start development
pnpm dev                        # Full stack
pnpm db:studio                  # Database management

# SuperClaude integration
sc /user:load --depth deep --plan

# Run tests
pnpm test:repo                  # Repository tests
pnpm lint                       # Code quality
```

---

## 🔍 **Troubleshooting**

### Remote SSH Issues

- **Connection refused:** Ensure SSH is started in Codespace
- **Permission denied:** Set password with `sudo passwd codespace`
- **Port forwarding:** Use `-L` flag for local port forwarding

### Dev Container Issues

- **Container won't build:** Check Docker is running locally
- **Extensions missing:** They'll install automatically on first build
- **Performance slow:** Increase Docker memory allocation

### Environment Issues

- **Missing env vars:** Copy from `codespaces-secrets.md` to `env.local`
- **Database connection:** Verify `DATABASE_URL` is correctly set
- **Ports in use:** Run `pnpm kill-ports` before starting

The setup is designed to work seamlessly with both VS Code and Cursor!
