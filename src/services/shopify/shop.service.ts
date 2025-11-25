import { prisma } from '../../utils/prisma';
import { logger } from '../../utils/logger';
import { ShopStatus } from '@prisma/client';
import { createShopifyClient } from './client';

export class ShopService {
  /**
   * Create or update a shop after OAuth installation
   */
  async upsertShop(data: {
    shopDomain: string;
    accessToken: string;
    scope: string;
  }) {
    try {
      const shop = await prisma.shop.upsert({
        where: { shopDomain: data.shopDomain },
        create: {
          shopDomain: data.shopDomain,
          accessToken: data.accessToken, // TODO: Encrypt before storing
          scope: data.scope,
          status: ShopStatus.ACTIVE,
        },
        update: {
          accessToken: data.accessToken, // TODO: Encrypt before storing
          scope: data.scope,
          status: ShopStatus.ACTIVE,
          updatedAt: new Date(),
        },
      });

      logger.info('Shop upserted successfully', {
        shopId: shop.id,
        shopDomain: shop.shopDomain,
      });

      return shop;
    } catch (error) {
      logger.error('Failed to upsert shop', {
        shopDomain: data.shopDomain,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get shop by domain
   */
  async getShopByDomain(shopDomain: string) {
    return prisma.shop.findUnique({
      where: { shopDomain },
    });
  }

  /**
   * Get shop by ID
   */
  async getShopById(shopId: string) {
    return prisma.shop.findUnique({
      where: { id: shopId },
    });
  }

  /**
   * Mark shop as uninstalled
   */
  async markShopUninstalled(shopDomain: string) {
    try {
      const shop = await prisma.shop.update({
        where: { shopDomain },
        data: {
          status: ShopStatus.UNINSTALLED,
          updatedAt: new Date(),
        },
      });

      logger.info('Shop marked as uninstalled', {
        shopId: shop.id,
        shopDomain: shop.shopDomain,
      });

      return shop;
    } catch (error) {
      logger.error('Failed to mark shop as uninstalled', {
        shopDomain,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get all active shops
   */
  async getActiveShops() {
    return prisma.shop.findMany({
      where: { status: ShopStatus.ACTIVE },
    });
  }

  /**
   * Verify shop access token is still valid
   */
  async verifyShopAccess(shopDomain: string) {
    try {
      const shop = await this.getShopByDomain(shopDomain);
      if (!shop) {
        throw new Error('Shop not found');
      }

      const client = createShopifyClient(shop.shopDomain, shop.accessToken);

      // Try to fetch shop data to verify token
      await client.get({ path: 'shop' });

      return true;
    } catch (error) {
      logger.error('Shop access verification failed', {
        shopDomain,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

export const shopService = new ShopService();
