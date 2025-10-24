#!/bin/bash

# =============================================
# Database Cleanup Shell Script
# =============================================
# This script completely deletes all data from the database
# WARNING: This will permanently delete ALL data!
# =============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to load environment variables
load_env() {
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
        print_success "Environment variables loaded from .env file"
    else
        print_error ".env file not found!"
        exit 1
    fi
}

# Function to confirm action
confirm_action() {
    echo -e "${RED}=============================================${NC}"
    echo -e "${RED}  WARNING: DATABASE CLEANUP SCRIPT${NC}"
    echo -e "${RED}=============================================${NC}"
    echo -e "${RED}This will PERMANENTLY DELETE ALL DATA from:${NC}"
    echo -e "${RED}  - Database: ${DB_DATABASE:-myapp}${NC}"
    echo -e "${RED}  - Host: ${DB_HOST:-localhost}${NC}"
    echo -e "${RED}  - Port: ${DB_PORT:-5432}${NC}"
    echo -e "${RED}=============================================${NC}"
    echo ""
    echo -e "${YELLOW}This action CANNOT be undone!${NC}"
    echo ""
    read -p "Are you sure you want to continue? Type 'YES' to confirm: " confirmation
    
    if [ "$confirmation" != "YES" ]; then
        print_warning "Operation cancelled by user"
        exit 0
    fi
}

# Function to execute SQL script
execute_sql() {
    local sql_file="$1"
    
    if [ ! -f "$sql_file" ]; then
        print_error "SQL file not found: $sql_file"
        exit 1
    fi
    
    print_warning "Executing SQL cleanup script..."
    
    # Use psql to execute the SQL file
    if command_exists psql; then
        PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USERNAME" \
            -d "$DB_DATABASE" \
            -f "$sql_file"
        
        if [ $? -eq 0 ]; then
            print_success "SQL script executed successfully!"
        else
            print_error "Failed to execute SQL script"
            exit 1
        fi
    else
        print_error "psql command not found. Please install PostgreSQL client tools."
        exit 1
    fi
}

# Function to execute using Docker (if database is running in Docker)
execute_sql_docker() {
    local sql_file="$1"
    local container_name="question-and-answer-platform-db-crud-1"
    
    print_warning "Executing SQL cleanup script via Docker..."
    
    # Check if container exists and is running
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        docker exec -i "$container_name" psql \
            -U "$DB_USERNAME" \
            -d "$DB_DATABASE" \
            < "$sql_file"
        
        if [ $? -eq 0 ]; then
            print_success "SQL script executed successfully via Docker!"
        else
            print_error "Failed to execute SQL script via Docker"
            exit 1
        fi
    else
        print_error "Docker container '$container_name' not found or not running"
        print_warning "Trying direct connection instead..."
        execute_sql "$sql_file"
    fi
}

# Function to verify cleanup
verify_cleanup() {
    print_warning "Verifying database cleanup..."
    
    local verify_sql="
    SELECT 
        'users' as table_name, COUNT(*) as row_count FROM users
    UNION ALL
    SELECT 
        'question' as table_name, COUNT(*) as row_count FROM question
    UNION ALL
    SELECT 
        'tag' as table_name, COUNT(*) as row_count FROM tag
    UNION ALL
    SELECT 
        'answer' as table_name, COUNT(*) as row_count FROM answer
    UNION ALL
    SELECT 
        'vote' as table_name, COUNT(*) as row_count FROM vote;
    "
    
    if command_exists psql; then
        PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USERNAME" \
            -d "$DB_DATABASE" \
            -c "$verify_sql"
    else
        print_warning "Cannot verify cleanup - psql not available"
    fi
}

# Main execution
main() {
    echo "Starting database cleanup script..."
    
    # Load environment variables
    load_env
    
    # Confirm action
    confirm_action
    
    # Set default values if not provided
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_USERNAME=${DB_USERNAME:-postgres}
    DB_DATABASE=${DB_DATABASE:-myapp}
    
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    SQL_FILE="$SCRIPT_DIR/clear-database.sql"
    
    # Check if we're in a Docker environment
    if [ -f docker-compose.yml ] && docker ps --format "table {{.Names}}" | grep -q "db-crud"; then
        execute_sql_docker "$SQL_FILE"
    else
        execute_sql "$SQL_FILE"
    fi
    
    # Verify cleanup
    verify_cleanup
    
    print_success "Database cleanup completed!"
    echo ""
    echo -e "${GREEN}All data has been permanently deleted from the database.${NC}"
    echo -e "${GREEN}You can now run migrations and seeders to repopulate the database.${NC}"
}

# Run main function
main "$@"
