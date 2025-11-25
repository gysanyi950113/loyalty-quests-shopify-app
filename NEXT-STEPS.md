# Next Steps: Setting Up Loyalty Quests Development Environment

This guide walks you through setting up and using the complete Claude Code development environment with 11 subagents for building the Loyalty Quests Shopify app.

---

## 📋 Prerequisites

- Node.js v20.x or higher
- npm or pnpm
- Claude Desktop app installed
- Basic understanding of Shopify apps (recommended)

---

## 🚀 Step 1: Install Subagent Dependencies

Each subagent needs its dependencies installed.

### Windows (PowerShell)

```powershell
# Navigate to project root
cd E:\Sanca\PROJECT\Vibe\ShoppingQuestApp

# Install dependencies for all 11 subagents (one-liner)
Get-ChildItem -Path .\.claude\subagents\* -Directory | ForEach-Object { Push-Location $_.FullName; npm install; Pop-Location }

# Install main MCP server dependencies
cd .\.claude\mcp\shopify-mcp; npm install; cd ..\..\..
```

**Or install individually:**

```powershell
cd .\.claude\subagents\shopify-integration; npm install; cd ..\..
cd .\.claude\subagents\marketing-features; npm install; cd ..\..
cd .\.claude\subagents\monetization; npm install; cd ..\..
cd .\.claude\subagents\frontend; npm install; cd ..\..
cd .\.claude\subagents\backend; npm install; cd ..\..
cd .\.claude\subagents\testing; npm install; cd ..\..
cd .\.claude\subagents\deployment; npm install; cd ..\..
cd .\.claude\subagents\quest-engine; npm install; cd ..\..
cd .\.claude\subagents\reward-system; npm install; cd ..\..
cd .\.claude\subagents\analytics; npm install; cd ..\..
cd .\.claude\subagents\webhook-automation; npm install; cd ..\..
cd .\.claude\mcp\shopify-mcp; npm install; cd ..\..\..
```

### Windows (Command Prompt)

```cmd
REM Navigate to project root
cd E:\Sanca\PROJECT\Vibe\ShoppingQuestApp

REM Install dependencies for each subagent
for /D %%d in (.claude\subagents\*) do (cd %%d && npm install && cd ..\.. )

REM Install main MCP server dependencies
cd .claude\mcp\shopify-mcp && npm install && cd ..\..\..
```

### Mac/Linux (Bash)

```bash
# Navigate to project root
cd ~/path/to/ShoppingQuestApp

# Install dependencies for all 11 subagents (one-liner)
for dir in .claude/subagents/*/; do (cd "$dir" && npm install); done

# Install main MCP server dependencies
cd .claude/mcp/shopify-mcp && npm install && cd ../../..
```

---

## ⚙️ Step 2: Configure Claude Desktop

### 2.1 Locate Your Claude Desktop Config File

**Mac:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### 2.2 Add MCP Server Configuration

Open `.claude/subagents/claude-desktop-config.json` in this project and copy the entire configuration.

Then paste it into your Claude Desktop config file. It should look like this:

```json
{
  "mcpServers": {
    "shopify-mcp": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\mcp\\shopify-mcp\\index.js"]
    },
    "shopify-integration-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\shopify-integration\\index.js"]
    },
    "marketing-features-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\marketing-features\\index.js"]
    },
    "monetization-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\monetization\\index.js"]
    },
    "frontend-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\frontend\\index.js"]
    },
    "backend-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\backend\\index.js"]
    },
    "testing-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\testing\\index.js"]
    },
    "deployment-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\deployment\\index.js"]
    },
    "quest-engine-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\quest-engine\\index.js"]
    },
    "reward-system-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\reward-system\\index.js"]
    },
    "analytics-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\analytics\\index.js"]
    },
    "webhook-automation-subagent": {
      "command": "node",
      "args": ["E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\subagents\\webhook-automation\\index.js"]
    }
  }
}
```

**⚠️ Important:** Adjust the file paths if your project is in a different location!

### 2.3 Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP servers.

---

## 📖 Step 3: Read the Architecture Documentation

