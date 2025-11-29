import crypto from 'crypto';
import { Request } from 'express';
import { config } from '../config/environment';

/**
 * Verify Shopify App Proxy signature
 *
 * Shopify signs all app proxy requests with HMAC-SHA256
 * We MUST verify this to prevent customer ID spoofing
 */
export function verifyAppProxySignature(req: Request): boolean {
  const { signature, ...params } = req.query;

  if (!signature || typeof signature !== 'string') {
    return false;
  }

  // Sort parameters alphabetically and build query string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = params[key];
      return `${key}=${Array.isArray(value) ? value.join(',') : value}`;
    })
    .join('');

  // Calculate HMAC using app secret
  const calculatedSignature = crypto
    .createHmac('sha256', config.shopify.apiSecret)
    .update(sortedParams)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const calcBuffer = Buffer.from(calculatedSignature, 'hex');

    if (sigBuffer.length !== calcBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, calcBuffer);
  } catch (error) {
    // Invalid hex string or buffer creation failed
    return false;
  }
}

/**
 * Extract and normalize customer ID from app proxy request
 *
 * Shopify sends: logged_in_customer_id=123456789
 * We normalize to string for consistent storage
 */
export function getCustomerIdFromProxy(req: Request): string | null {
  const customerId = req.query.logged_in_customer_id;

  if (!customerId) {
    return null;
  }

  return String(customerId);
}

/**
 * Get shop domain from app proxy request
 */
export function getShopDomainFromProxy(req: Request): string | null {
  const shop = req.query.shop;

  if (!shop || typeof shop !== 'string') {
    return null;
  }

  return shop;
}

/**
 * Check if customer is logged in
 */
export function isCustomerLoggedIn(req: Request): boolean {
  return !!req.query.logged_in_customer_id;
}
