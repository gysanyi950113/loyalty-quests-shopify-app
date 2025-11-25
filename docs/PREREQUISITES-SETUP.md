# Prerequisites Setup Guide

Complete guide for setting up all prerequisites needed to deploy the Loyalty Quests Shopify app.

## Table of Contents

1. [Shopify Partner Account](#1-shopify-partner-account)
2. [Domain Name with SSL](#2-domain-name-with-ssl)
3. [Hosting Platform](#3-hosting-platform)
4. [Development Store](#4-development-store)

---

## 1. Shopify Partner Account

A Shopify Partner account is **FREE** and required to create Shopify apps.

### Step-by-Step Setup

#### 1.1 Create Partner Account

1. **Go to Shopify Partners website**
   - Visit: https://partners.shopify.com/signup

2. **Fill in the registration form**
   ```
   Email: your-email@example.com
   Password: [Create a secure password]
   ```

3. **Complete your profile**
   - First Name / Last Name
   - Country
   - Partner type: Select "App Development"

4. **Verify your email**
   - Check your inbox for verification email
   - Click the verification link

5. **Complete partner profile**
   - Business name (can be your name if solo developer)
   - Address (required for payments if you charge for app)
   - Phone number

#### 1.2 Access Partner Dashboard

Once logged in, you'll see:
- **Apps** - Create and manage your apps
- **Stores** - Create development stores for testing
- **Payouts** - Track app revenue (if charging)
- **Learning** - Shopify development resources

#### 1.3 What You Get (All FREE)

✅ Ability to create unlimited Shopify apps
✅ Create development stores for testing (unlimited)
✅ Access to Shopify Admin API
✅ Access to Shopify App Store distribution
✅ Partner support
✅ Development documentation

**Cost:** $0 (100% FREE)

---

## 2. Domain Name with SSL

You need a publicly accessible domain with HTTPS for Shopify OAuth to work.

### Option A: Free Domain + Automatic SSL (Recommended for Development)

#### Railway.app (Easiest - Includes Free Domain + SSL)

1. **Sign up for Railway**
   - Visit: https://railway.app
   - Click "Login" → "Login with GitHub"
   - Authorize Railway to access your GitHub

2. **Deploy your app (later step)**
   - Railway automatically provides:
     - Free subdomain: `your-app-name.up.railway.app`
     - Automatic SSL certificate (HTTPS)
     - No configuration needed!

**Cost:**
- Free tier: $5 of usage credits/month (enough for development)
- Pro: $20/month (unlimited usage)

#### Heroku (Free Domain + SSL Included)

1. **Sign up for Heroku**
   - Visit: https://signup.heroku.com
   - Enter email and create password
   - Verify email

2. **Deploy your app (later step)**
   - Heroku automatically provides:
     - Free subdomain: `your-app-name.herokuapp.com`
     - Automatic SSL certificate (HTTPS)

**Cost:**
- Eco dyno: $5/month per app
- Basic: $7/month per app
- No free tier anymore (as of Nov 2022)

#### Render (Free Tier Available)

1. **Sign up for Render**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Deploy your app**
   - Free subdomain: `your-app-name.onrender.com`
   - Automatic SSL

**Cost:**
- Free tier: Available (apps sleep after 15 min inactivity)
- Starter: $7/month

### Option B: Custom Domain with Free SSL

If you want a professional domain (e.g., `yourbusiness.com`):

#### 2.1 Buy a Domain Name

**Recommended Domain Registrars:**

**Namecheap** (Cheapest)
- Visit: https://www.namecheap.com
- Search for your desired domain
- Cost: $8-15/year (.com domains)
- Click "Add to Cart" → "View Cart" → "Confirm Order"

**Google Domains** (Easy to use)
- Visit: https://domains.google.com
- Search and purchase
- Cost: $12-15/year

**Cloudflare** (Best value)
- Visit: https://www.cloudflare.com/products/registrar/
- Cost: At-cost pricing (~$8-9/year)
- Includes free DNS and CDN

**GoDaddy** (Popular but more expensive)
- Visit: https://www.godaddy.com
- Cost: $15-20/year (watch for renewal prices)

#### 2.2 Get Free SSL Certificate

**Option 1: Use Cloudflare (Easiest - FREE)**

1. **Sign up for Cloudflare**
   - Visit: https://dash.cloudflare.com/sign-up
   - Create free account

2. **Add your domain**
   - Click "Add Site"
   - Enter your domain name
   - Select FREE plan

3. **Update nameservers**
   - Cloudflare will give you 2 nameservers:
     ```
     nameserver1.cloudflare.com
     nameserver2.cloudflare.com
     ```
   - Go to your domain registrar (Namecheap, etc.)
   - Update nameservers to Cloudflare's nameservers
   - Wait 24 hours for DNS propagation

4. **Enable SSL**
   - In Cloudflare dashboard → SSL/TLS
   - Set SSL mode to "Full" or "Full (strict)"
   - SSL certificate is automatically issued (FREE)

5. **Point domain to your server**
   - In Cloudflare → DNS → Records
   - Add an A record:
     ```
     Type: A
     Name: @ (or your-app)
     Content: [Your server IP address]
     Proxy status: Proxied (orange cloud)
     ```

**Option 2: Let's Encrypt with Certbot (FREE)**

For VPS/Cloud server deployments:

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certificate auto-renews every 90 days
```

**Option 3: Platform-Managed SSL**

Most hosting platforms include free SSL:
- **Heroku**: Automatic SSL on custom domains (free)
- **Railway**: Automatic SSL on custom domains (free)
- **Vercel**: Automatic SSL (free)
- **Netlify**: Automatic SSL (free)

### Summary - Domain + SSL Costs

| Option | Domain | SSL | Total/Year |
|--------|--------|-----|------------|
| Railway subdomain | FREE | FREE | $0 |
| Heroku subdomain | FREE | FREE | $0 |
| Custom domain + Cloudflare | $8-15 | FREE | $8-15 |
| Custom domain + Let's Encrypt | $8-15 | FREE | $8-15 |

**Recommendation for Development:** Use Railway or Render's free subdomain with automatic SSL. No cost, no setup needed.

---

## 3. Hosting Platform

You need a server to run your Node.js application.

### Comparison Table

| Platform | Free Tier | Ease | Best For | Database | Redis |
|----------|-----------|------|----------|----------|-------|
| **Railway** | $5 credit/mo | ⭐⭐⭐⭐⭐ | Beginners | ✅ Free | ✅ Free |
| **Render** | Yes (sleeps) | ⭐⭐⭐⭐⭐ | Small apps | ✅ Free | ❌ Paid |
| **Heroku** | No | ⭐⭐⭐⭐ | All sizes | ✅ Paid | ✅ Paid |
| **DigitalOcean** | $200 credit | ⭐⭐⭐ | Scalable | Manual | Manual |
| **AWS** | 12mo free | ⭐⭐ | Enterprise | ✅ Free tier | ✅ Free tier |
| **Vercel** | Yes | ⭐⭐⭐⭐⭐ | Frontend only | ❌ | ❌ |

### Recommended: Railway (Best for This Project)

**Why Railway?**
- ✅ Easiest deployment (GitHub integration)
- ✅ Free PostgreSQL database included
- ✅ Free Redis included
- ✅ Automatic HTTPS with free subdomain
- ✅ $5/month free credits (enough for development)
- ✅ Simple environment variable management
- ✅ Automatic deployments from Git

#### Railway Setup Steps

1. **Create Account**
   ```
   1. Visit https://railway.app
   2. Click "Login" → "Login with GitHub"
   3. Authorize Railway
   ```

2. **Create New Project**
   ```
   1. Click "New Project"
   2. Select "Deploy from GitHub repo"
   3. Connect your loyalty-quests repository
   4. Railway will detect Node.js app automatically
   ```

3. **Add Database**
   ```
   1. In your project, click "New"
   2. Select "Database" → "Add PostgreSQL"
   3. Database URL is automatically added to environment variables
   ```

4. **Add Redis**
   ```
   1. Click "New" → "Database" → "Add Redis"
   2. Redis URL is automatically added to environment variables
   ```

5. **Configure Environment Variables**
   ```
   1. Click on your service
   2. Go to "Variables" tab
   3. Add all required variables (SHOPIFY_API_KEY, etc.)
   ```

6. **Deploy**
   ```
   1. Railway automatically deploys on push to main branch
   2. Get your app URL: Settings → Generate Domain
   ```

**Cost:**
- Free tier: $5 usage credits/month
- After free credits: ~$5-10/month for small app
- No credit card required for free tier

### Alternative: Render (Also Excellent)

#### Render Setup Steps

1. **Create Account**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   ```
   1. Dashboard → New → Web Service
   2. Connect GitHub repository
   3. Configure:
      - Name: loyalty-quests
      - Environment: Node
      - Build Command: npm install && npm run build
      - Start Command: npm start
   ```

3. **Add PostgreSQL**
   ```
   1. Dashboard → New → PostgreSQL
   2. Name: loyalty-quests-db
   3. Copy database URL to your web service env vars
   ```

4. **Add Redis** (requires paid plan)
   ```
   Alternative: Use Upstash Redis (free tier)
   - Visit https://upstash.com
   - Create Redis database
   - Copy connection details
   ```

**Cost:**
- Free tier: Available (sleeps after 15min inactivity)
- Starter: $7/month (no sleep)
- Database: Free tier available

### For Production: DigitalOcean

If you need more control and better performance:

#### DigitalOcean Setup

1. **Create Account**
   - Visit: https://www.digitalocean.com
   - Use this link for $200 credit (60 days): https://try.digitalocean.com/freetrialoffer/

2. **Create Droplet (VPS)**
   ```
   1. Click "Create" → "Droplets"
   2. Choose image: Ubuntu 22.04 LTS
   3. Choose plan: Basic $6/month (1GB RAM)
   4. Choose datacenter: Closest to your users
   5. Add SSH key (or use password)
   6. Click "Create Droplet"
   ```

3. **Connect to Server**
   ```bash
   ssh root@your-droplet-ip
   ```

4. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs

   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib

   # Install Redis
   apt install -y redis-server

   # Install Nginx (for reverse proxy)
   apt install -y nginx

   # Install PM2
   npm install -g pm2
   ```

5. **Configure Domain**
   - Point your domain to droplet IP
   - Set up Nginx reverse proxy
   - Install SSL with Certbot

**Cost:**
- $6/month (1GB RAM, good for development)
- $12/month (2GB RAM, recommended for production)
- + $15/year for managed PostgreSQL (optional)

---

## 4. Development Store (For Testing)

You need a Shopify store to test your app.

### Create Free Development Store

1. **Go to Partner Dashboard**
   - Visit: https://partners.shopify.com
   - Login to your partner account

2. **Create Development Store**
   ```
   1. Click "Stores" in left menu
   2. Click "Add store"
   3. Select "Create development store"
   ```

3. **Fill in Store Details**
   ```
   Store name: loyalty-quests-test (or any name)
   Store URL: loyalty-quests-test.myshopify.com
   Store password: [Create password]
   Purpose: Choose "Test an app"
   ```

4. **Complete Setup**
   - Click "Create development store"
   - Wait 1-2 minutes for store to be created

5. **Access Your Store**
   ```
   Admin URL: https://loyalty-quests-test.myshopify.com/admin
   Storefront: https://loyalty-quests-test.myshopify.com
   ```

### What You Get (FREE)

✅ Full Shopify store for testing
✅ All Shopify features enabled
✅ No time limit
✅ No credit card required
✅ Can process test orders
✅ Can install your app for testing

**Limitations:**
- Cannot process real payments
- Cannot transfer ownership
- Only for testing purposes

---

## Quick Start Recommendation

**For absolute beginners or development:**

1. ✅ **Shopify Partner Account** → https://partners.shopify.com/signup (FREE)
2. ✅ **Hosting** → Railway.app (FREE $5 credits/month)
   - Includes: Free domain, SSL, PostgreSQL, Redis
3. ✅ **Development Store** → Create in Partner Dashboard (FREE)

**Total cost: $0 for development and testing**

**For production (when you're ready to launch):**

1. ✅ **Custom domain** → Namecheap (~$10/year)
2. ✅ **SSL** → Cloudflare (FREE)
3. ✅ **Hosting** → Railway Pro ($20/month) or DigitalOcean ($12/month)
4. ✅ **Database/Redis** → Included with Railway or separate services

**Total cost: ~$10-32/month for production**

---

## Next Steps After Setup

Once you have all prerequisites:

1. ✅ Create Shopify Partner account
2. ✅ Create development store
3. ✅ Sign up for Railway
4. ✅ Deploy your app
5. ✅ Configure environment variables
6. ✅ Create Shopify app in Partner Dashboard
7. ✅ Install app on development store
8. ✅ Test the app

Follow the main [DEPLOYMENT.md](../DEPLOYMENT.md) guide for detailed deployment steps.

---

## Frequently Asked Questions

### Q: Do I need a credit card to start?
**A:** No! Railway and Render offer free tiers without credit card. Shopify Partner account is free.

### Q: Can I use a free domain?
**A:** Railway and Heroku provide free subdomains with SSL. Perfect for development.

### Q: How much does it cost to run in production?
**A:** Minimum ~$10-20/month for a small app with custom domain, hosting, and database.

### Q: Do I need to know Linux/DevOps?
**A:** No! Use Railway or Render for deployment - they handle all infrastructure.

### Q: Can I develop locally without deploying?
**A:** Partially. Shopify OAuth requires a public HTTPS URL, but you can use ngrok for local testing:
```bash
npm install -g ngrok
ngrok http 3000
# Use the ngrok HTTPS URL for Shopify app URL
```

### Q: What if I exceed Railway's free credits?
**A:** Your app will pause. Upgrade to Pro ($20/month) or switch to another platform.

### Q: Can I change hosting platforms later?
**A:** Yes! Your app is portable. Just redeploy to a new platform and update Shopify app URLs.

---

## Support Resources

- **Shopify Partners**: https://partners.shopify.com
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Cloudflare Docs**: https://developers.cloudflare.com
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials

---

**Ready to deploy?** Follow the [DEPLOYMENT.md](../DEPLOYMENT.md) guide next.
