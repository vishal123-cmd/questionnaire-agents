# Docker Deployment Guide

## Prerequisites
- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### 1. Start all services (Frontend + Backend + PostgreSQL)

```bash
docker-compose up --build
```

This will:
- Build Docker images for frontend and backend
- Start PostgreSQL database
- Initialize the database with tables
- Start the backend API on http://localhost:8000
- Start the frontend on http://localhost:5173

### 2. Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Stop all services

```bash
docker-compose down
```

### 4. Stop and remove all data (including database)

```bash
docker-compose down -v
```

## Common Commands

### Run in detached mode (background)
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart a service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Access database directly
```bash
docker exec -it knowledgeai-db psql -U postgres -d knowledgeai
```

### Access backend container shell
```bash
docker exec -it knowledgeai-backend bash
```

### Access frontend container shell
```bash
docker exec -it knowledgeai-frontend sh
```

## Development Workflow

The Docker setup includes volume mounts, so you can edit code on your host machine and see changes reflected:

- **Backend**: Auto-reloads on file changes (uvicorn --reload)
- **Frontend**: Hot module replacement (Vite HMR)

## Environment Variables

Edit `docker-compose.yml` to change environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `VITE_API_URL`: Backend API URL for frontend

## Production Deployment

For production, create a separate `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    # ... production config
```

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### Port already in use
- Change ports in `docker-compose.yml`
- Or stop conflicting services

### Build errors
- Clear Docker cache: `docker-compose build --no-cache`
- Remove old images: `docker system prune -a`