Before building, understand the Loyalty Quests architecture:

1. **Product Overview** (5 min read)
   ```
   Open: .claude/docs/README.md
   ```
   Learn what Loyalty Quests does and the MVP scope.

2. **Technical Architecture** (15 min read)
   ```
   Open: .claude/docs/architect.md
   ```
   Understand the system design, data models, and flows.

3. **Tech Stack** (5 min read)
   ```
   Open: .claude/docs/TECH-STACK.md
   ```
   See the technologies: Node.js, TypeScript, Prisma, React, BullMQ, etc.

---

## 🎯 Step 4: Verify Setup

Test that everything is working:

### 4.1 Check MCP Servers in Claude Desktop

After restarting Claude Desktop, you should see MCP server status indicators. Look for:
- ✅ Green checkmarks next to all 12 MCP servers (1 main + 11 subagents)
- If you see ❌ red X marks, check the troubleshooting section below

### 4.2 List Available Tools

In Claude Code, ask:
```
"List all available MCP servers and their tools"
```

**Expected output:** You should see all 12 servers:
- `shopify-mcp`
- `shopify-integration-subagent`
- `marketing-features-subagent`
- `monetization-subagent`
- `frontend-subagent`
- `backend-subagent`
- `testing-subagent`
- `deployment-subagent`
- `quest-engine-subagent`
- `reward-system-subagent`
- `analytics-subagent`
- `webhook-automation-subagent`

### 4.3 Test a Command

Try running a slash command:
```
/shopify-setup
```

**Expected result:** Command should expand with setup instructions for Shopify app configuration.

```
/create-quest-type
```

**Expected result:** Command should prompt you about the quest type details.

### 4.4 Smoke Test: Generate Sample Code

Test that subagents can actually generate code:

```
"Use the Quest Engine subagent to show me what a Prisma model for a quest would look like"
```

**Expected result:** The subagent should return a sample Prisma schema like:
```prisma
model Quest {
  id          String   @id @default(uuid())
  shopId      String
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  shop        Shop     @relation(fields: [shopId], references: [id])
  conditions  QuestCondition[]
  rewards     QuestReward[]
}
```

If you see this, your setup is working correctly!

---

## 🏗️ Step 5: Start Building the App

Now you're ready to build! Here's the recommended order:

### Phase 1: Foundation (Week 1)

**1. Initialize Project Structure**
```
Ask Claude: "Set up the basic Node.js + TypeScript project structure for Loyalty Quests"
```

**2. Set Up Database**
```
Ask Claude: "Use the Quest Engine subagent to generate all Prisma models for quests, conditions, rewards, and progress tracking"
```

**3. Configure Shopify Integration**
```
Use command: /shopify-setup
```

### Phase 2: Core Quest System (Week 2)

**4. Build Quest Engine**
```
Ask Claude: "Create the quest system with ORDER_COUNT condition type using the Quest Engine subagent"
```

**5. Implement Progress Tracking**
```
Ask Claude: "Set up progress tracker with Redis caching using the Quest Engine subagent"
```

**6. Create Quest Management UI**
```
Ask Claude: "Build the merchant quest creation UI using the Frontend subagent with Polaris"
```

### Phase 3: Reward System (Week 3)

**7. Implement Reward Issuance**
```
Ask Claude: "Create the reward system with discount code generation using the Reward System subagent"
```

**8. Set Up Order Webhook Flow**
```
Use command: /setup-webhook-flow
```

**9. Configure BullMQ Workers**
```
Ask Claude: "Set up BullMQ workers for quest progress and reward issuance using the Webhook Automation subagent"
```

### Phase 4: Analytics & Testing (Week 4)

**10. Build Analytics Dashboard**
```
Ask Claude: "Create quest performance analytics dashboard using the Analytics subagent"
```

**11. Add Comprehensive Tests**
```
Use command: /test-quest-flow
```

**12. Prepare for Deployment**
```
Use command: /deploy
```

---

## 💡 Pro Tips

### When to Use Which Subagent

