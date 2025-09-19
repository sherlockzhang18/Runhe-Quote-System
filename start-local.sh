#!/bin/bash

# 🚀 Start Local Development Environment

echo "🚀 Starting Local Development Environment..."
echo "=========================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running!"

# Start only PostgreSQL for local development
echo "🗄️ Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to start..."
sleep 5

# Check if database is ready
if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "✅ Database is ready!"
else
    echo "⚠️ Database might still be starting..."
fi

# Copy local environment
echo "📝 Setting up local environment..."
cp .env.local .env

echo "🎉 Local development environment is ready!"
echo "========================================"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run drizzle:migrate"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "🔧 Database Info:"
echo "- Host: localhost:5432"
echo "- Database: nextjs_db"
echo "- User: postgres"
echo "- Password: postgres"