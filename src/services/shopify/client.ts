import { ApiVersion, shopifyApi, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { config } from '../../config/environment';
import { logger } from '../../utils/logger';

// Initialize Shopify API
export const shopify = shopifyApi({
  apiKey: config.shopify.apiKey,
  apiSecretKey: config.shopify.apiSecret,
  scopes: config.shopify.scopes,
  hostName: new URL(config.app.url).hostname,
  hostScheme: config.app.isProduction ? 'https' : 'http',
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: false,
  logger: {
    level: config.app.isDevelopment ? 0 : 2, // Debug in dev, Error in prod
    log: async (severity, message) => {
      const logMessage = typeof message === 'string' ? message : JSON.stringify(message);
      switch (severity) {
        case 0: // Debug
          logger.debug(`[Shopify] ${logMessage}`);
          break;
        case 1: // Info
          logger.info(`[Shopify] ${logMessage}`);
          break;
        case 2: // Warning
          logger.warn(`[Shopify] ${logMessage}`);
          break;
        case 3: // Error
          logger.error(`[Shopify] ${logMessage}`);
          break;
      }
    },
  },
});

/**
 * Create a Shopify REST client for a specific shop
 */
export function createShopifyClient(shop: string, accessToken: string) {
  const session = new Session({
    id: shop,
    shop,
    state: 'active',
    isOnline: false,
    accessToken,
    scope: config.shopify.scopes.join(','),
  });
  return new shopify.clients.Rest({ session });
}

/**
 * Create a Shopify GraphQL client for a specific shop
 */
export function createShopifyGraphQLClient(shop: string, accessToken: string) {
  const session = new Session({
    id: shop,
    shop,
    state: 'active',
    isOnline: false,
    accessToken,
    scope: config.shopify.scopes.join(','),
  });
  return new shopify.clients.Graphql({ session });
}

export type ShopifyRestClient = ReturnType<typeof createShopifyClient>;
export type ShopifyGraphQLClient = ReturnType<typeof createShopifyGraphQLClient>;
