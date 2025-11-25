# Deployment Guide - Loyalty Quests Shopify App

Complete guide for deploying the Loyalty Quests Shopify app to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Redis Setup](#redis-setup)
5. [Application Deployment](#application-deployment)
6. [Shopify Partner Configuration](#shopify-partner-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 20+ installed
- PostgreSQL 14+ database
- Redis 6+ server
- Shopify Partner account
- Domain name with SSL certificate
- Hosting platform account (AWS, Google Cloud, Heroku, Railway, etc.)

---

## Environment Setup

### 1. Create Production Environment File

Create a `.env.production` file with all required environment variables:

```bash
# Application
NODE_ENV=production
APP_HOST=0.0.0.0
APP_PORT=3000

# Shopify Configuration
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_discounts,read_customers
SHOPIFY_APP_URL=https://your-app-domain.com
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=postgresql://username:password@host:5432/loyalty_quests_production

# Redis/BullMQ
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
BULLMQ_MAX_RETRIES=3
BULLMQ_BACKOFF_DELAY=5000

# Security
JWT_SECRET=your_secure_random_jwt_secret_min_32_chars
SESSION_SECRET=your_secure_random_session_secret

# Features
ENABLE_WEBHOOK_AUTOMATION=true
ENABLE_ANALYTICS=true

# Logging
LOG_LEVEL=info
```

### 2. Generate Secure Secrets

Generate secure random strings for JWT and session secrets:

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Provision PostgreSQL Database

**Option A: Managed Database (Recommended)**
- AWS RDS PostgreSQL
- Google Cloud SQL
- DigitalOcean Managed Databases
- Railway PostgreSQL
- Supabase

**Option B: Self-Hosted**
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE loyalty_quests_production;
CREATE USER loyalty_app WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE loyalty_quests_production TO loyalty_app;
\q
```

### 2. Run Database Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://username:password@host:5432/loyalty_quests_production"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:deploy

# Verify schema
npm run prisma:studio
```

### 3. Database Backup Strategy

Set up automated backups:

```bash
# Daily backup script (example for AWS RDS)
aws rds create-db-snapshot \
  --db-instance-identifier loyalty-quests-prod \
  --db-snapshot-identifier loyalty-quests-backup-$(date +%Y%m%d)

# For self-hosted PostgreSQL
pg_dump -U loyalty_app loyalty_quests_production > backup_$(date +%Y%m%d).sql
```

---

## Redis Setup

### 1. Provision Redis Instance

**Option A: Managed Redis (Recommended)**
- AWS ElastiCache
- Google Cloud Memorystore
- Redis Cloud
- Upstash Redis
- Railway Redis

**Option B: Self-Hosted**
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis
```

### 2. Test Redis Connection

```bash
# Test connection
redis-cli -h your-redis-host -p 6379 -a your-redis-password ping
# Should return: PONG
```

---

## Application Deployment

### Deployment Option 1: Docker (Recommended)

#### 1. Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Build frontend
RUN npm run build:frontend

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/web/dist ./dist/web
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
      - SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=loyalty_quests
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 3. Deploy with Docker

```bash
# Build image
docker build -t loyalty-quests-app .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Deployment Option 2: Platform as a Service

#### Heroku Deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create loyalty-quests-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SHOPIFY_API_KEY=your_key
heroku config:set SHOPIFY_API_SECRET=your_secret
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set SESSION_SECRET=your_session_secret

# Add Procfile
echo "web: npm run start" > Procfile
echo "worker: npm run workers" >> Procfile

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:migrate:deploy

# Scale workers
heroku ps:scale worker=1
```

#### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to project
railway link

# Add PostgreSQL and Redis
railway add --plugin postgresql
railway add --plugin redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set SHOPIFY_API_KEY=your_key
railway variables set SHOPIFY_API_SECRET=your_secret

# Deploy
railway up

# Run migrations
railway run npm run prisma:migrate:deploy
```

#### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init loyalty-quests-app --region us-east-1

# Create environment
eb create production-env

# Set environment variables
eb setenv NODE_ENV=production \
  SHOPIFY_API_KEY=your_key \
  SHOPIFY_API_SECRET=your_secret \
  DATABASE_URL=your_database_url \
  REDIS_HOST=your_redis_host

# Deploy
eb deploy

# View logs
eb logs
```

### Deployment Option 3: VPS/Cloud Server

```bash
# 1. Connect to server
ssh user@your-server-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 process manager
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/yourusername/loyalty-quests-shopify-app.git
cd loyalty-quests-shopify-app

# 5. Install dependencies
npm ci --only=production

# 6. Build application
npm run build
npm run build:frontend

# 7. Generate Prisma client
npx prisma generate

# 8. Run migrations
npx prisma migrate deploy

# 9. Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'loyalty-quests-api',
      script: './dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'loyalty-quests-workers',
      script: './dist/workers/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# 10. Start with PM2
pm2 start ecosystem.config.js

# 11. Setup PM2 to start on boot
pm2 startup
pm2 save

# 12. View logs
pm2 logs
```

---

## Shopify Partner Configuration

### 1. Create Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Navigate to **Apps** > **Create App** > **Create app manually**
3. Enter app details:
   - **App name**: Loyalty Quests
   - **App URL**: `https://your-app-domain.com`
   - **Allowed redirection URL(s)**: `https://your-app-domain.com/api/auth/callback`

### 2. Configure App Settings

#### App Setup Tab:
- **App URL**: `https://your-app-domain.com`
- **Allowed redirection URL(s)**:
  ```
  https://your-app-domain.com/api/auth/callback
  ```

#### Configuration Tab:
- **OAuth Scopes**: Select required scopes:
  - `read_products`
  - `write_products`
  - `read_orders`
  - `write_discounts`
  - `read_customers`

#### Extensions Tab:
- Skip for now (can add storefront extensions later)

#### Distribution Tab:
- **Distribution method**: Public or Custom
- **Listing details**: Fill in app description, screenshots, privacy policy

### 3. Copy API Credentials

From the **Overview** tab, copy:
- **API key** → Set as `SHOPIFY_API_KEY`
- **API secret key** → Set as `SHOPIFY_API_SECRET`

### 4. Configure Webhooks

Webhooks are automatically registered by the app, but verify in Shopify Partner dashboard:

- `APP_UNINSTALLED` → `https://your-app-domain.com/api/webhooks/app/uninstalled`
- `ORDERS_CREATE` → `https://your-app-domain.com/api/webhooks/orders/create`
- `ORDERS_PAID` → `https://your-app-domain.com/api/webhooks/orders/paid`
- `ORDERS_UPDATED` → `https://your-app-domain.com/api/webhooks/orders/updated`

### 5. Set Up GDPR Webhooks (Required for Public Apps)

Add these webhook URLs in **App Setup** > **Compliance**:

```
Customer data request: https://your-app-domain.com/api/webhooks/gdpr/customers/data_request
Customer data erasure: https://your-app-domain.com/api/webhooks/gdpr/customers/redact
Shop data erasure: https://your-app-domain.com/api/webhooks/gdpr/shop/redact
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
# Test health endpoint
curl https://your-app-domain.com/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T12:00:00.000Z",
#   "environment": "production",
#   "version": "0.1.0"
# }
```

### 2. Test OAuth Flow

1. Install app on development store:
   ```
   https://your-app-domain.com/api/auth?shop=your-dev-store.myshopify.com
   ```

2. Verify OAuth callback redirects correctly
3. Check database for shop record:
   ```sql
   SELECT * FROM "Shop" WHERE "shopDomain" = 'your-dev-store.myshopify.com';
   ```

### 3. Test Webhook Delivery

1. Create a test order in your dev store
2. Check application logs for webhook receipt
3. Verify BullMQ job processing:
   ```bash
   # Using Redis CLI
   redis-cli -h your-redis-host -p 6379 -a your-password
   KEYS bull:*
   ```

### 4. Test Admin UI

1. Navigate to `https://your-app-domain.com/?shop=your-dev-store.myshopify.com`
2. Verify Polaris UI loads correctly
3. Test creating a quest
4. Test viewing analytics dashboard

### 5. Monitor Logs

```bash
# Docker
docker-compose logs -f app

# PM2
pm2 logs loyalty-quests-api

# Heroku
heroku logs --tail

# Railway
railway logs
```

---

## Monitoring & Maintenance

### 1. Set Up Application Monitoring

**Recommended Tools:**
- **New Relic** - Full APM and monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Infrastructure monitoring

**Example: Sentry Integration**

```bash
npm install @sentry/node @sentry/tracing
```

```typescript
// src/index.ts
import * as Sentry from '@sentry/node';

if (config.app.isProduction) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}
```

### 2. Set Up Database Monitoring

```sql
-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor connection pool
SELECT count(*) FROM pg_stat_activity;
```

### 3. Set Up Redis Monitoring

```bash
# Monitor Redis memory
redis-cli -h your-host -p 6379 -a your-password INFO memory

# Monitor queue lengths
redis-cli -h your-host -p 6379 -a your-password
LLEN bull:order-processing:wait
LLEN bull:reward-issuance:wait
```

### 4. Set Up Alerts

Configure alerts for:
- HTTP 5xx errors > 10/minute
- Database connection failures
- Redis connection failures
- Queue job failure rate > 5%
- Memory usage > 80%
- CPU usage > 80%
- Response time > 2 seconds

### 5. Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check queue processing status
- Verify webhook delivery rates

**Weekly:**
- Review database performance
- Check disk space usage
- Analyze slow query logs

**Monthly:**
- Database vacuum and analyze
- Review and rotate logs
- Security updates for dependencies
- Review API rate limits

---

## Rollback Procedures

### 1. Application Rollback

**Docker:**
```bash
# Rollback to previous image
docker tag loyalty-quests-app:latest loyalty-quests-app:backup
docker pull loyalty-quests-app:v1.0.0
docker-compose up -d
```

**Heroku:**
```bash
# List releases
heroku releases

# Rollback to specific release
heroku rollback v42
```

**PM2:**
```bash
# Pull previous version from git
git checkout v1.0.0
npm ci
npm run build
pm2 restart all
```

### 2. Database Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back 20240115_migration_name

# Restore from backup
psql -U loyalty_app -d loyalty_quests_production < backup_20240115.sql
```

### 3. Emergency Shutdown

```bash
# Stop application immediately
pm2 stop all

# Or with Docker
docker-compose down

# Or with Heroku
heroku maintenance:on
```

---

## Security Checklist

- [ ] SSL/TLS certificate installed and valid
- [ ] Environment variables secured (not in code)
- [ ] Database credentials rotated
- [ ] Redis password set
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet.js middleware active
- [ ] JWT secrets are strong (32+ chars)
- [ ] Webhook HMAC verification enabled
- [ ] Database backups automated
- [ ] Logs don't contain sensitive data
- [ ] Dependencies updated and audited (`npm audit`)
- [ ] GDPR compliance webhooks configured
- [ ] Privacy policy and terms of service published

---

## Troubleshooting

### Issue: OAuth redirect fails

**Solution:**
1. Verify `SHOPIFY_APP_URL` matches your domain exactly
2. Check Shopify Partner dashboard redirect URLs
3. Ensure SSL certificate is valid

### Issue: Webhooks not received

**Solution:**
1. Verify webhook URLs are publicly accessible
2. Check HMAC verification is working
3. Review Shopify webhook delivery logs in Partner dashboard
4. Ensure `SHOPIFY_WEBHOOK_SECRET` is correct

### Issue: Database connection errors

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database server is running
3. Verify firewall allows connections
4. Check Prisma connection pool settings

### Issue: Redis connection errors

**Solution:**
1. Verify Redis server is running
2. Check `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
3. Test connection: `redis-cli -h host -p port -a password ping`

### Issue: High memory usage

**Solution:**
1. Check for memory leaks in workers
2. Reduce BullMQ concurrency
3. Implement Redis maxmemory policy
4. Scale horizontally (add more instances)

---

## Support & Resources

- **Shopify Developer Docs**: https://shopify.dev/docs
- **Shopify Partners**: https://partners.shopify.com/
- **App Distribution**: https://shopify.dev/docs/apps/distribution
- **Webhook Topics**: https://shopify.dev/docs/api/admin-rest/webhooks

---

## Next Steps After Deployment

1. Test app installation on multiple stores
2. Monitor performance and error rates
3. Gather merchant feedback
4. Submit app for Shopify App Store review (if public)
5. Set up analytics and usage tracking
6. Create onboarding documentation for merchants
7. Build storefront theme extension (optional)
8. Add email notifications for quest completions

---

**Deployment Checklist Complete!** Your Loyalty Quests app should now be live and accessible to Shopify merchants.
