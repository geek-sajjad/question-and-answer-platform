#!/bin/sh
set -e

echo "🚀 Starting application initialization..."

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3

    if [ -n "$host" ] && [ -n "$port" ]; then
        echo "⏳ Waiting for $service_name to be ready..."
        while ! nc -z "$host" "$port" 2>/dev/null; do
            echo "   $service_name not ready, waiting..."
            sleep 2
        done
        echo "✅ $service_name is ready!"
    fi
}

# Wait for database if configured
wait_for_service "$DB_HOST" "$DB_PORT" "Database"


echo "📦 Running database migrations..."
pnpm run migration:run

# echo "🌱 Seeding database with 10000 records..."
# yarn run seed 10000

echo "🎯 Starting the application..."
exec pnpm run start:prod