# Deployment Guide

## Prerequisites

1. Server with Docker and Docker Compose installed
2. Domain name configured (optional)
3. SSL certificates (Let's Encrypt recommended)

## Quick Start with Docker Compose

### 1. Clone Repository
```bash
git clone https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-.git
cd ili-kiyapayzekauygulamas-
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your production values
nano .env
```

### 3. Build and Start Services
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Development deployment
docker-compose up -d
```

### 4. Initialize Database
```bash
docker-compose -f docker-compose.prod.yml exec backend python -c "
from backend.app.core.database import engine, Base
Base.metadata.create_all(bind=engine)
"
```

### 5. Verify Deployment
```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost:8000/health
curl http://localhost:3000
```

## Manual Deployment

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -e .
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm start
```

## Environment Variables

### Required Variables

- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password (strong password!)
- `DB_NAME`: Database name
- `SECRET_KEY`: JWT secret key (min 32 characters)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

### Optional Variables

- `REDIS_HOST`: Redis host (default: redis)
- `REDIS_PORT`: Redis port (default: 6379)
- `BACKEND_PORT`: Backend port (default: 8000)
- `FRONTEND_PORT`: Frontend port (default: 3000)

## Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure SSL/TLS certificates
- [ ] Set up backups for database
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure domain and DNS
- [ ] Enable HTTPS redirect
- [ ] Set up rate limiting
- [ ] Review security headers
- [ ] Configure CORS properly
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN (optional)
- [ ] Set up automated backups

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database connection
docker-compose exec db psql -U iliski_user -d iliski_analiz -c "SELECT 1;"

# Redis connection
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

## Backup and Restore

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U iliski_user iliski_analiz > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U iliski_user iliski_analiz < backup_20250101.sql
```

### Full Backup

```bash
# Backup volumes
docker-compose -f docker-compose.prod.yml down
tar -czf backup_$(date +%Y%m%d).tar.gz data/ logs/ uploads/
docker-compose -f docker-compose.prod.yml up -d
```

## Scaling

### Horizontal Scaling (Multiple Backend Instances)

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing with Nginx

```nginx
upstream backend {
    server backend:8000;
    server backend2:8000;
    server backend3:8000;
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change ports in .env or docker-compose.yml
   BACKEND_PORT=8001
   FRONTEND_PORT=3001
   ```

2. **Database connection failed**
   ```bash
   # Check database is running
   docker-compose ps db
   
   # Check connection string
   echo $DATABASE_URL
   ```

3. **Permission denied errors**
   ```bash
   # Fix ownership
   sudo chown -R 1000:1000 data/ logs/ uploads/
   ```

## Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Clean up old images
docker image prune -af
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-/issues
- Email: support@iliskianaliz.ai