| Task | Use This Subagent |
|------|-------------------|
| Creating quest types, conditions, progress logic | 🎯 Quest Engine |
| Issuing rewards, discount codes, redemptions | 🎁 Reward System |
| Building analytics, aggregations, reports | 📊 Analytics |
| Webhook handlers, BullMQ jobs, background processing | ⚡ Webhook Automation |
| Shopify OAuth, API client, webhooks | 🔌 Shopify Integration |
| Building Polaris UI components | 🎨 Frontend |
| Creating API endpoints, Prisma queries | ⚙️ Backend |
| Writing tests | 🧪 Testing |
| Production deployment | 🚀 Deployment |

### Activating Skills

Skills are automatically activated, or request explicitly:

```
"Use the quest-design skill to create an engaging quest that drives repeat purchases"

"Activate the prisma-expert skill to optimize this database query"

"Apply reward-psychology principles to this reward structure"

"Use the bullmq-worker skill to set up this background job queue"
```

### Using Commands

Commands are shortcuts for common workflows:

```
/create-quest-type          # Scaffold a new quest condition type
/create-reward-type         # Scaffold a new reward type
/setup-webhook-flow         # Create webhook → progress → reward flow
/generate-analytics         # Add a new analytics metric
/test-quest-flow            # End-to-end testing
/shopify-setup              # Initialize Shopify app
/deploy                     # Prepare for production
```

---

## 🔍 Debugging & Troubleshooting

### Subagent Not Loading?

**Symptoms:** Red X marks in Claude Desktop MCP server list

**Solutions:**

1. **Check file paths** - Windows uses backslashes `\` not forward slashes `/`
   ```json
   ✅ Correct: "E:\\Sanca\\PROJECT\\Vibe\\ShoppingQuestApp\\.claude\\mcp\\shopify-mcp\\index.js"
   ❌ Wrong:   "E:/Sanca/PROJECT/Vibe/ShoppingQuestApp/.claude/mcp/shopify-mcp/index.js"
   ```

2. **Verify npm install completed**
   ```powershell
   # Check if node_modules exists in each subagent directory
   Get-ChildItem -Path .\.claude\subagents\* -Directory | ForEach-Object {
     Write-Host "$($_.Name): " -NoNewline
     if (Test-Path "$($_.FullName)\node_modules") {
       Write-Host "✅ Installed" -ForegroundColor Green
     } else {
       Write-Host "❌ Missing node_modules" -ForegroundColor Red
     }
   }
   ```

3. **Check for syntax errors**
   ```powershell
   node .\.claude\subagents\shopify-integration\index.js
   # Should not throw errors
   ```

4. **Restart Claude Desktop** - Fully quit (not just close window) and reopen

### Tool Not Available?

**Symptoms:** Claude says "I don't have access to that tool"

**Solutions:**

1. Verify the subagent loaded successfully (check Step 4.1 above)
2. Check the tool name matches exactly (case-sensitive)
3. View available tools: Ask Claude to "List all MCP tools"
4. Restart Claude Desktop after config changes

### Windows-Specific Issues

**Issue:** `npm install` fails with permission errors

**Solution:** Run PowerShell as Administrator or use:
```powershell
npm install --no-optional
```

**Issue:** Path too long errors on Windows

**Solution:** Enable long paths in Windows:
```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

**Issue:** MCP server crashes immediately

**Solution:** Check Node.js version:
```powershell
node --version  # Should be v20.x or higher
```

### Want to Add a New Tool?

1. Edit the subagent's `index.js` file
2. Add tool definition to `ListToolsRequestSchema`
3. Implement the tool function
4. Restart Claude Desktop
5. Verify with: Ask Claude to "List tools for [subagent-name]"

---

## 📚 Learning Resources

### Architecture Deep Dive
- `.claude/docs/architect.md` - System design, data models, flows
- `.claude/docs/TECH-STACK.md` - Technology decisions

### Subagent Documentation
- `.claude/subagents/quest-engine/README.md` - Quest Engine docs
- `.claude/subagents/orchestrator-config.json` - Workflow examples

