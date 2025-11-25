# Quick Start Checklist - Get Your App Running in 30 Minutes

Simple step-by-step checklist to deploy your Loyalty Quests Shopify app with zero hassle.

---

## ✅ Prerequisites Checklist

### On Your Computer (5 minutes)

- [ ] **Node.js 20+ installed**
  ```bash
  # Check if you have it:
  node --version

  # Should show: v20.x.x or higher
  # If not, download from: https://nodejs.org
  ```

- [ ] **Git installed**
  ```bash
  # Check if you have it:
  git --version

  # Should show: git version x.x.x
  # If not, download from: https://git-scm.com
  ```

- [ ] **Code editor** (you already have this)
  - VS Code, or any editor

**That's all you need on your computer!**

---

## 🚀 Deployment Checklist

### Step 1: Create Free Accounts (10 minutes)

- [ ] **Shopify Partner Account** (100% FREE)
  1. Go to: https://partners.shopify.com/signup
  2. Enter email and password
  3. Verify email
  4. Complete profile (choose "App Development")
  5. ✅ Done!

- [ ] **Railway Account** (FREE - $5 credits/month)
  1. Go to: https://railway.app
  2. Click "Login" → "Login with GitHub"
  3. Authorize Railway
  4. ✅ Done! (No credit card needed)

