# Railway CLI Quick Setup Guide

## Install Railway CLI

### Windows (PowerShell or CMD)
```bash
npm install -g @railway/cli
```

### Mac/Linux
```bash
npm install -g @railway/cli
```

---

## Setup (One-time - takes 1 minute)

### Step 1: Login to Railway
```bash
railway login
```
- This opens your browser
- Click "Authorize"
- Return to terminal

### Step 2: Link Your Project
```bash
cd E:\Sanca\PROJECT\Vibe\ShoppingQuestApp
railway link
```
- Select your project from the list
- Select the service (your app)

---

## Useful Railway CLI Commands

### Run Database Migrations
```bash
railway run npx prisma migrate deploy
```

### View Live Logs
```bash
railway logs
```

### View Environment Variables
```bash
railway variables
```

### Open Railway Dashboard
```bash
railway open
```

### Run Any Command in Railway Environment
```bash
railway run [your-command]
```

### Connect to PostgreSQL Database
```bash
railway connect postgres
```

### SSH-like Access (Run Commands)
```bash
railway run bash
```

---

## Examples

### Run Prisma Studio (Database GUI)
```bash
railway run npx prisma studio
```

### Check Database Connection
```bash
railway run npx prisma db pull
```

### Seed Database
```bash
railway run npx prisma db seed
```

### Run Tests
```bash
railway run npm test
```

---

## Troubleshooting

### "railway: command not found"
**Solution:** Restart your terminal after installation

### "No projects found"
**Solution:** Make sure you're logged in:
```bash
railway whoami
```
If not logged in, run: `railway login`

### "Failed to link project"
**Solution:**
1. Make sure project exists in Railway dashboard
2. Try: `railway link --project YOUR_PROJECT_ID`

---

## Summary

After installing Railway CLI, you can run ANY command as if you were SSH'd into the Railway server:

```bash
railway run [any-command-here]
```

It's like having terminal access without actually having a terminal!
