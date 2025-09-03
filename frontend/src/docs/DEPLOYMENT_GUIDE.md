# WishBoard Deployment Guide

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Next)  │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Vercel/Netlify│    │   Render/Railway│    │   Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   File Storage  │              │
         └──────────────►│   (AWS S3)      │◄─────────────┘
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   External APIs │
                        │   (Giphy, etc.) │
                        └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite or Next.js
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand or Redux Toolkit
- **Real-time**: Socket.IO Client
- **Canvas**: Konva.js or Fabric.js
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js or NestJS
- **Language**: TypeScript
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **Validation**: Zod or Joi
- **File Upload**: Multer + AWS SDK

### Database
- **Primary**: PostgreSQL 14+
- **ORM**: Prisma or TypeORM
- **Caching**: Redis
- **Search**: PostgreSQL Full-Text Search

### Infrastructure
- **Frontend Hosting**: Vercel, Netlify, or AWS Amplify
- **Backend Hosting**: Render, Railway, Heroku, or AWS ECS
- **Database**: Supabase, AWS RDS, or DigitalOcean
- **File Storage**: AWS S3, Cloudinary, or Supabase Storage
- **CDN**: CloudFront or Cloudflare

---

## Environment Setup

### Development Environment

#### Prerequisites
```bash
# Install Node.js 18+
node --version  # v18.0.0+
npm --version   # v8.0.0+

# Install Git
git --version

# Install Docker (optional)
docker --version
```

#### Clone and Setup
```bash
# Clone repository
git clone https://github.com/your-org/wishboard.git
cd wishboard

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

#### Environment Variables
```bash
# Frontend (.env.local)
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_GIPHY_API_KEY=your_giphy_api_key
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key

# Backend (.env)
NODE_ENV=development
PORT=3001
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wishboard
REDIS_URL=redis://localhost:6379

# File Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=wishboard-assets

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@wishboard.app

# External APIs
GIPHY_API_KEY=your_giphy_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

#### Run Development Servers
```bash
# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm run dev

# Start database (terminal 3)
docker-compose up postgres redis
```

### Database Setup
```bash
# Using Prisma
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed

# Using TypeORM
npm run migration:run
npm run seed
```

---

## Production Deployment

### 1. Frontend Deployment (Vercel)

#### Setup Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

#### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://api.wishboard.app/api",
    "VITE_WS_URL": "wss://api.wishboard.app"
  }
}
```

### 2. Backend Deployment (Render)

#### Setup Render Service
1. Connect GitHub repository
2. Configure build settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

#### Environment Variables (Render)
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=production_jwt_secret_here
DATABASE_URL=postgresql://user:pass@host:5432/wishboard_prod
REDIS_URL=redis://redis-host:6379
AWS_ACCESS_KEY_ID=prod_aws_key
AWS_SECRET_ACCESS_KEY=prod_aws_secret
SENDGRID_API_KEY=prod_sendgrid_key
```

#### Health Check Endpoint
```javascript
// backend/src/routes/health.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### 3. Database Deployment (Supabase)

#### Setup Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

#### Migration Script
```sql
-- migrations/001_initial_schema.sql
-- Copy schema from DATABASE_SCHEMA.md
```

### 4. File Storage (AWS S3)

#### S3 Bucket Configuration
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wishboard-assets/*"
    }
  ]
}
```

#### CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://wishboard.app", "https://api.wishboard.app"],
    "ExposeHeaders": []
  }
]
```

---

## Docker Deployment

### Development Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: wishboard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/wishboard
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Production Docker Setup
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001
CMD ["npm", "start"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wishboard-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wishboard-backend
  template:
    metadata:
      labels:
        app: wishboard-backend
    spec:
      containers:
      - name: backend
        image: wishboard/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wishboard-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: wishboard-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: wishboard-backend-service
spec:
  selector:
    app: wishboard-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

---

## Monitoring and Observability

### Application Monitoring

#### Setup Sentry (Error Tracking)
```bash
npm install @sentry/react @sentry/node
```

```javascript
// Frontend
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Backend
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Performance Monitoring
```javascript
// Add metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

### Database Monitoring
```sql
-- Create monitoring views
CREATE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

### Uptime Monitoring
- **Services**: Pingdom, StatusCake, or UptimeRobot
- **Endpoints to Monitor**:
  - `GET /health` - Backend health
  - `GET /` - Frontend availability
  - Database connectivity

---

## Security Considerations

### SSL/TLS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains";
}
```

### Environment Security
```bash
# Never commit these to git
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use secrets management
export DATABASE_URL=$(aws ssm get-parameter --name "/wishboard/db-url" --with-decryption --query "Parameter.Value" --output text)
```

### Rate Limiting
```javascript
// Express rate limiting
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts'
});

app.use('/api/auth', authLimiter);
```

---

## Performance Optimization

### Frontend Optimization
```javascript
// Code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Whiteboard = lazy(() => import('./components/Whiteboard'));

// Image optimization
<img 
  src="image.jpg" 
  loading="lazy" 
  decoding="async"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Backend Optimization
```javascript
// Database connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Caching
import Redis from 'redis';
const redis = Redis.createClient();

app.get('/api/events', async (req, res) => {
  const cached = await redis.get('events');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const events = await getEvents();
  await redis.setex('events', 300, JSON.stringify(events));
  res.json(events);
});
```

### Database Optimization
```sql
-- Add appropriate indexes
CREATE INDEX CONCURRENTLY idx_events_date_user ON events(event_date, user_id);
CREATE INDEX CONCURRENTLY idx_board_elements_board_type ON board_elements(board_id, type);

-- Use materialized views for complex queries
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE type = 'birthday') as birthdays
FROM events
GROUP BY user_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
```

---

## Backup and Recovery

### Database Backups
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_${DATE}.sql"
aws s3 cp "backup_${DATE}.sql" s3://wishboard-backups/
rm "backup_${DATE}.sql"
```

### File Storage Backups
```bash
# S3 Cross-region replication
aws s3api put-bucket-replication \
  --bucket wishboard-assets \
  --replication-configuration file://replication.json
```

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup Schedule**: Daily database, continuous file sync
4. **Recovery Steps**:
   - Provision new infrastructure
   - Restore database from backup
   - Deploy latest application version
   - Update DNS records

---

## Scaling Considerations

### Horizontal Scaling
```yaml
# Auto-scaling configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: wishboard-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: wishboard-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling
```sql
-- Read replicas for scaling reads
-- Partition large tables by date
CREATE TABLE activity_log_y2024 PARTITION OF activity_log
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Connection pooling
-- Consider PgBouncer for production
```

### CDN Configuration
```javascript
// CloudFront distribution
{
  "Origins": [
    {
      "DomainName": "api.wishboard.app",
      "Id": "api-origin",
      "CustomOriginConfig": {
        "HTTPPort": 443,
        "OriginProtocolPolicy": "https-only"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "api-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "caching-optimized"
  }
}
```

This deployment guide provides a comprehensive roadmap for taking WishBoard from development to production at scale.