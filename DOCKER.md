# Docker Setup for DegenTalk

This document provides comprehensive Docker setup for the DegenTalk project, including optimized configurations for both production and Claude Code development.

## Quick Start

### Development Environment

```bash
# Start full development stack
pnpm docker:dev

# Or use the script directly
./scripts/docker-dev.sh dev
```

### Claude Code Environment

```bash
# Start Claude Code optimized environment
pnpm docker:claude

# Access the workspace
docker exec -it claude-workspace bash

# Quick access script
./docker/claude-code/claude-dev.sh start
```

### Production Environment

```bash
# Start production stack
pnpm docker:prod
```

## Available Docker Configurations

### 1. Main Docker Compose (`docker-compose.yml`)

**Full-featured setup with multiple profiles:**

- **Development Profile** (`--profile development`)
  - PostgreSQL + Redis + App (dev mode)
  - Hot reload, bind mounts
  - Ports: 5173 (frontend), 5001 (backend), 5432 (db)

- **Production Profile** (`--profile production`)
  - PostgreSQL + Redis + App + Nginx
  - Optimized builds, caching
  - Port: 80 (nginx)

- **Claude Profile** (`--profile claude`)
  - Optimized for Claude Code development
  - Lightweight, fast startup

- **MCP Profile** (`--profile mcp`)
  - Zen MCP Server integration

### 2. Claude Code Compose (`docker-compose.claude.yml`)

**Optimized specifically for Claude Code sessions:**

- Minimal resource usage
- Fast startup times
- Persistent development data
- Pre-configured environment

### 3. Dedicated Claude Code (`docker/claude-code/`)

**Standalone Claude Code environment:**

- Separate lightweight setup
- Independent from main stack
- Quick development iteration

## Environment Profiles

### Development Profile

```bash
# Start development environment
docker-compose --profile development up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app-dev
```

**Features:**

- Live reload for both frontend and backend
- Bind mounts for real-time code changes
- Development optimized builds
- Debug-friendly configuration

### Production Profile

```bash
# Build and start production
docker-compose --profile production up -d

# Scale if needed
docker-compose --profile production up -d --scale app=3
```

**Features:**

- Multi-stage optimized builds
- Nginx reverse proxy with caching
- Health checks and restart policies
- Security hardening
- Resource limits

### Claude Code Profile

```bash
# Method 1: Main compose with Claude profile
docker-compose --profile claude up -d

# Method 2: Dedicated Claude compose
docker-compose -f docker-compose.claude.yml up -d

# Method 3: Standalone Claude environment
cd docker/claude-code && ./claude-dev.sh start
```

**Features:**

- Optimized for Claude Code development workflow
- Pre-installed development tools
- Persistent workspace and cache
- Quick access commands

## Development Scripts

### Main Development Script

```bash
./scripts/docker-dev.sh [COMMAND]
```

**Available commands:**

- `dev` - Start development environment
- `claude` - Start Claude Code environment
- `prod` - Start production environment
- `build` - Build all images
- `clean` - Stop and remove containers
- `reset` - Full reset (containers + volumes + images)
- `logs [service]` - Show logs
- `shell` - Open development shell
- `db` - Access database shell
- `migrate` - Run database migrations
- `seed` - Seed database
- `status` - Show container status

### Claude Code Script

```bash
./docker/claude-code/claude-dev.sh [COMMAND]
```

**Available commands:**

- `start` - Start Claude environment
- `shell` - Open workspace shell
- `dev` - Start development servers
- `build` - Build project
- `test` - Run tests
- `lint` - Run linter
- `typecheck` - Run type checker
- `db` - Open database shell
- `migrate` - Run migrations
- `seed` - Seed database

## Docker Images

### Application Image (Multi-stage)

```dockerfile
# Stages:
# 1. dependencies - Install all workspace dependencies
# 2. client-builder - Build React frontend
# 3. db-builder - Generate database types
# 4. server - Production runtime
# 5. development - Development environment
# 6. claude-code - Claude Code optimized environment
```

### Claude Code Image

```dockerfile
# Lightweight Alpine-based image
# Pre-installed: Node.js, pnpm, git, postgresql-client
# User: claude (non-root)
# Workspace: /workspace
```

## Environment Variables

### Required Variables

