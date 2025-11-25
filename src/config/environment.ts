import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Shopify Configuration
  SHOPIFY_API_KEY: z.string().min(1, 'SHOPIFY_API_KEY is required'),
  SHOPIFY_API_SECRET: z.string().min(1, 'SHOPIFY_API_SECRET is required'),
  SHOPIFY_SCOPES: z.string().default('read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_discounts,write_discounts'),

  // App Configuration
  APP_URL: z.string().url('APP_URL must be a valid URL'),
  HOST: z.string().default('localhost'),
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Security
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),

  // Billing
  BILLING_CALLBACK_URL: z.string().url().optional(),

  // BullMQ
  BULLMQ_REDIS_HOST: z.string().default('localhost'),
  BULLMQ_REDIS_PORT: z.string().transform(Number).default('6379'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_QUEST_ENGINE: z.string().transform(val => val === 'true').default('true'),
  ENABLE_REWARD_SYSTEM: z.string().transform(val => val === 'true').default('true'),
  ENABLE_WEBHOOK_AUTOMATION: z.string().transform(val => val === 'true').default('true'),

  // Development
  DEBUG: z.string().transform(val => val === 'true').default('false'),
});

type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const config = {
  shopify: {
    apiKey: env.SHOPIFY_API_KEY,
    apiSecret: env.SHOPIFY_API_SECRET,
    scopes: env.SHOPIFY_SCOPES.split(','),
  },
  app: {
    url: env.APP_URL,
    host: env.HOST,
    port: env.PORT,
    environment: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  session: {
    secret: env.SESSION_SECRET,
  },
  billing: {
    callbackUrl: env.BILLING_CALLBACK_URL,
  },
  bullmq: {
    redis: {
      host: env.BULLMQ_REDIS_HOST,
      port: env.BULLMQ_REDIS_PORT,
    },
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  features: {
    analytics: env.ENABLE_ANALYTICS,
    questEngine: env.ENABLE_QUEST_ENGINE,
    rewardSystem: env.ENABLE_REWARD_SYSTEM,
    webhookAutomation: env.ENABLE_WEBHOOK_AUTOMATION,
  },
  debug: env.DEBUG,
} as const;

export type Config = typeof config;
