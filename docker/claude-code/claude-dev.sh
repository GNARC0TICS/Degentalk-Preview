#!/bin/bash

# Claude Code Docker Development Helper
# Quick commands for Claude Code development in Docker

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[Claude Code]${NC} $1"
}

success() {
    echo -e "${GREEN}[Success]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[Warning]${NC} $1"
}

# Change to script directory
cd "$(dirname "$0")"

case ${1:-"start"} in
    "start"|"up")
        log "Starting Claude Code environment..."
        docker-compose up -d
        success "Environment started!"
        log "Access workspace: docker exec -it claude-workspace bash"
        log "Or use: $0 shell"
        ;;
    
    "stop"|"down")
        log "Stopping Claude Code environment..."
        docker-compose down
        success "Environment stopped!"
        ;;
    
    "restart")
        log "Restarting Claude Code environment..."
        docker-compose restart
        success "Environment restarted!"
        ;;
    
    "shell"|"bash")
        log "Opening workspace shell..."
        docker exec -it claude-workspace bash
        ;;
    
    "dev")
        log "Starting development servers..."
        docker exec -it claude-workspace pnpm dev
        ;;
    
    "build")
        log "Building project..."
        docker exec -it claude-workspace pnpm build
        ;;
    
    "test")
        log "Running tests..."
        docker exec -it claude-workspace pnpm test
        ;;
    
    "lint")
        log "Running linter..."
        docker exec -it claude-workspace pnpm lint
        ;;
    
    "typecheck")
        log "Running type checker..."
        docker exec -it claude-workspace pnpm typecheck
        ;;
    
    "db")
        log "Opening database shell..."
        docker exec -it claude-postgres psql -U claude -d degentalk
        ;;
    
    "migrate")
        log "Running database migrations..."
        docker exec -it claude-workspace pnpm db:migrate:apply
        success "Migrations completed!"
        ;;
    
    "seed")
        log "Seeding database..."
        docker exec -it claude-workspace pnpm seed:all
        success "Database seeded!"
        ;;
    
    "logs")
        service=${2:-"claude"}
        log "Showing logs for $service..."
        docker-compose logs -f "$service"
        ;;
    
    "status")
        log "Environment status:"
        docker-compose ps
        ;;
    
    "clean")
        warning "This will remove containers and volumes. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            log "Cleaning up..."
            docker-compose down -v
            docker system prune -f
            success "Cleanup completed!"
        fi
        ;;
    
    "help"|"-h"|"--help")
        echo "Claude Code Docker Development Helper"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start      Start the environment (default)"
        echo "  stop       Stop the environment"
        echo "  restart    Restart the environment"
        echo "  shell      Open workspace shell"
        echo "  dev        Start development servers"
        echo "  build      Build the project"
        echo "  test       Run tests"
        echo "  lint       Run linter"
        echo "  typecheck  Run type checker"
        echo "  db         Open database shell"
        echo "  migrate    Run database migrations"
        echo "  seed       Seed database"
        echo "  logs       Show logs"
        echo "  status     Show environment status"
        echo "  clean      Clean up containers and volumes"
        echo "  help       Show this help"
        ;;
    
    *)
        warning "Unknown command: $1"
        log "Use '$0 help' for available commands"
        exit 1
        ;;
esac