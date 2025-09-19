#!/bin/bash

# 🚀 Quote System - One-Click Deployment Script
# This script will automatically deploy the entire application

set -e  # Exit on any error

echo "🚀 Starting Quote System Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo "Please install Docker first:"
        echo "curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "sudo sh get-docker.sh"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        echo "Please install Docker Compose first:"
        echo "sudo apt-get update && sudo apt-get install docker-compose-plugin"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed!"
}

# Check existing environment file
check_env_file() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        echo "Please make sure the .env file is included in your project directory."
        exit 1
    fi
    
    print_success "Using existing .env file!"
    
    # Display current environment (without sensitive data)
    print_status "Environment configuration:"
    grep -E "^(NODE_ENV|PORT|POSTGRES_DB)" .env 2>/dev/null || echo "  - Using provided configuration"
}

# Stop any existing services
stop_existing() {
    print_status "Stopping any existing services..."
    
    # Stop both development and production compose files
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    print_success "Existing services stopped!"
}

# Build and start services
start_services() {
    print_status "Building and starting services (this may take a few minutes)..."
    
    # Build and start in detached mode
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_success "Services started!"
}

# Wait for database to be ready
wait_for_database() {
    print_status "Waiting for database to be ready..."
    
    # Wait up to 60 seconds for database
    for i in {1..60}; do
        if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            print_success "Database is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    print_error "Database failed to start after 60 seconds"
    exit 1
}

# Run database migrations
run_migrations() {
    print_status "Setting up database schema..."
    
    # Run migrations (schema files are pre-generated)
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run drizzle:migrate
    
    # Create initial admin user (if needed)
    print_status "Setting up initial admin user..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run create-admin
    
    print_success "Database setup completed!"
}

# Check if services are running
check_services() {
    print_status "Verifying deployment..."
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Some services are not running!"
        docker-compose -f docker-compose.prod.yml ps
        exit 1
    fi
    
    # Test application endpoint
    sleep 5  # Give app a moment to start
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Application is responding!"
    else
        print_warning "Application might still be starting up..."
    fi
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash
# Database backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

echo "Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres quotes_db > "${BACKUP_DIR}/backup_${DATE}.sql"
echo "Backup created: ${BACKUP_DIR}/backup_${DATE}.sql"
EOF

    chmod +x backup.sh
    print_success "Backup script created (run ./backup.sh to backup database)"
}

# Create update script
create_update_script() {
    print_status "Creating update script..."
    
    cat > update.sh << 'EOF'
#!/bin/bash
# Update application script
echo "Updating application..."

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    git pull origin main
fi

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

echo "Update completed!"
EOF

    chmod +x update.sh
    print_success "Update script created (run ./update.sh to update application)"
}

# Main deployment function
main() {
    echo "🚀 Quote System - Automated Deployment"
    echo "======================================"
    echo
    
    check_docker
    check_env_file
    stop_existing
    start_services
    wait_for_database
    run_migrations
    check_services
    create_backup_script
    create_update_script
    
    echo
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
    echo "========================================"
    echo
    print_success "Your Quote System is now running!"
    echo
    echo "📋 IMPORTANT INFORMATION:"
    echo "------------------------"
    echo "🌐 Application URL: http://localhost:3000"
    echo "� Environment: Using existing .env file"
    echo
    echo "📁 Files created:"
    echo "  - .env (environment configuration)"
    echo "  - backup.sh (database backup script)"
    echo "  - update.sh (application update script)"
    echo
    echo "🔧 Useful commands:"
    echo "  - Check status: docker-compose -f docker-compose.prod.yml ps"
    echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f app"
    echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo
    echo "💾 To backup database: ./backup.sh"
    echo "🔄 To update application: ./update.sh"
    echo
    echo "✅ Deployment completed! Your system is ready to use."
}

# Run main function
main "$@"
