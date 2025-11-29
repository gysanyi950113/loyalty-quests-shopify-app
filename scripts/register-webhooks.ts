import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { config } from '../src/config/environment';

const shopify = shopifyApi({
  apiKey: config.shopify.apiKey,
  apiSecretKey: config.shopify.apiSecret,
  scopes: config.shopify.scopes,
  hostName: new URL(config.app.url).hostname,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});

const WEBHOOKS_TO_REGISTER = [
  {
    topic: 'APP_UNINSTALLED',
    path: '/api/webhooks/app/uninstalled',
  },
  {
    topic: 'ORDERS_CREATE',
    path: '/api/webhooks/orders/create',
  },
  {
    topic: 'ORDERS_PAID',
    path: '/api/webhooks/orders/paid',
  },
  {
    topic: 'ORDERS_UPDATED',
    path: '/api/webhooks/orders/updated',
  },
];

async function registerWebhooks(shop: string, accessToken: string) {
  console.log(`\n🔗 Registering webhooks for shop: ${shop}\n`);

  const session = shopify.session.customAppSession(shop);
  session.accessToken = accessToken;

  for (const webhook of WEBHOOKS_TO_REGISTER) {
    try {
      const response = await shopify.rest.Webhook.create({
        session,
        topic: webhook.topic,
        address: `${config.app.url}${webhook.path}`,
        format: 'json',
      });

      console.log(`✅ Registered: ${webhook.topic}`);
      console.log(`   URL: ${config.app.url}${webhook.path}`);
    } catch (error: any) {
      console.error(`❌ Failed to register ${webhook.topic}:`, error.message);
    }
  }

  console.log('\n✨ Webhook registration complete!\n');
}

// Usage: ts-node scripts/register-webhooks.ts <shop-domain> <access-token>
const shop = process.argv[2];
const accessToken = process.argv[3];

if (!shop || !accessToken) {
  console.error('Usage: npm run register-webhooks <shop-domain> <access-token>');
  console.error('Example: npm run register-webhooks mystore.myshopify.com shpat_xxxxx');
  process.exit(1);
}

registerWebhooks(shop, accessToken).catch(console.error);
