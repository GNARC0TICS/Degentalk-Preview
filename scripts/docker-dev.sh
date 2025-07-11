#!/bin/bash

# DegenTalk Docker Development Script
# Provides easy commands for Docker-based development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from env.example..."
        if [ -f env.example ]; then
            cp env.example .env
            log_success "Created .env from env.example"
        else
            log_error "env.example not found. Please create .env manually."
            exit 1
        fi
    fi
}

# Show usage
usage() {
    echo "DegenTalk Docker Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment (default)"
    echo "  claude       Start Claude Code environment"
    echo "  prod         Start production environment"
    echo "  build        Build all images"
    echo "  clean        Stop and remove containers"
    echo "  reset        Full reset (remove containers, volumes, images)"
    echo "  logs         Show logs"
    echo "  shell        Open shell in development container"
    echo "  db           Access database shell"
    echo "  migrate      Run database migrations"
    echo "  seed         Seed database"
    echo "  status       Show container status"
    echo "  help         Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                # Start development"
    echo "  $0 claude         # Start Claude Code environment"
    echo "  $0 logs app-dev   # Show app logs"
    echo "  $0 shell          # Open development shell"
}

# Start development environment
start_dev() {
    log_info "Starting development environment..."
    docker-compose --profile development up -d
    log_success "Development environment started!"
    log_info "Frontend: http://localhost:5173"
    log_info "Backend: http://localhost:5001"
    log_info "Database: localhost:5432"
}

# Start Claude Code environment
start_claude() {
    log_info "Starting Claude Code environment..."
    docker-compose -f docker-compose.claude.yml up -d
    log_success "Claude Code environment started!"
    log_info "Workspace: docker exec -it claude-workspace bash"
    log_info "Database: localhost:5432"
}

# Start production environment
start_prod() {
    log_info "Starting production environment..."
    docker-compose --profile production up -d
    log_success "Production environment started!"
    log_info "Application: http://localhost"
}

# Build all images
build_images() {
    log_info "Building all Docker images..."
    docker-compose build
    log_success "All images built successfully!"
}

# Clean up containers
clean() {
    log_info "Stopping and removing containers..."
    docker-compose down
    docker-compose -f docker-compose.claude.yml down 2>/dev/null || true
    log_success "Containers cleaned up!"
}

# Full reset
reset() {
    log_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Performing full reset..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.claude.yml down -v --remove-orphans 2>/dev/null || true
        docker system prune -f
        docker volume prune -f
        log_success "Full reset completed!"
    else
        log_info "Reset cancelled."
    fi
}

# Show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        log_info "Showing all logs..."
        docker-compose logs -f
    else
        log_info "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Open shell
open_shell() {
    local container="degentalk-dev"
    if docker ps --format "table {{.Names}}" | grep -q "claude-workspace"; then
        container="claude-workspace"
    fi
    
    log_info "Opening shell in $container..."
    docker exec -it "$container" bash
}

# Database shell
db_shell() {
    local db_container="degentalk-postgres"
    if docker ps --format "table {{.Names}}" | grep -q "claude-postgres"; then
        db_container="claude-postgres"
    fi
    
    log_info "Opening database shell..."
    docker exec -it "$db_container" psql -U degentalk -d degentalk
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    if docker ps --format "table {{.Names}}" | grep -q "claude-workspace"; then
        docker exec claude-workspace pnpm db:migrate:apply
    else
        docker exec degentalk-dev pnpm db:migrate:apply
    fi
    log_success "Migrations completed!"
}

# Seed database
seed_database() {
    log_info "Seeding database..."
    if docker ps --format "table {{.Names}}" | grep -q "claude-workspace"; then
        docker exec claude-workspace pnpm seed:all
    else
        docker exec degentalk-dev pnpm seed:all
    fi
    log_success "Database seeded!"
}

# Show status
show_status() {
    log_info "Container Status:"
    docker-compose ps
    echo ""
    docker-compose -f docker-compose.claude.yml ps 2>/dev/null || true
}

# Main script logic
main() {
    check_docker
    check_env
    
    local command=${1:-"dev"}
    
    case $command in
        "dev")
            start_dev
            ;;
        "claude")
            start_claude
            ;;
        "prod")
            start_prod
            ;;
        "build")
            build_images
            ;;
        "clean")
            clean
            ;;
        "reset")
            reset
            ;;
        "logs")
            show_logs $2
            ;;
        "shell")
            open_shell
            ;;
        "db")
            db_shell
            ;;
        "migrate")
            run_migrations
            ;;
        "seed")
            seed_database
            ;;
        "status")
            show_status
            ;;
        "help"|"-h"|"--help")
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"