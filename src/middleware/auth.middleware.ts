import { Request, Response, NextFunction } from 'express';
import { shopService } from '../services/shopify/shop.service';
import { logger } from '../utils/logger';
import { ShopStatus } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      shop?: {
        id: string;
        shopDomain: string;
        accessToken: string;
        status: ShopStatus;
      };
    }
  }
}

/**
 * Middleware to authenticate shop requests
 * Expects shop domain in query parameter or header
 */
export async function authenticateShop(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const shopDomain =
      (req.query.shop as string) ||
      req.get('X-Shopify-Shop-Domain') ||
      req.get('X-Shop-Domain');

    if (!shopDomain) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Shop domain required',
      });
      return;
    }

    const shop = await shopService.getShopByDomain(shopDomain);

    if (!shop) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Shop not found. Please install the app first.',
      });
      return;
    }

    if (shop.status !== ShopStatus.ACTIVE) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Shop is ${shop.status.toLowerCase()}`,
      });
      return;
    }

    // Attach shop to request
    req.shop = {
      id: shop.id,
      shopDomain: shop.shopDomain,
      accessToken: shop.accessToken,
      status: shop.status,
    };

    next();
  } catch (error) {
    logger.error('Shop authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Middleware to verify shop is active
 */
export async function requireActiveShop(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.shop) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Shop authentication required',
    });
    return;
  }

  if (req.shop.status !== ShopStatus.ACTIVE) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Shop must be active to access this resource',
    });
    return;
  }

  next();
}

/**
 * Optional shop authentication - doesn't fail if shop not found
 */
export async function optionalShopAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const shopDomain =
      (req.query.shop as string) ||
      req.get('X-Shopify-Shop-Domain') ||
      req.get('X-Shop-Domain');

    if (shopDomain) {
      const shop = await shopService.getShopByDomain(shopDomain);
      if (shop && shop.status === ShopStatus.ACTIVE) {
        req.shop = {
          id: shop.id,
          shopDomain: shop.shopDomain,
          accessToken: shop.accessToken,
          status: shop.status,
        };
      }
    }

    next();
  } catch (error) {
    logger.error('Optional shop auth error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Don't fail the request, just continue without shop context
    next();
  }
}