- [ ] **GitHub Account** (if you don't have one)
  1. Go to: https://github.com/signup
  2. Create account
  3. ✅ Done!

---

### Step 2: Push Code to GitHub (5 minutes)

- [ ] **Check current branch**
  ```bash
  git status
  # You should be on: feature/analytics-dashboard
  ```

- [ ] **Merge to develop branch**
  ```bash
  # Switch to develop
  git checkout develop

  # Merge analytics dashboard
  git merge feature/analytics-dashboard

  # Push to GitHub
  git push origin develop
  ```

- [ ] **Verify on GitHub**
  - Go to: https://github.com/gysanyi950113/loyalty-quests-shopify-app
  - Check that your code is there
  - ✅ Done!

---

### Step 3: Deploy to Railway (10 minutes)

- [ ] **Create new project on Railway**
  1. Login to Railway: https://railway.app
  2. Click "New Project"
  3. Select "Deploy from GitHub repo"
  4. Choose: `loyalty-quests-shopify-app`
  5. Railway will start deploying (wait 2-3 minutes)

- [ ] **Add PostgreSQL database**
  1. In your Railway project, click "New"
  2. Select "Database" → "Add PostgreSQL"
  3. Wait for database to provision (~30 seconds)
  4. ✅ Database URL is automatically added to your app

- [ ] **Add Redis**
  1. Click "New" → "Database" → "Add Redis"
  2. Wait for Redis to provision (~30 seconds)
  3. ✅ Redis URL is automatically added to your app

- [ ] **Generate app domain**
  1. Click on your app service (not database)
  2. Go to "Settings" tab
  3. Scroll to "Domains"
  4. Click "Generate Domain"
  5. Copy your domain: `your-app-name.up.railway.app`
  6. ✅ Save this - you'll need it!

---

### Step 4: Configure Environment Variables (5 minutes)

- [ ] **Set environment variables in Railway**
  1. Click on your app service
  2. Go to "Variables" tab
  3. Click "Raw Editor"
  4. Paste this (fill in the values):

  ```bash
  # Application
  NODE_ENV=production
  APP_HOST=0.0.0.0
  APP_PORT=3000

  # Shopify (we'll fill these in next step)
  SHOPIFY_API_KEY=your_api_key_here
  SHOPIFY_API_SECRET=your_api_secret_here
  SHOPIFY_SCOPES=read_products,write_products,read_orders,write_discounts,read_customers
  SHOPIFY_APP_URL=https://your-app-name.up.railway.app
  SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

  # Security (generate random strings)
  JWT_SECRET=generate_random_32_character_string_here
  SESSION_SECRET=another_random_32_character_string_here

  # Features
  ENABLE_WEBHOOK_AUTOMATION=true
  ENABLE_ANALYTICS=true

  # Logging
  LOG_LEVEL=info
  ```

- [ ] **Generate secure secrets**
  ```bash
  # Run these on your computer to generate random strings:

  # For JWT_SECRET:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

  # For SESSION_SECRET:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

  # Copy the outputs and paste into Railway variables
  ```

- [ ] **Update SHOPIFY_APP_URL**
  - Replace `your-app-name.up.railway.app` with your actual Railway domain
  - Save variables

---

### Step 5: Create Shopify App (10 minutes)

- [ ] **Create app in Partner Dashboard**
  1. Go to: https://partners.shopify.com
  2. Click "Apps" → "Create app" → "Create app manually"
  3. Enter:
     - **App name**: Loyalty Quests
     - Click "Create"

- [ ] **Configure app URLs**
  1. Go to "Configuration" tab
  2. Set **App URL**: `https://your-app-name.up.railway.app`
  3. Set **Allowed redirection URL**: `https://your-app-name.up.railway.app/api/auth/callback`
  4. Click "Save"

- [ ] **Configure OAuth scopes**
  1. In "Configuration" → "App scopes"
  2. Select these scopes:
     - ✅ `read_products`
     - ✅ `write_products`
     - ✅ `read_orders`
     - ✅ `write_discounts`
     - ✅ `read_customers`
  3. Click "Save"

- [ ] **Get API credentials**
  1. Go to "Overview" tab
  2. Copy **API key** → This is your `SHOPIFY_API_KEY`
  3. Click "API secret key" → Copy it → This is your `SHOPIFY_API_SECRET`
  4. Update these in Railway environment variables

- [ ] **Update Railway variables with Shopify credentials**
  1. Go back to Railway
  2. Update `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`
  3. Railway will automatically redeploy (~2 minutes)

---

### Step 6: Create Development Store (5 minutes)

- [ ] **Create test store**
  1. In Shopify Partners, click "Stores"
  2. Click "Add store" → "Create development store"
  3. Enter:
     - **Store name**: loyalty-quests-test (or any name)
     - **URL**: loyalty-quests-test.myshopify.com
     - **Password**: [create a password]
     - **Purpose**: Test an app
  4. Click "Create development store"
  5. Wait 1-2 minutes

- [ ] **Save store credentials**
  ```
  Admin URL: https://loyalty-quests-test.myshopify.com/admin
  Password: [your password]
  ```

---

### Step 7: Install App & Test (5 minutes)

- [ ] **Install app on dev store**
  1. Open browser
  2. Go to: `https://your-app-name.up.railway.app/api/auth?shop=loyalty-quests-test.myshopify.com`
  3. Click "Install app"
  4. Approve permissions
  5. ✅ You should see the admin UI!

- [ ] **Verify installation**
  - [ ] Admin UI loads
  - [ ] Can see "Quests" page
  - [ ] Can see "Analytics" page

- [ ] **Create test quest**
  1. Click "Create Quest" button
  2. Enter:
     - Quest name: "First 3 Orders"
     - Target orders: 3
     - Discount: 10%
  3. Click "Create"
  4. ✅ Quest created successfully!

- [ ] **Test order webhook (optional)**
  1. Go to your dev store admin
  2. Create a test order
  3. Check Railway logs to see webhook received

---

## 🎉 Success Checklist

You're done when you can check all these:

- [x] App is live on Railway
- [x] PostgreSQL and Redis are running
- [x] App has HTTPS domain
- [x] Shopify app is created
- [x] App is installed on dev store
- [x] Can access admin UI
- [x] Can create quests
- [x] Can view analytics

---

## 📋 Quick Reference

**Your Important URLs:**

```
Railway App: https://railway.app/project/[your-project-id]
App URL: https://your-app-name.up.railway.app
Shopify Partners: https://partners.shopify.com
Dev Store Admin: https://loyalty-quests-test.myshopify.com/admin

Install URL: https://your-app-name.up.railway.app/api/auth?shop=loyalty-quests-test.myshopify.com
```

**Your Credentials to Keep Safe:**

```
SHOPIFY_API_KEY=xxxxxxx
SHOPIFY_API_SECRET=xxxxxxx
JWT_SECRET=xxxxxxx
SESSION_SECRET=xxxxxxx
Dev Store Password=xxxxxxx
```

---

## 🐛 Troubleshooting

### App won't install
- [ ] Check Railway deployment status (should be "Active")
- [ ] Verify `SHOPIFY_APP_URL` matches your Railway domain exactly
- [ ] Check Railway logs for errors

### Database connection error
- [ ] Verify PostgreSQL is running in Railway
- [ ] Check that `DATABASE_URL` is automatically set
- [ ] Check Railway logs

### OAuth redirect error
- [ ] Verify "Allowed redirection URL" in Shopify app settings
- [ ] Must be: `https://your-app-name.up.railway.app/api/auth/callback`
- [ ] Must match exactly (including https://)

### Environment variables not working
- [ ] Click "Redeploy" in Railway after changing variables
- [ ] Wait 2-3 minutes for redeployment

---

## 🆘 Need Help?

**View Railway Logs:**
1. Go to Railway project
2. Click on your app service
3. Click "Deployments" tab
4. Click latest deployment
5. View logs in real-time

**Test Health Check:**
```bash
curl https://your-app-name.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "environment": "production"
}
```

---

## ✨ Next Steps (After Everything Works)

Once your app is running:

1. **Test quest flow**
   - Create quests with different conditions
   - Place test orders in dev store
   - Verify rewards are issued

2. **Test analytics**
   - View analytics dashboard
   - Check quest performance metrics

3. **Customize**
   - Add more quest types
   - Add custom reward types
   - Customize UI

4. **Prepare for production**
   - Get custom domain (optional)
   - Set up monitoring
   - Add error tracking (Sentry)
   - Submit to Shopify App Store

---

**Total Time:** ~30-40 minutes from start to finish

**Total Cost:** $0 (FREE with Railway credits)

**Stuck?** Check the detailed guides:
- [Prerequisites Setup Guide](./PREREQUISITES-SETUP.md)
- [Full Deployment Guide](../DEPLOYMENT.md)