### Skills Documentation
- `.claude/skills/quest-design.md` - Quest design patterns
- `.claude/skills/reward-psychology.md` - Reward optimization
- `.claude/skills/prisma-expert.md` - Database best practices
- `.claude/skills/bullmq-worker.md` - Job queue patterns

---

## 🎓 Example Prompts to Get Started

### Beginner Prompts

```
"Help me understand the Loyalty Quests architecture"

"What's the difference between the Quest Engine and Reward System subagents?"

"Walk me through creating my first quest type"

"How do I set up the database with Prisma?"
```

### Intermediate Prompts

```
"Create a TOTAL_SPEND quest type with the Quest Engine subagent"

"Build the webhook handler for order creation using Webhook Automation"

"Generate the analytics dashboard for quest performance"

"Set up BullMQ workers for progress updates"
```

### Advanced Prompts

```
"Implement a custom condition evaluator for product category purchases"

"Optimize the progress tracking query with Prisma"

"Build an A/B testing system for quest rewards"

"Create a tiered quest system with bronze, silver, and gold levels"
```

---

## ✅ Verification Checklist

Before you start building, verify:

- [ ] All 11 subagents have dependencies installed (`npm install` completed)
- [ ] Claude Desktop config file updated with all 11 subagents
- [ ] Claude Desktop restarted
- [ ] Read architecture docs in `.claude/docs/`
- [ ] Tested at least one command (e.g., `/shopify-setup`)
- [ ] Confirmed subagents are loaded (ask Claude to list them)

---

## 🚀 Ready to Build!

You now have:
- ✅ 11 specialized subagents ready
- ✅ 7 expert skills activated
- ✅ 12 commands available
- ✅ Complete architecture documentation
- ✅ Pre-defined workflows

---

## 📦 What Happens Next?

**Important:** This is a **development environment** with subagents, NOT the actual Loyalty Quests app code.

### The subagents will GENERATE the actual app for you:

1. **Project scaffolding** - Subagents create the Node.js/TypeScript project structure
2. **Database models** - Quest Engine generates Prisma schemas
3. **API endpoints** - Backend subagent creates Express routes
4. **UI components** - Frontend subagent builds React + Polaris pages
5. **Webhooks & jobs** - Webhook Automation creates BullMQ workers
6. **Tests** - Testing subagent writes unit/integration/E2E tests

### Generated app structure will be:
```
loyalty-quests-app/              # ← Generated by subagents
├── src/
│   ├── api/                     # Express routes (Backend subagent)
│   ├── services/                # Business logic (Quest Engine, Reward System)
│   ├── models/                  # Prisma models (Quest Engine)
│   ├── workers/                 # BullMQ jobs (Webhook Automation)
│   ├── ui/                      # React components (Frontend)
│   └── utils/
├── prisma/
│   └── schema.prisma            # Database schema (Quest Engine)
├── tests/                       # Test files (Testing subagent)
├── package.json
├── tsconfig.json
└── .env
```

---

## 🎯 Start Building - Recommended First Steps

### Option A: Interactive Build

**Start with:**
```
"Let's build the Loyalty Quests app! First, set up the project structure and database using the Quest Engine subagent."
```

Claude will orchestrate the subagents to create your app step-by-step.

### Option B: Use Slash Commands

```bash
# Step 1: Initialize Shopify app structure
/shopify-setup

# Step 2: Create quest system
/create-quest-type

# Step 3: Set up order tracking flow
/setup-webhook-flow

# Step 4: Generate analytics
/generate-analytics

# Step 5: Test everything
/test-quest-flow
```

### Option C: Manual Phase-by-Phase

Follow the **Phase 1-4** build plan in **Step 5** above, asking Claude to coordinate subagents for each task.

---

## 💬 Questions?

Refer to:
- **Main README:** `README.md` at project root
- **Architecture:** `.claude/docs/architect.md` - Understand the system design
- **Orchestration:** `.claude/subagents/orchestrator-config.json` - See how subagents work together
- **Tech Stack:** `.claude/docs/TECH-STACK.md` - Technology choices explained

---

## 🎉 You're All Set!

The development environment is configured. Your next message to Claude should ask it to start building the Loyalty Quests app using the subagents.

**Happy Building!**
