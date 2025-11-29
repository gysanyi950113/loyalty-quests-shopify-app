# Customer-Facing Quest Portal

This document describes the customer-facing quest portal implementation using Shopify App Proxy.

## Overview

The quest portal allows customers to:
- View available quests and their progress
- Track completion percentages in real-time
- See earned rewards and discount codes
- Access quest details and requirements

## Architecture

### Shopify App Proxy

The portal uses [Shopify App Proxy](https://shopify.dev/docs/apps/build/online-store/app-proxies) to serve customer-facing content through the merchant's storefront domain.

**Key Benefits:**
- No CORS issues - content served from merchant's domain
- Automatic customer authentication via Shopify
- Secure HMAC signature verification
- SEO-friendly URLs

### Request Flow

```
Customer visits: https://store.myshopify.com/apps/quests
                          ↓
Shopify forwards to: https://your-app.railway.app/api/proxy/quests
                          ↓
                 (with HMAC signature + customer ID)
                          ↓
              App verifies signature & renders content
```

## Setup Instructions

### 1. Configure App Proxy in Shopify Partners

1. Go to your app in [Shopify Partners Dashboard](https://partners.shopify.com)
2. Navigate to **Configuration** → **App proxy**
3. Enter the following settings:

| Field | Value |
|-------|-------|
| **Subpath prefix** | `apps` |
| **Subpath** | `quests` |
| **Proxy URL** | `https://loyalty-quests-shopify-app-production.up.railway.app/api/proxy` |

4. Click **Save**

### 2. Customer Access URLs

Once configured, customers can access the portal at:

- **Main Quest List**: `https://your-store.myshopify.com/apps/quests`
- **Quest Detail**: `https://your-store.myshopify.com/apps/quests/{quest-id}`
- **JSON API**: `https://your-store.myshopify.com/apps/quests/api/quests`

## Portal Features

### 📊 Stats Dashboard

Displays customer's quest statistics:
- Total active quests available
- Number of completed quests
- Quests currently in progress
- Total rewards earned

**Location**: Top of main quests page
**Template**: `src/views/proxy/quests.ejs:40-57`

### 🎮 Quest Cards

Interactive cards showing each quest:
- Quest name and description
- Status badge (Not Started, In Progress, Completed)
- Progress bar with percentage
- Current vs. target values
- Available rewards count

**Location**: Main grid on quests page
**Template**: `src/views/proxy/quests.ejs:74-110`

### 🎁 Rewards Section

Two sub-sections:

**Available Rewards** - Active discount codes ready to use:
- Quest name that earned the reward
- Discount code (copyable)
- Issue date
- Expiration date (if applicable)

**Reward History** - Past rewards:
- Redeemed rewards with dates
- Expired rewards
- Visual indication of status

**Template**: `src/views/proxy/quests.ejs:114-165`

### 📋 Quest Detail Page

Detailed view of individual quest:
- Large progress visualization
- Motivational messages based on progress
- Quest requirements with icons
- Reward showcase cards
- Quest start/end dates

**Template**: `src/views/proxy/quest-detail.ejs`

## Implementation Details

### File Structure

```
src/
├── api/proxy/
│   └── proxy.routes.ts          # App Proxy route handlers
├── services/customer/
│   └── customer-quest.service.ts # Customer data queries
├── utils/
│   └── app-proxy.ts             # Signature verification
└── views/proxy/
    ├── login-required.html      # Non-authenticated page
    ├── quests.ejs               # Main quest listing
    └── quest-detail.ejs         # Quest detail page
```

### Key Components

#### 1. Signature Verification (`src/utils/app-proxy.ts`)

```typescript
export function verifyAppProxySignature(req: Request): boolean
```

**CRITICAL SECURITY**: Verifies HMAC-SHA256 signature from Shopify to prevent:
- Customer ID spoofing
- Unauthorized data access
- Fraudulent requests

**How it works**:
1. Extracts signature from query params
2. Sorts remaining params alphabetically
3. Computes HMAC using app secret
4. Compares with provided signature

**Reference**: Lines 11-34

#### 2. Customer Quest Service (`src/services/customer/customer-quest.service.ts`)

Provides customer-specific data queries:

```typescript
// Get all quests with customer's progress
async getCustomerQuests(shopId: string, customerId: string)

// Get single quest detail
async getCustomerQuest(shopId: string, questId: string, customerId: string)

// Get customer's rewards
async getCustomerRewards(shopId: string, customerId: string)

// Get customer statistics
async getCustomerStats(shopId: string, customerId: string)
```

**Features**:
- Filters active quests by date range
- Joins customer progress data
- Calculates completion percentages
- Handles missing progress records

**Reference**: Lines 9-246

#### 3. Proxy Routes (`src/api/proxy/proxy.routes.ts`)

Route handlers with middleware:

```typescript
// Middleware: Verify signature + extract shop/customer data
async function verifyAndExtractProxyData(req, res, next)

// Routes:
GET  /                    → Redirect to /quests
GET  /quests              → Main quest listing page
GET  /quests/:id          → Quest detail page
GET  /api/quests          → JSON API for quests
GET  /api/rewards         → JSON API for rewards
GET  /api/stats           → JSON API for statistics
```

**Reference**: Lines 18-205

### Template Engine Setup

The app uses **EJS** (Embedded JavaScript) for server-side rendering:

```typescript
// src/index.ts:18-19
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

**Why EJS?**
- Simple syntax for embedding data
- Server-side rendering (SEO-friendly)
- No client-side framework needed
- Easy to maintain

### Build Process

Templates are copied to `dist/` during build:

```json
// package.json:13
"copy:views": "node -e \"require('fs').cpSync('src/views', 'dist/views', {recursive: true})\""
```

## Security Considerations

### 1. HMAC Signature Verification

**Every request MUST be verified** to prevent:
- Customer impersonation
- Data leakage
- Unauthorized access

```typescript
// All routes use this middleware (src/api/proxy/proxy.routes.ts:18)
async function verifyAndExtractProxyData(req, res, next) {
  if (!verifyAppProxySignature(req)) {
    return res.status(401).send('Invalid signature');
  }
  // ... proceed with request
}
```

### 2. Customer Authentication

- Shopify provides `logged_in_customer_id` query param
- Routes check for logged-in status
- Non-authenticated users see login prompt

```typescript
// src/api/proxy/proxy.routes.ts:74-78
if (!isLoggedIn || !customerId) {
  return res.sendFile(path.join(__dirname, '../../views/proxy/login-required.html'));
}
```

### 3. Shop Validation

- Shop domain extracted from request
- Validated against database
- Ensures quest data matches correct shop

```typescript
// src/api/proxy/proxy.routes.ts:33-42
const shop = await shopService.getShopByDomain(shopDomain);
if (!shop) {
  return res.status(404).send('Shop not found');
}
```

## API Endpoints

### JSON API Routes

For JavaScript-based integrations:

#### GET `/api/proxy/api/quests`

Returns customer's quests with progress.

**Response**:
```json
{
  "quests": [
    {
      "id": "quest-123",
      "name": "First Purchase Quest",
      "description": "Make your first purchase",
      "progress": {
        "status": "IN_PROGRESS",
        "currentValue": 0,
        "targetValue": 1,
        "percentComplete": 0
      },
      "conditions": [...],
      "rewards": [...]
    }
  ]
}
```

**Reference**: `src/api/proxy/proxy.routes.ts:139-157`

#### GET `/api/proxy/api/rewards`

Returns customer's available and redeemed rewards.

**Response**:
```json
{
  "rewards": [
    {
      "id": "reward-456",
      "questName": "First Purchase Quest",
      "rewardType": "DISCOUNT_CODE",
      "discountCode": "WELCOME10",
      "issuedAt": "2025-11-29T10:00:00Z",
      "expiresAt": "2025-12-29T10:00:00Z",
      "isRedeemed": false,
      "isExpired": false
    }
  ]
}
```

**Reference**: `src/api/proxy/proxy.routes.ts:162-180`

#### GET `/api/proxy/api/stats`

Returns customer's overall statistics.

**Response**:
```json
{
  "stats": {
    "totalQuests": 5,
    "completedQuests": 2,
    "inProgressQuests": 1,
    "totalRewards": 3,
    "availableQuests": 3
  }
}
```

**Reference**: `src/api/proxy/proxy.routes.ts:185-203`

## Customization Guide

### Styling

All templates include embedded CSS for easy customization:

**Color Scheme** (Purple Gradient):
- Primary: `#667eea`
- Secondary: `#764ba2`
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**To customize**:
1. Edit `<style>` section in templates
2. Replace color codes with brand colors
3. Modify fonts in `font-family` declarations

### Templates

**Main Quests Page** (`src/views/proxy/quests.ejs`):
- Stats grid: Lines 40-57
- Quest cards: Lines 74-110
- Rewards section: Lines 114-165

**Quest Detail** (`src/views/proxy/quest-detail.ejs`):
- Progress section: Lines 89-143
- Conditions list: Lines 160-183
- Rewards grid: Lines 189-221

**Login Page** (`src/views/proxy/login-required.html`):
- Main content: Lines 64-98

### Adding New Routes

```typescript
// src/api/proxy/proxy.routes.ts

router.get('/custom-route', verifyAndExtractProxyData, async (req: Request, res: Response) => {
  const { shopId, customerId, isLoggedIn } = req as any;

  // Your logic here

  return res.render('proxy/your-template', { data });
});
```

## Testing

### Manual Testing Checklist

1. **Configure App Proxy** in Shopify Partners
2. **Install app** on test store via OAuth
3. **Create test quests** in merchant admin
4. **Log in as customer** on storefront
5. **Visit** `https://your-test-store.myshopify.com/apps/quests`

### Expected Behavior

**Not Logged In**:
- Should see login-required.html page
- Call-to-action to log in

**Logged In (No Quests)**:
- Stats show 0 across the board
- Empty state message: "No active quests available"

**Logged In (With Quests)**:
- Quest cards display with progress
- Stats dashboard populated
- Can click into quest details

**Logged In (With Rewards)**:
- Available rewards section shows discount codes
- Codes are copyable
- Expiration dates displayed

### Debugging

**Check Railway Logs**:
```bash
railway logs --filter "App proxy"
```

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Invalid signature | App Proxy not configured | Configure in Partners Dashboard |
| 404 Shop not found | Shop not installed | Complete OAuth flow first |
| 401 Not logged in | Customer not authenticated | Log in to storefront |
| Empty quests | No active quests | Create quests in merchant admin |

**Enable Debug Logging**:
```typescript
// src/api/proxy/proxy.routes.ts:24-29
logger.warn('Invalid app proxy signature', {
  query: req.query,
});
```

## Performance Considerations

### Database Queries

**Optimized with `Promise.all`**:
```typescript
// src/api/proxy/proxy.routes.ts:81-85
const [quests, stats, rewards] = await Promise.all([
  customerQuestService.getCustomerQuests(shopId, customerId),
  customerQuestService.getCustomerStats(shopId, customerId),
  customerQuestService.getCustomerRewards(shopId, customerId),
]);
```

### Caching Strategy

**Future Enhancement**: Add Redis caching for:
- Quest data (cache for 5 minutes)
- Customer stats (cache for 1 minute)
- Shop lookup (cache for 1 hour)

```typescript
// Example caching implementation
const cacheKey = `customer:${customerId}:quests`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const quests = await customerQuestService.getCustomerQuests(shopId, customerId);
await redis.setex(cacheKey, 300, JSON.stringify(quests)); // 5 min TTL

return quests;
```

## Next Steps

### Theme App Extension Widget

Create a widget that merchants can add to their theme:

**Widget Features**:
- "X away from reward" message
- Progress badge
- Embedded in account page or product pages

**Implementation**: See `docs/THEME_EXTENSION.md` (future)

### Analytics Integration

Track customer engagement:
- Quest views
- Click-through rates
- Reward redemption rates

**Reference**: `src/api/analytics/analytics.routes.ts`

## Resources

- [Shopify App Proxy Documentation](https://shopify.dev/docs/apps/build/online-store/app-proxies)
- [HMAC Signature Verification](https://shopify.dev/docs/apps/build/online-store/app-proxies#verify-proxy-requests)
- [EJS Template Engine](https://ejs.co/)
- [Express.js Documentation](https://expressjs.com/)

## Support

For issues or questions:
- Check Railway logs: `railway logs`
- Review Shopify Partners dashboard App Proxy settings
- Verify signature verification in `src/utils/app-proxy.ts:11`
- Test with Shopify's request signature validator
