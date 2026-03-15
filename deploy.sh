#!/bin/bash

# KnowledgeAI - Docker Deployment Script

set -euo pipefail

echo "🚀 KnowledgeAI Docker Deployment"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

echo "✅ Docker is ready"
echo ""

# Build and start all services
echo "📦 Building and starting containers..."
echo "This may take a few minutes on first run..."
echo ""

COMPOSE_CMD="docker compose"

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

echo "🔎 Checking running containers..."
if $COMPOSE_CMD ps --services --status running 2>/dev/null | grep -q .; then
    echo "✅ Some services are already running"
else
    echo "ℹ️  No services currently running"
fi

echo "🛑 Stopping app services (keeping Postgres running if possible)..."
$COMPOSE_CMD stop backend frontend >/dev/null 2>&1 || true

echo "🚀 Starting infrastructure service (Postgres)..."
$COMPOSE_CMD up -d postgres

echo "⏳ Waiting for Postgres to be ready..."
POSTGRES_CID="$($COMPOSE_CMD ps -q postgres 2>/dev/null || true)"
if [ -n "$POSTGRES_CID" ]; then
    for i in {1..30}; do
        STATUS="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$POSTGRES_CID" 2>/dev/null || true)"
        if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "running" ]; then
            echo "   ✅ Postgres ready ($STATUS)"
            break
        fi
        echo "   - Postgres... ($STATUS)"
        sleep 1
        if [ "$i" -eq 30 ]; then
            echo "❌ Postgres not ready in time"
            echo "Tip: run '$COMPOSE_CMD logs -f postgres' to inspect"
            exit 1
        fi
    done
else
    echo "❌ Could not find Postgres container id"
    exit 1
fi

echo "🏗️  Building and starting app services (backend + frontend)..."
$COMPOSE_CMD up -d --build backend frontend

echo "✅ Done! Services are running:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - Swagger docs: http://localhost:8000/docs"
echo "   - PostgreSQL: postgresql://postgres:postgres@localhost:5432/knowledgeai"
echo ""
echo "📊 Status:"
$COMPOSE_CMD ps
echo ""
echo "View logs with: $COMPOSE_CMD logs -f backend"
echo "Stop with:      $COMPOSE_CMD down"
