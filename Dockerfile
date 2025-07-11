# ==========================================
# Multi-stage Dockerfile for DegenTalk
# ==========================================

# ==========================================
# STAGE 1: Dependencies
# ==========================================
FROM node:20-alpine AS dependencies

# Install pnpm globally
RUN npm install -g pnpm@9.15.0

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace package.json files
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY db/package.json ./db/
COPY shared/package.json ./shared/
COPY scripts/package.json ./scripts/

# Install dependencies (all workspaces)
RUN pnpm install --frozen-lockfile

# ==========================================
# STAGE 2: Client Build
# ==========================================
FROM dependencies AS client-builder

# Copy client source code and shared dependencies
COPY client/ ./client/
COPY shared/ ./shared/
COPY config/ ./config/

# Build client
RUN pnpm --filter @degentalk/client build

# ==========================================
# STAGE 3: Database Build
# ==========================================
FROM dependencies AS db-builder

# Copy database schema and shared dependencies
COPY db/ ./db/
COPY shared/ ./shared/

# Generate database types
RUN pnpm --filter @degentalk/db build

# ==========================================
# STAGE 4: Server Runtime
# ==========================================
FROM node:20-alpine AS server

# Install pnpm globally
RUN npm install -g pnpm@9.15.0

# Create app user for security
RUN addgroup -g 1001 -S degentalk && \
    adduser -S degentalk -u 1001

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy server dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/server/node_modules ./server/node_modules
COPY --from=dependencies /app/shared/node_modules ./shared/node_modules
COPY --from=dependencies /app/db/node_modules ./db/node_modules

# Copy built client assets
COPY --from=client-builder /app/client/dist ./client/dist

# Copy database build
COPY --from=db-builder /app/db ./db

# Copy server source and shared code
COPY server/ ./server/
COPY shared/ ./shared/
COPY config/ ./config/

# Copy essential project files
COPY env.example ./
COPY tsconfig.json ./

# Create logs directory with proper permissions
RUN mkdir -p logs server/logs && \
    chown -R degentalk:degentalk logs server/logs

# Set proper ownership
RUN chown -R degentalk:degentalk /app

# Switch to non-root user
USER degentalk

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/status', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Environment
ENV NODE_ENV=production
ENV PORT=5001

# Expose port
EXPOSE 5001

# Start server
CMD ["pnpm", "--filter", "@degentalk/server", "start"]

# ==========================================
# STAGE 5: Development
# ==========================================
FROM dependencies AS development

# Install dev dependencies
RUN apk add --no-cache git

# Copy source code
COPY . .

# Set development environment
ENV NODE_ENV=development

# Expose ports (client: 5173, server: 5001)
EXPOSE 5173 5001

# Development command
CMD ["pnpm", "dev"]

# ==========================================
# STAGE 6: Claude Code Environment
# ==========================================
FROM node:20-alpine AS claude-code

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    postgresql-client \
    python3 \
    py3-pip

# Install pnpm globally
RUN npm install -g pnpm@9.15.0

# Create app user
RUN addgroup -g 1001 -S claude && \
    adduser -S claude -u 1001

# Set working directory
WORKDIR /workspace

# Copy package files for dependency installation
COPY --chown=claude:claude package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=claude:claude client/package.json ./client/
COPY --chown=claude:claude server/package.json ./server/
COPY --chown=claude:claude db/package.json ./db/
COPY --chown=claude:claude shared/package.json ./shared/
COPY --chown=claude:claude scripts/package.json ./scripts/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=claude:claude . .

# Switch to non-root user
USER claude

# Set environment for development
ENV NODE_ENV=development
ENV CLAUDE_WORKSPACE=true

# Expose ports
EXPOSE 5173 5001

# Default command for Claude Code
CMD ["bash", "-c", "echo 'Claude Code environment ready. Run: pnpm dev' && tail -f /dev/null"]