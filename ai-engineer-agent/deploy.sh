#!/bin/bash

# AI Engineer Agent - Production Deployment Script
# Complete deployment automation with health checks and rollback

set -e

# Configuration
DEPLOY_ENV=${1:-production}
VERSION=${2:-latest}
BACKUP_RETENTION_DAYS=7
HEALTH_CHECK_TIMEOUT=300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"
    
    if [ ! -f ".env.${DEPLOY_ENV}" ]; then
        error "Environment file .env.${DEPLOY_ENV} not found"
    fi
    
    success "Prerequisites check passed"
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    local backup_dir="./backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    
    # Backup main database
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
        -U "${POSTGRES_USER}" ai_engineer_agent > "${backup_dir}/main_db.sql"
    
    # Backup analytics database
    docker-compose -f docker-compose.prod.yml exec -T timescaledb pg_dump \
        -U "${POSTGRES_USER}" ai_engineer_analytics > "${backup_dir}/analytics_db.sql"
    
    # Compress backups
    tar -czf "${backup_dir}.tar.gz" -C ./backups "$(basename "$backup_dir")"
    rm -rf "$backup_dir"
    
    success "Database backup created: ${backup_dir}.tar.gz"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    find ./backups -name "*.tar.gz" -mtime +${BACKUP_RETENTION_DAYS} -delete
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    docker-compose -f docker-compose.prod.yml pull
    success "Images pulled successfully"
}

# Deploy application
deploy_application() {
    log "Deploying AI Engineer Agent v${VERSION}..."
    
    # Load environment variables
    export $(cat .env.${DEPLOY_ENV} | grep -v ^# | xargs)
    
    # Deploy with rolling update
    docker-compose -f docker-compose.prod.yml up -d --remove-orphans
    
    success "Application deployed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U "${POSTGRES_USER}" -d ai_engineer_agent
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec ai-engineer-app npm run migrate
    
    success "Database migrations completed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    local start_time=$(date +%s)
    local timeout=$((start_time + HEALTH_CHECK_TIMEOUT))
    
    while [ $(date +%s) -lt $timeout ]; do
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            success "Application health check passed"
            return 0
        fi
        sleep 10
        log "Waiting for application to be healthy..."
    done
    
    error "Application failed health check after ${HEALTH_CHECK_TIMEOUT} seconds"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Get the latest backup
    local latest_backup=$(ls -t ./backups/*.tar.gz | head -n1)
    
    if [ -z "$latest_backup" ]; then
        error "No backup found for rollback"
    fi
    
    # Extract backup
    local backup_dir="./backups/rollback_$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    tar -xzf "$latest_backup" -C "$backup_dir" --strip-components=1
    
    # Stop current deployment
    docker-compose -f docker-compose.prod.yml down
    
    # Restore database
    docker-compose -f docker-compose.prod.yml up -d postgres timescaledb
    sleep 30
    
    docker-compose -f docker-compose.prod.yml exec -T postgres psql \
        -U "${POSTGRES_USER}" -d ai_engineer_agent < "${backup_dir}/main_db.sql"
    
    docker-compose -f docker-compose.prod.yml exec -T timescaledb psql \
        -U "${POSTGRES_USER}" -d ai_engineer_analytics < "${backup_dir}/analytics_db.sql"
    
    # Start application
    docker-compose -f docker-compose.prod.yml up -d
    
    success "Rollback completed"
}

# Load testing
load_test() {
    log "Running load tests..."
    
    # Basic load test with curl
    for i in {1..10}; do
        curl -f http://localhost:3000/health >/dev/null 2>&1 || error "Load test failed on request $i"
    done
    
    success "Load test passed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Configure Grafana dashboards
    docker-compose -f docker-compose.prod.yml exec grafana grafana-cli admin reset-admin-password "${GRAFANA_PASSWORD}"
    
    success "Monitoring setup completed"
}

# Main deployment function
main() {
    log "Starting AI Engineer Agent deployment (Environment: ${DEPLOY_ENV}, Version: ${VERSION})"
    
    # Trap errors for rollback
    trap 'error "Deployment failed! Run ./deploy.sh rollback to restore previous version"' ERR
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            backup_database
            cleanup_old_backups
            pull_images
            deploy_application
            run_migrations
            health_check
            load_test
            setup_monitoring
            success "🚀 AI Engineer Agent deployed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check
            ;;
        "backup")
            backup_database
            ;;
        "logs")
            docker-compose -f docker-compose.prod.yml logs -f "${2:-ai-engineer-app}"
            ;;
        "status")
            docker-compose -f docker-compose.prod.yml ps
            ;;
        "stop")
            docker-compose -f docker-compose.prod.yml down
            ;;
        "restart")
            docker-compose -f docker-compose.prod.yml restart "${2:-ai-engineer-app}"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup|logs|status|stop|restart} [service_name]"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"