```bash
# Database
POSTGRES_DB=degentalk
POSTGRES_USER=degentalk
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis
REDIS_URL=redis://redis:6379

# CCPayment (Production)
CCPAYMENT_APP_ID=your_app_id
CCPAYMENT_APP_SECRET=your_app_secret
```

### Optional Variables

```bash
# Ports
APP_PORT=5001
NGINX_PORT=80
POSTGRES_PORT=5432
REDIS_PORT=6379

# Logging
LOG_LEVEL=info

# Development
NODE_ENV=development
```

## Volume Management

### Persistent Volumes

- `postgres_data` - Database data
- `redis_data` - Redis cache data
- `app_logs` - Application logs
- `claude_data` - Claude Code user data
- `zen_mcp_config` - Zen MCP configuration

### Development Bind Mounts

- `.:/app` - Full source code (development)
- `.:/workspace` - Workspace (Claude Code)
- `./client/dist:/usr/share/nginx/html` - Static assets (production)

## Networking

### Internal Network

- **Name**: `degentalk-network` (main), `claude-network` (Claude)
- **Type**: Bridge network
- **Services**: All containers communicate internally

### Port Mapping

- **5173** → Frontend development server
- **5001** → Backend API server
- **5432** → PostgreSQL database
- **6379** → Redis cache
- **80** → Nginx (production)

## Health Checks

### Application Health Check

```bash
# Manual health check
curl http://localhost:5001/api/status

# Docker health check
docker ps --filter "health=healthy"
```

### Database Health Check

```bash
# PostgreSQL
docker exec postgres pg_isready -U degentalk

# Redis
docker exec redis redis-cli ping
```

## Performance Optimizations

### Build Optimizations

- Multi-stage builds reduce final image size
- Layer caching for faster rebuilds
- Separate dependency and source layers
- Production builds exclude dev dependencies

### Runtime Optimizations

- Non-root user execution
- Resource limits and reservations
- Health checks for reliability
- Restart policies for resilience

### Development Optimizations

- Bind mounts for live reload
- Persistent node_modules volumes
- Development-specific environment
- Fast startup with cached dependencies

## Security Considerations

### Container Security

- Non-root user execution (`claude:1001`, `degentalk:1001`)
- Read-only root filesystem where possible
- Security labels and restrictions
- Minimal base images (Alpine Linux)

### Network Security

- Internal bridge networks
- No external port exposure except necessary
- Environment variable secrets management
- Container isolation

### Production Security

- Nginx security headers
- Rate limiting
- SSL/TLS termination support
- File access restrictions

## Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Kill existing processes
   ./scripts/docker-dev.sh clean

   # Or manually
   lsof -ti:5001 | xargs kill -9
   ```

2. **Permission issues**

   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER .

   # Or use rootless Docker
   ```

3. **Database connection issues**

   ```bash
   # Check database status
   docker exec postgres pg_isready -U degentalk

   # View database logs
   docker logs degentalk-postgres
   ```

4. **Build issues**
   ```bash
   # Clean rebuild
   ./scripts/docker-dev.sh reset
   ./scripts/docker-dev.sh build
   ```

### Debug Commands

```bash
# Container status
docker ps -a

# Resource usage
docker stats

# System information
docker system df
docker system info

# Network inspection
docker network ls
docker network inspect degentalk-network

# Volume inspection
docker volume ls
docker volume inspect postgres_data
```

## Best Practices

### Development Workflow

1. Use `docker-compose.claude.yml` for Claude Code sessions
2. Use `./scripts/docker-dev.sh` for general development
3. Persist important data in named volumes
4. Use health checks to ensure service readiness

### Production Deployment

1. Use production profile with proper environment variables
2. Set up external database and Redis for scalability
3. Configure SSL/TLS termination at load balancer
4. Monitor container health and resource usage
5. Implement proper backup strategies for volumes

### Claude Code Integration

1. Start with: `./docker/claude-code/claude-dev.sh start`
2. Access workspace: `./docker/claude-code/claude-dev.sh shell`
3. Run development: `./docker/claude-code/claude-dev.sh dev`
4. Quick iteration with persistent cache volumes

This Docker setup provides a complete, optimized development and production environment for DegenTalk, with special consideration for Claude Code development workflows.
