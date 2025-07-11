# Claude Code Optimized Docker Environment
# Lightweight container designed specifically for Claude Code development

FROM node:20-alpine

# Install essential system tools
RUN apk add --no-cache \
    git \
    curl \
    bash \
    postgresql-client \
    python3 \
    py3-pip \
    openssh-client \
    vim \
    nano

# Install pnpm globally
RUN npm install -g pnpm@9.15.0

# Create claude user
RUN addgroup -g 1001 -S claude && \
    adduser -S claude -u 1001 -G claude

# Set up workspace directory
WORKDIR /workspace

# Create directories with proper permissions
RUN mkdir -p /home/claude/.cache /home/claude/.local && \
    chown -R claude:claude /home/claude /workspace

# Copy package files for dependency pre-installation
COPY --chown=claude:claude package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Switch to claude user for dependency installation
USER claude

# Install dependencies (cache layer for faster rebuilds)
RUN pnpm install --frozen-lockfile

# Set environment variables
ENV NODE_ENV=development
ENV CLAUDE_WORKSPACE=true
ENV SHELL=/bin/bash
ENV HOME=/home/claude
ENV USER=claude

# Create .bashrc with helpful aliases
RUN echo 'export PS1="\u@claude-workspace:\w$ "' >> ~/.bashrc && \
    echo 'alias ll="ls -la"' >> ~/.bashrc && \
    echo 'alias la="ls -A"' >> ~/.bashrc && \
    echo 'alias dev="pnpm dev"' >> ~/.bashrc && \
    echo 'alias build="pnpm build"' >> ~/.bashrc && \
    echo 'alias test="pnpm test"' >> ~/.bashrc && \
    echo 'alias lint="pnpm lint"' >> ~/.bashrc && \
    echo 'alias typecheck="pnpm typecheck"' >> ~/.bashrc && \
    echo 'echo "🔨 Claude Code Development Environment"' >> ~/.bashrc && \
    echo 'echo "Available commands: dev, build, test, lint, typecheck"' >> ~/.bashrc && \
    echo 'echo "Database: $DATABASE_URL"' >> ~/.bashrc

# Expose development ports
EXPOSE 5173 5001

# Default command
CMD ["bash", "-l"]