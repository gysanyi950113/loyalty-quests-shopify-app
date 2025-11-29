# Shopify Integration Guide

Complete guide to integrate your Loyalty Quests app with Shopify.

## 🎯 Quick Start Checklist

- [ ] Configure Shopify Partners Dashboard
- [ ] Install app on development store
- [ ] Register webhooks
- [ ] Configure App Proxy for customer portal
- [ ] Test quest creation and order tracking
- [ ] Configure production billing (optional)

---

## 📖 Documentation

- **[Customer Portal Guide](docs/CUSTOMER_PORTAL.md)** - Customer-facing quest portal setup and customization
- **[Webhook Integration](docs/WEBHOOKS.md)** - Webhook handling and processing (future)
- **[Theme Extension](docs/THEME_EXTENSION.md)** - Theme app extension widget (future)

---

## 📋 Prerequisites

✅ Railway deployment running: https://loyalty-quests-shopify-app-production.up.railway.app
✅ Shopify Partners account
✅ Shopify development store

---

## 🔧 Step 1: Configure Shopify Partners Dashboard

### App Setup

1. **Go to Shopify Partners**
   - Visit: https://partners.shopify.com/
   - Navigate to **Apps**

2. **Create or Select Your App**
   - If new: Click **Create app** → **Create app manually**
   - Name: "Loyalty Quests" (or your preferred name)

3. **Configure App URLs**

   In **App setup** → **URLs**:

   | Setting | Value |
   |---------|-------|
   | **App URL** | `https://loyalty-quests-shopify-app-production.up.railway.app` |
   | **Allowed redirection URLs** | `https://loyalty-quests-shopify-app-production.up.railway.app/api/auth/callback` |

4. **Configure API Scopes**

   In **Configuration** → **App API**:
   ```
   read_customers
   write_customers
   read_orders
   write_orders
   read_products
   read_discounts
   write_discounts
   read_price_rules
   write_price_rules
   ```

### App Proxy Setup (For Customer Portal)

5. **Configure App Proxy**

   In **Configuration** → **App proxy**:

   | Setting | Value |
   |---------|-------|
   | **Subpath prefix** | `apps` |
   | **Subpath** | `quests` |
   | **Proxy URL** | `https://loyalty-quests-shopify-app-production.up.railway.app/api/proxy` |

   This allows customers to access their quests at:
   `https://your-store.myshopify.com/apps/quests`

   📖 See **[Customer Portal Guide](docs/CUSTOMER_PORTAL.md)** for detailed setup and customization.

---

## 🏪 Step 2: Install App on Development Store

### Option A: Via Partners Dashboard

1. In your app settings, go to **Test your app**
2. Select your development store
3. Click **Install app**
4. Authorize the permissions

### Option B: Direct Installation URL

Replace `[YOUR-STORE]` with your store name and visit:

```
https://[YOUR-STORE].myshopify.com/admin/oauth/authorize?client_id=cef9766153e3d9728290880340cb2e33&scope=read_customers,write_customers,read_orders,write_orders,read_products,read_discounts,write_discounts,read_price_rules,write_price_rules&redirect_uri=https://loyalty-quests-shopify-app-production.up.railway.app/api/auth/callback
```

---

## 🔗 Step 3: Register Webhooks

Your app needs webhooks to track customer activities and order events.

### Webhooks to Register

| Topic | URL | Purpose |
|-------|-----|---------|
| `app/uninstalled` | `https://loyalty-quests-shopify-app-production.up.railway.app/api/webhooks/app/uninstalled` | Clean up when app is removed |
| `orders/create` | `https://loyalty-quests-shopify-app-production.up.railway.app/api/webhooks/orders/create` | Track new orders |
| `orders/paid` | `https://loyalty-quests-shopify-app-production.up.railway.app/api/webhooks/orders/paid` | Update progress on payment |
| `orders/updated` | `https://loyalty-quests-shopify-app-production.up.railway.app/api/webhooks/orders/updated` | Handle order changes |

### Method 1: Manual Registration (Shopify Dashboard)

1. Go to **Settings** → **Notifications** → **Webhooks**
2. Click **Create webhook**
3. For each webhook above:
   - Select the **Event** (topic)
   - Enter the **URL**
   - Format: **JSON**
   - Click **Save**

### Method 2: Programmatic Registration (Recommended)

After installing the app, get your access token from the database:

```sql
-- In your Railway Postgres database
SELECT * FROM shops WHERE shop_domain = 'your-store.myshopify.com';
```

Then run:

```bash
npm run register-webhooks your-store.myshopify.com shpat_your_access_token
```

---

## 🎮 Step 4: Test Your Integration

### Test Quest Creation

1. **Via API** (Postman/curl):

```bash
curl -X POST https://loyalty-quests-shopify-app-production.up.railway.app/api/quests \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: your-store.myshopify.com" \
  -d '{
    "name": "First Purchase Quest",
    "description": "Make your first purchase to earn points!",
    "type": "ORDER_PLACED",
    "config": {
      "requiredCount": 1
    },
    "rewards": [{
      "type": "POINTS",
      "value": 100
    }],
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z"
  }'
```

2. **Via Database** (Railway Postgres):

```sql
INSERT INTO quests (shop_id, name, description, type, config, rewards, start_date, end_date)
VALUES (
  (SELECT id FROM shops WHERE shop_domain = 'your-store.myshopify.com'),
  'First Purchase Quest',
  'Make your first purchase to earn points!',
  'ORDER_PLACED',
  '{"requiredCount": 1}'::jsonb,
  '[{"type": "POINTS", "value": 100}]'::jsonb,
  '2025-01-01 00:00:00',
  '2025-12-31 23:59:59'
);
```

