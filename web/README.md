# Loyalty Quests - Admin UI

React-based admin interface for merchants using Shopify Polaris.

## Features

- **Quest Management:** Create, view, and manage quests
- **Quest Details:** View individual quest configuration
- **Analytics:** Performance metrics and insights (coming soon)
- **Polaris UI:** Native Shopify look and feel

## Development

```bash
# Install dependencies
npm install

# Start dev server (with API proxy)
npm run dev

# Build for production
npm run build
```

## Structure

```
web/
├── frontend/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## Pages

- `/` - Quest list (default)
- `/quests` - Quest list
- `/quests/new` - Create new quest
- `/quests/:id` - Quest details
- `/analytics` - Analytics dashboard

## API Integration

The frontend proxies API requests to the backend server at `http://localhost:3000/api`.

## Tech Stack

- React 18
- TypeScript 5
- Shopify Polaris 12
- React Router 6
- Vite 5
