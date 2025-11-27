# Railway Deployment Setup Guide

This guide walks you through deploying the Loyalty Quests Shopify app to Railway.

---

## Prerequisites

- Railway account (sign up at https://railway.app)
- Railway CLI installed (optional, for command-line deployment)
- GitHub repository connected to Railway
- Shopify app credentials

---

## Step 1: Create Railway Project

### Option A: Using Railway Dashboard

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository: `gysanyi950113/loyalty-quests-shopify-app`
4. Select branch: `develop`
5. Click "Deploy Now"

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project (if already created)
railway link
```

---

## Step 2: Configure Environment Variables

Railway requires all environment variables to be set in the dashboard. Here are the **required** variables:

### Required Variables

Navigate to your Railway project → Variables tab and add these:

#### Application Configuration
```
NODE_ENV=production
APP_URL=https://your-app.railway.app
HOST=0.0.0.0
PORT=3000
```

**Important:** Replace `your-app.railway.app` with your actual Railway domain. You can find this in:
- Railway Dashboard → Settings → Domains
- Or it will be automatically generated after first deployment

#### Shopify Configuration
```
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_discounts,write_discounts
```

Get these from your Shopify Partner Dashboard:
1. Go to https://partners.shopify.com/
2. Navigate to Apps
3. Select your app
4. Copy API key and API secret

#### Database Configuration
```
DATABASE_URL=postgresql://user:password@host:port/database
```

Railway provides managed PostgreSQL:
1. In Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically set `DATABASE_URL` variable
3. Verify it appears in Variables tab

#### Redis Configuration
```
REDIS_URL=redis://default:password@host:port
```

Railway provides managed Redis:
1. In Railway project, click "New" → "Database" → "Add Redis"
2. Railway will automatically set `REDIS_URL` variable
3. Verify it appears in Variables tab

#### BullMQ Configuration (automatically derived from REDIS_URL)
```
BULLMQ_REDIS_HOST=redis-host-from-railway
BULLMQ_REDIS_PORT=6379
```

**Note:** These are optional if you're using `REDIS_URL`. The app will parse the Redis URL automatically.

#### Security
```
SESSION_SECRET=your-random-32-character-secret-here
```

Generate a secure secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

#### Billing (optional)
```
BILLING_CALLBACK_URL=https://your-app.railway.app/api/billing/callback
```

#### Feature Flags
```
ENABLE_ANALYTICS=true
ENABLE_QUEST_ENGINE=true
ENABLE_REWARD_SYSTEM=true
ENABLE_WEBHOOK_AUTOMATION=true
```

#### Logging
```
LOG_LEVEL=info
DEBUG=false
```

---

## Step 3: Verify Railway Configuration

Check that `railway.json` is properly configured:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "HEROKU",
    "buildCommand": "npm install && npx prisma generate && npm run build:backend"
  },
  "deploy": {
    "startCommand": "npm start",
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

This file is already configured in your repository.

---

## Step 4: Deploy to Railway

### Option A: Automatic Deployment (GitHub)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "fix: add Railway environment configuration"
   git push origin develop
   ```

2. Railway will automatically detect the push and start building
3. Monitor the deployment in Railway Dashboard → Deployments

### Option B: Manual Deployment (Railway CLI)

```bash
# From project root
railway up

# Or deploy specific branch
railway up --branch develop
```

---

## Step 5: Run Database Migrations

After the first deployment, run Prisma migrations:

### Using Railway CLI

```bash
# Connect to Railway project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Generate Prisma client (should already be done in build)
railway run npx prisma generate
```

### Using Railway Dashboard

1. Navigate to project → Service
2. Click "Settings" → "Cron Jobs" or use one-time command
3. Run: `npx prisma migrate deploy`

---

## Step 6: Update Shopify App URLs

After deployment, update your Shopify app configuration with Railway URLs:

1. Go to Shopify Partner Dashboard → Apps → Your App
2. Update **App URL**: `https://your-app.railway.app`
3. Update **Allowed redirection URLs**:
   - `https://your-app.railway.app/api/auth/callback`
   - `https://your-app.railway.app/api/auth/shopify/callback`
4. Save changes

---

## Step 7: Configure Shopify Webhooks

Set up webhooks to point to your Railway app:

### Required Webhooks

In Shopify Partner Dashboard → Apps → Your App → Webhooks:

1. **orders/create**
   - URL: `https://your-app.railway.app/api/webhooks/orders/create`
   - Format: JSON

2. **orders/updated**
   - URL: `https://your-app.railway.app/api/webhooks/orders/updated`
   - Format: JSON

3. **app/uninstalled**
   - URL: `https://your-app.railway.app/api/webhooks/app/uninstalled`
   - Format: JSON

---

## Step 8: Verify Deployment

### Check Deployment Status

1. In Railway Dashboard, verify:
   - ✅ Build completed successfully
   - ✅ Service is running (green status)
   - ✅ No crash loops in logs

### Test the Application

1. Visit your app URL: `https://your-app.railway.app`
2. Expected: Shopify OAuth flow or app dashboard
3. Check Railway logs for any errors:
   ```bash
   railway logs
   ```

### Test Health Endpoint (if you have one)

```bash
curl https://your-app.railway.app/health
```

---

## Troubleshooting

### Issue: "Invalid environment variables: APP_URL Required"

**Solution:** Ensure `APP_URL` is set in Railway Variables:
1. Go to Railway Dashboard → Your Project → Variables
2. Add `APP_URL=https://your-app.railway.app`
3. Replace with your actual Railway domain
4. Redeploy

### Issue: "DATABASE_URL must be a valid URL"

**Solution:** Add PostgreSQL database:
1. Railway Dashboard → New → Database → PostgreSQL
2. Verify `DATABASE_URL` appears in Variables
3. Redeploy

### Issue: "SESSION_SECRET must be at least 32 characters"

**Solution:** Generate and add a proper secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add to Railway Variables → `SESSION_SECRET`

### Issue: Build fails with "npm WARN config production"

**Solution:** This is just a warning, not an error. You can ignore it, or update build command to:
```json
"buildCommand": "npm install --omit=dev && npx prisma generate && npm run build:backend"
```

### Issue: Prisma Client not generated

**Solution:** Ensure build command includes:
```bash
npx prisma generate
```

This is already in `railway.json`.

### Issue: Port binding errors

**Solution:** Ensure your app listens on `process.env.PORT`:
```typescript
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0');
```

---

## Environment Variables Checklist

Before deploying, verify all required variables are set:

- [ ] `NODE_ENV=production`
- [ ] `APP_URL=https://your-app.railway.app`
- [ ] `HOST=0.0.0.0`
- [ ] `PORT=3000`
- [ ] `SHOPIFY_API_KEY` (from Shopify Partner Dashboard)
- [ ] `SHOPIFY_API_SECRET` (from Shopify Partner Dashboard)
- [ ] `SHOPIFY_SCOPES` (permissions list)
- [ ] `DATABASE_URL` (from Railway PostgreSQL)
- [ ] `REDIS_URL` (from Railway Redis, optional)
- [ ] `SESSION_SECRET` (32+ character random string)
- [ ] `BILLING_CALLBACK_URL` (if using billing)
- [ ] Feature flags (`ENABLE_ANALYTICS`, etc.)
- [ ] `LOG_LEVEL=info`

---

## Monitoring & Logs

### View Logs

```bash
# Using Railway CLI
railway logs

# Or tail logs
railway logs --follow
```

### View Logs in Dashboard

1. Railway Dashboard → Your Service
2. Click "Deployments" → Select deployment
3. Click "View Logs"

### Set Up Alerts (Optional)

1. Railway Dashboard → Settings → Notifications
2. Configure alerts for:
   - Deployment failures
   - Service crashes
   - High resource usage

---

## Scaling (Optional)

### Vertical Scaling (More Resources)

1. Railway Dashboard → Settings → Resources
2. Adjust CPU and Memory limits
3. Railway will restart service with new limits

### Horizontal Scaling (More Instances)

Edit `railway.json`:
```json
{
  "deploy": {
    "numReplicas": 2
  }
}
```

**Note:** Requires Railway Pro plan for multiple replicas.

---

## Cost Optimization

### Railway Free Tier Limits
- $5 credit per month
- Enough for development and testing
- Monitor usage in Dashboard → Usage

### Tips to Reduce Costs
1. Use Railway sleep mode for dev environments
2. Enable only required feature flags
3. Set `LOG_LEVEL=warn` in production (less I/O)
4. Use Railway's built-in databases (PostgreSQL, Redis)

---

## Next Steps After Deployment

1. **Test the app** with a development store
2. **Monitor logs** for errors
3. **Set up Shopify webhooks** (Step 7)
4. **Configure billing** (if charging merchants)
5. **Submit app for review** in Shopify Partner Dashboard

---

## Useful Commands

```bash
# View environment variables
railway variables

# Open Railway dashboard
railway open

# Connect to PostgreSQL
railway connect postgres

# Connect to Redis
railway connect redis

# Run a command in Railway environment
railway run [command]

# Deploy current code
railway up
```

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Shopify App Bridge**: https://shopify.dev/docs/api/app-bridge
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

## Summary

You now have:
- ✅ Railway project configured
- ✅ All environment variables set
- ✅ Database and Redis provisioned
- ✅ Automatic deployments from GitHub
- ✅ Shopify app connected to Railway URLs

Your Loyalty Quests app is now deployed on Railway!