### Test Order Tracking

1. Go to your Shopify store admin
2. Create a test order: **Orders** → **Create order**
3. Mark it as paid
4. Check Railway logs for webhook processing:

```bash
railway logs --filter "order"
```

5. Verify quest progress in database:

```sql
SELECT * FROM quest_progress WHERE shop_id = (
  SELECT id FROM shops WHERE shop_domain = 'your-store.myshopify.com'
);
```

---

## 🔍 Troubleshooting

### Webhooks Not Receiving Events

1. **Check webhook registration**:
   ```bash
   # In Shopify admin
   Settings → Notifications → Webhooks
   ```

2. **Verify HMAC secret**:
   ```bash
   railway variables | grep SHOPIFY_WEBHOOK_SECRET
   ```

3. **Check Railway logs**:
   ```bash
   railway logs --filter "webhook"
   ```

### Authentication Issues

1. **Verify API credentials**:
   ```bash
   railway variables | grep SHOPIFY_API
   ```

2. **Check app installation**:
   - Go to Shopify admin → **Apps**
   - Verify "Loyalty Quests" is installed

### Database Connection Issues

1. **Check database URL**:
   ```bash
   railway variables | grep DATABASE_URL
   ```

2. **Verify tables exist**:
   ```sql
   \dt  -- List all tables
   ```

---

##Quest Types

Your app supports these quest types:

| Type | Description | Config Options |
|------|-------------|----------------|
| `ORDER_PLACED` | Complete N orders | `requiredCount`, `minOrderValue` |
| `ORDER_VALUE` | Spend $X total | `requiredValue` |
| `PRODUCT_PURCHASE` | Buy specific product | `productId`, `requiredCount` |
| `COLLECTION_PURCHASE` | Buy from collection | `collectionId`, `requiredCount` |
| `CUSTOMER_TAG` | Get tagged | `requiredTag` |
| `REFERRAL` | Refer N friends | `requiredCount` |

---

## 🎁 Reward Types

Available reward types:

| Type | Description | Value Field |
|------|-------------|-------------|
| `POINTS` | Loyalty points | Number of points |
| `DISCOUNT_CODE` | Discount code | Code string |
| `DISCOUNT_PERCENTAGE` | % off discount | Percentage (0-100) |
| `DISCOUNT_FIXED` | Fixed amount off | Amount in cents |
| `FREE_SHIPPING` | Free shipping | N/A |
| `GIFT_PRODUCT` | Free product | Product ID |

---

## 📊 Monitoring

### Check Application Health

```bash
curl https://loyalty-quests-shopify-app-production.up.railway.app/health
```

### View Recent Logs

```bash
railway logs --lines 50
```

### Monitor Workers

```bash
railway logs --filter "worker"
```

---

## 🚀 Next Steps

1. **Create sample quests** for different customer behaviors
2. **Test reward issuance** with test orders
3. **Build admin UI** for quest management
4. **Add analytics** to track quest completion rates
5. **Configure billing** before public release

---

## 📚 API Documentation

### Base URL
```
https://loyalty-quests-shopify-app-production.up.railway.app
```

### Available Endpoints

**Public Endpoints:**
- `GET /health` - Health check
- `GET /` - API info

**Authentication:**
- `GET /api/auth` - Start OAuth flow
- `POST /api/auth/callback` - OAuth callback

**Webhooks:**
- `POST /api/webhooks/app/uninstalled` - App uninstall handler
- `POST /api/webhooks/orders/create` - Order created
- `POST /api/webhooks/orders/paid` - Order paid
- `POST /api/webhooks/orders/updated` - Order updated

**Merchant Admin API:**
- `POST /api/quests` - Create quest
- `GET /api/quests` - List quests
- `GET /api/quests/:id` - Get quest details
- `PUT /api/quests/:id` - Update quest
- `DELETE /api/quests/:id` - Delete quest
- `GET /api/rewards` - List rewards
- `POST /api/rewards/issue` - Issue reward
- `GET /api/analytics` - Get analytics data

**Customer Portal (App Proxy):**
- `GET /api/proxy/quests` - Main quest listing page
- `GET /api/proxy/quests/:id` - Quest detail page
- `GET /api/proxy/api/quests` - JSON API for quests
- `GET /api/proxy/api/rewards` - JSON API for rewards
- `GET /api/proxy/api/stats` - JSON API for stats

📖 See **[Customer Portal Guide](docs/CUSTOMER_PORTAL.md)** for customer-facing endpoints.

---

## 🔐 Security Notes

- ✅ All webhooks verify HMAC signatures
- ✅ OAuth flow validates shop domains
- ✅ API endpoints check shop authentication
- ✅ App Proxy requests verify HMAC signatures (prevents customer ID spoofing)
- ✅ Database credentials secured in Railway
- ✅ Redis password authentication enabled

📖 See **[Customer Portal Guide](docs/CUSTOMER_PORTAL.md#security-considerations)** for App Proxy security details.

---

## 💡 Tips

- Use **development stores** for testing
- Monitor **Railway logs** during initial setup
- Test **webhook delivery** with sample orders
- Keep **Shopify API credentials** secure
- Regularly check **quest completion** metrics

---

## 📞 Support

- Railway Logs: `railway logs`
- Database: `railway run psql $DATABASE_URL`
- GitHub: https://github.com/gysanyi950113/loyalty-quests-shopify-app

