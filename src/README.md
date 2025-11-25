# Source Code Structure

This directory contains the main application source code for Loyalty Quests.

## Directory Structure

```
src/
├── api/              # API routes and controllers
├── services/         # Business logic services
│   ├── quest-engine/     # Quest condition evaluation and progress
│   ├── reward-system/    # Reward issuance and redemption
│   ├── shopify/          # Shopify API integration
│   └── analytics/        # Analytics and reporting
├── models/           # Data models and types
├── workers/          # Background job workers (BullMQ)
├── middleware/       # Express middleware
├── config/           # Configuration files
└── utils/            # Utility functions and helpers
```

## Key Files

- `index.ts` - Main application entry point
- `config/environment.ts` - Environment configuration with validation
- `utils/logger.ts` - Winston logger instance
- `utils/prisma.ts` - Prisma client singleton

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Testing
npm test
npm run test:watch
npm run test:coverage
```

## Architecture

This application follows a service-oriented architecture:

1. **API Layer** (`api/`) - HTTP endpoints and request handling
2. **Service Layer** (`services/`) - Business logic and orchestration
3. **Data Layer** (Prisma) - Database access and models
4. **Worker Layer** (`workers/`) - Background job processing

## Adding New Features

1. Create service in `services/[feature-name]/`
2. Add API routes in `api/[feature-name]/`
3. Implement workers if needed in `workers/[feature-name]/`
4. Add tests alongside implementation

## Environment Variables

See `.env.example` for required environment variables.

Validate configuration with:
```typescript
import { config } from './config/environment';
```

All environment variables are validated at startup using Zod.
