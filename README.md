# Loyalty Quests - Claude Code Development Environment

Complete Claude Code development environment with **11 specialized subagents**, MCPs, Skills, and Commands for building the **Loyalty Quests** Shopify app.

## 📱 About Loyalty Quests

Loyalty Quests is a Shopify app that increases repeat purchases and customer lifetime value through gamified quest-based rewards. Merchants create quests (e.g., "Place 5 orders"), customers complete them, and automatically receive rewards (discounts, free shipping, etc.).

**Architecture:** Node.js/TypeScript, PostgreSQL, Prisma, React + Polaris, BullMQ, Redis
**Docs:** See `.claude/docs/` for full architecture and tech stack specifications

---

## 🤖 11 Subagents (Hybrid Architecture)

### Generic Shopify Subagents (7)

#### 1. 🔌 Shopify Integration
- OAuth, webhooks, API client, rate limiting
- **Tools:** `setup_oauth`, `register_webhooks`, `verify_api_connection`, `generate_webhook_handler`, `check_api_rate_limits`, `generate_api_client`

#### 2. 📧 Marketing Features
- Email campaigns, segmentation, automation
- **Tools:** `create_email_campaign_system`, `create_customer_segmentation`, `create_automation_workflow`, `setup_email_tracking`, `create_campaign_analytics`

#### 3. 💰 Monetization
- Subscription billing, usage tracking, feature gating
- **Tools:** `setup_subscription_plans`, `implement_usage_tracking`, `create_billing_portal`, `setup_payment_webhooks`, `implement_feature_gates`

#### 4. 🎨 Frontend Development
- React + Shopify Polaris UI components
- **Tools:** `create_polaris_page`, `create_polaris_form`, `create_data_table`, `setup_app_bridge`, `create_navigation_menu`

#### 5. ⚙️ Backend Development
- Express API, database, middleware, services
- **Tools:** `create_api_endpoint`, `create_database_model`, `create_background_job`, `setup_middleware`, `create_service_layer`

#### 6. 🧪 Testing
- Unit, integration, component, E2E tests
- **Tools:** `create_unit_tests`, `create_api_tests`, `create_component_tests`, `setup_test_environment`, `create_e2e_tests`

#### 7. 🚀 Deployment
- Security, CI/CD, optimization, production prep
- **Tools:** `run_security_audit`, `optimize_build`, `setup_ci_cd`, `configure_environment`, `create_deployment_docs`

### Loyalty Quests-Specific Subagents (4) ✨

#### 8. 🎯 Quest Engine
**Purpose:** Quest creation, condition evaluation, progress tracking

**Tools:**
- `create_quest_system` - Generate complete quest management system
- `implement_condition_evaluator` - Build condition matching logic (ORDER_COUNT, TOTAL_SPEND, etc.)
- `setup_progress_tracker` - Progress calculation with DB + Redis caching
- `generate_quest_models` - Prisma schemas for quests/conditions/progress

**Use For:** Creating quest types, evaluating customer progress, tracking completions

#### 9. 🎁 Reward System
**Purpose:** Reward definitions, discount codes, redemption tracking

**Tools:**
- `create_reward_system` - Reward definition and issuance system
- `generate_discount_codes` - Shopify discount code creation
- `track_redemptions` - Redemption validation and tracking
- `setup_reward_models` - Prisma schemas for rewards/redemptions

**Use For:** Creating reward types, issuing discounts, tracking redemptions

#### 10. 📊 Analytics & Reporting
**Purpose:** Quest performance metrics, merchant dashboards

**Tools:**
- `create_analytics_dashboard` - Merchant analytics UI with Polaris
- `setup_daily_aggregations` - Background job for metrics (BullMQ)
- `generate_performance_reports` - Quest performance calculations
- `create_analytics_models` - Analytics data models

**Use For:** Building dashboards, aggregating metrics, performance reports

#### 11. ⚡ Webhook Automation
**Purpose:** Order webhooks → progress updates → reward issuance

**Tools:**
- `setup_order_webhook_handler` - Process order webhooks with HMAC validation
- `create_progress_updater` - Update customer progress on events
- `setup_bullmq_workers` - Background job queue processing
- `implement_webhook_retry` - Retry and error handling

**Use For:** Webhook processing, async progress updates, job queues

---

## 📚 7 Skills (Domain + Technical Expertise)

### Generic Skills (3)
1. **shopify-dev** - Shopify app development patterns
2. **marketing-feature** - Email campaigns & automation
3. **monetization** - Billing & subscriptions

### Loyalty Quests Skills (4) ✨
4. **quest-design** - Quest psychology, gamification patterns, difficulty balancing
5. **reward-psychology** - Reward timing, perceived value, redemption optimization
6. **prisma-expert** - Prisma ORM, multi-tenancy, query optimization, migrations
7. **bullmq-worker** - Job queues, background processing, retry strategies

---

## ⚡ 12 Commands

### Generic Commands (7)
- `/shopify-setup` - Initialize Shopify app
- `/create-webhook` - Generate webhook handlers
- `/test-api` - Test API connections
- `/deploy` - Production preparation
- `/create-feature` - Scaffold features
- `/setup-billing` - Configure billing
- `/debug-issue` - Systematic debugging

### Loyalty Quests Commands (5) ✨
- `/create-quest-type` - Scaffold new quest condition type
- `/create-reward-type` - Scaffold new reward type
- `/setup-webhook-flow` - Create webhook → progress → reward flow
- `/generate-analytics` - Add new analytics metric
- `/test-quest-flow` - End-to-end quest testing

---

## 📁 Project Structure

```
.claude/
├── subagents/                    # 11 Subagents (7 generic + 4 Loyalty-specific)
│   ├── shopify-integration/      # 🔌 OAuth & webhooks
│   ├── marketing-features/       # 📧 Email campaigns
│   ├── monetization/             # 💰 Billing
│   ├── frontend/                 # 🎨 React + Polaris
│   ├── backend/                  # ⚙️ Express + Prisma
│   ├── testing/                  # 🧪 Test creation
│   ├── deployment/               # 🚀 Production prep
│   ├── quest-engine/             # 🎯 Quest logic ✨
│   ├── reward-system/            # 🎁 Rewards & redemptions ✨
│   ├── analytics/                # 📊 Reporting ✨
│   ├── webhook-automation/       # ⚡ Event processing ✨
│   ├── orchestrator-config.json  # Subagent coordination
│   └── claude-desktop-config.json # MCP configuration
├── mcp/
│   └── shopify-mcp/              # Shopify MCP tools
├── skills/                       # 7 Skills (3 generic + 4 Loyalty-specific)
│   ├── shopify-dev.md
│   ├── marketing-feature.md
│   ├── monetization.md
│   ├── quest-design.md           # ✨
│   ├── reward-psychology.md      # ✨
│   ├── prisma-expert.md          # ✨
│   └── bullmq-worker.md          # ✨
├── commands/                     # 12 Commands (7 generic + 5 Loyalty-specific)
│   ├── [7 generic commands]
│   ├── create-quest-type.md      # ✨
│   ├── create-reward-type.md     # ✨
│   ├── setup-webhook-flow.md     # ✨
│   ├── generate-analytics.md     # ✨
│   └── test-quest-flow.md        # ✨
├── docs/                         # Architecture documentation
│   ├── README.md                 # Product overview
│   ├── architect.md              # Technical architecture
│   └── TECH-STACK.md             # Technology choices
└── agents/                       # Agent workflow docs
    ├── README.md
    └── workflows.md
```

---

## 🚀 Setup Instructions

### 1. Install Subagent Dependencies

**Windows (PowerShell):**
```powershell
# One-liner to install all subagent dependencies
Get-ChildItem -Path .\.claude\subagents\* -Directory | ForEach-Object { Push-Location $_.FullName; npm install; Pop-Location }

# Install main MCP
cd .\.claude\mcp\shopify-mcp; npm install; cd ..\..\..
```

**Mac/Linux (Bash):**
```bash
# One-liner to install all subagent dependencies
for dir in .claude/subagents/*/; do (cd "$dir" && npm install); done

# Install main MCP
cd .claude/mcp/shopify-mcp && npm install && cd ../../..
```

### 2. Configure Claude Desktop

Copy config from `.claude/subagents/claude-desktop-config.json` to:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### 3. Verify Installation

Run the verification script to ensure everything is set up correctly:

```bash
npm run verify
```

This will check:
- ✅ Node.js version (v20.x or higher)
- ✅ All 11 subagents have dependencies installed
- ✅ MCP server dependencies installed
- ✅ Documentation files present

### 4. Restart Claude Desktop

---

## 🎯 How to Use Subagents

### Example 1: Build Quest System
```
User: "Create the quest system with order count tracking"

Main Agent orchestrates:
├─ 🎯 Quest Engine: create_quest_system (Prisma models + service)
├─ ⚙️ Backend: create_api_endpoint (/api/quests)
└─ 🎨 Frontend: create_polaris_page (Quest management UI)

(All run in parallel)

Result: Complete quest CRUD system ready!
```

### Example 2: Setup Order Tracking Flow
```
User: "Implement order webhook to quest progress flow"

Main Agent orchestrates:
Step 1: 🔌 Shopify Integration: register_webhooks (orders/create)
Step 2 (parallel):
  ├─ ⚡ Webhook Automation: setup_order_webhook_handler
  └─ 🎯 Quest Engine: implement_condition_evaluator
Step 3: 🎁 Reward System: create_reward_system

Result: Complete webhook → progress → reward automation!
```

### Example 3: Build Analytics Dashboard
```
User: "Create quest performance analytics"

Main Agent orchestrates (parallel):
├─ 📊 Analytics: create_analytics_dashboard
├─ ⚙️ Backend: create_api_endpoint (/api/analytics)
└─ 🎨 Frontend: create_polaris_page (Dashboard UI)

Then: 📊 Analytics: setup_daily_aggregations (BullMQ job)

Result: Live analytics dashboard with daily aggregation!
```

---

## 📋 Pre-defined Workflows

### Workflow 1: Create Quest Feature
```json
{
  "parallel": true,
  "agents": ["quest-engine", "backend", "frontend"],
  "tasks": {
    "quest-engine": "create_quest_system",
    "backend": "create_database_model",
    "frontend": "create_polaris_page"
  }
}
```

### Workflow 2: Setup Order Tracking
```json
{
  "steps": [
    { "agent": "shopify-integration", "task": "register_webhooks" },
    {
      "parallel": true,
      "agents": ["webhook-automation", "quest-engine"],
      "tasks": {
        "webhook-automation": "setup_order_webhook_handler",
        "quest-engine": "implement_condition_evaluator"
      }
    },
    { "agent": "reward-system", "task": "create_reward_system" }
  ]
}
```

### Workflow 3: Build Analytics Dashboard
```json
{
  "parallel": true,
  "agents": ["analytics", "backend", "frontend"]
}
```

### Workflow 4: Full Quest Flow
Complete end-to-end implementation with testing

---

## 💡 Usage Tips

### When to Use Generic vs. Loyalty-Specific Subagents

**Use Generic Subagents For:**
- Shopify OAuth and API setup → Shopify Integration
- Building any Polaris UI → Frontend
- Creating REST APIs → Backend
- Writing tests → Testing
- Deploying to production → Deployment

**Use Loyalty-Specific Subagents For:**
- Quest condition logic → Quest Engine
- Reward issuance → Reward System
- Quest metrics → Analytics
- Order webhook processing → Webhook Automation

**Best Practice:** Combine both! Generic subagents handle infrastructure, Loyalty subagents handle domain logic.

### Activating Skills

Skills are automatically activated based on context, or request explicitly:
```
"Use the quest-design skill to create an engaging quest"
"Activate prisma-expert skill to optimize this query"
"Apply reward-psychology principles to this reward structure"
```

---

## 📖 Documentation

- **Architecture:** `.claude/docs/architect.md` - Complete technical architecture
- **Tech Stack:** `.claude/docs/TECH-STACK.md` - Technology decisions
- **Product:** `.claude/docs/README.md` - Product overview and roadmap
- **Subagents:** `.claude/subagents/orchestrator-config.json` - Orchestration rules
- **Skills:** `.claude/skills/*.md` - Individual skill documentation

---

## 🔥 Key Features

✅ **11 Specialized Subagents** (7 generic + 4 Loyalty-specific)
✅ **Parallel Execution** - Multiple agents work simultaneously
✅ **Inter-Agent Communication** - Agents coordinate tasks
✅ **Hybrid Architecture** - Generic + domain-specific tools
✅ **Orchestrated Workflows** - Pre-defined task sequences
✅ **7 Expert Skills** - Domain and technical expertise
✅ **12 Commands** - Quick scaffolding and workflows
✅ **Architecture-Aligned** - Built for Loyalty Quests specs
✅ **MCP-Based** - Standard Model Context Protocol

---

## 🎓 Learning Resources

### Architecture Understanding
Read these in order to understand the Loyalty Quests architecture:
1. `.claude/docs/README.md` - Product vision
2. `.claude/docs/architect.md` - System design
3. `.claude/docs/TECH-STACK.md` - Technology choices

### Subagent Usage
- Each subagent has a README in its directory
- Check `orchestrator-config.json` for workflow examples
- Review skills for domain expertise

### Example Commands
```bash
# Start a new quest feature
/create-quest-type

# Set up the complete webhook flow
/setup-webhook-flow

# Test end-to-end
/test-quest-flow

# Deploy to production
/deploy
```

---

## 📊 Subagent Communication Matrix

| From/To | Shopify | Quest | Reward | Analytics | Webhook | Backend | Frontend | Testing |
|---------|---------|-------|--------|-----------|---------|---------|----------|---------|
| Shopify | -       | ✗     | ✓      | ✗         | ✓       | ✓       | ✗        | ✗       |
| Quest   | ✗       | -     | ✓      | ✗         | ✓       | ✓       | ✗        | ✗       |
| Reward  | ✓       | ✓     | -      | ✗         | ✗       | ✓       | ✗        | ✗       |
| Analytics | ✗     | ✗     | ✗      | -         | ✗       | ✓       | ✓        | ✗       |
| Webhook | ✓       | ✓     | ✓      | ✗         | -       | ✗       | ✗        | ✗       |
| Backend | ✓       | ✓     | ✓      | ✓         | ✗       | -       | ✓        | ✓       |
| Frontend | ✗      | ✗     | ✗      | ✗         | ✗       | ✓       | -        | ✓       |
| Testing | ✗       | ✓     | ✓      | ✓         | ✓       | ✓       | ✓        | -       |

---

## 🤝 Contributing

To add new tools:
- **New Subagent:** Create in `.claude/subagents/[name]/`
- **New Skill:** Create `.md` file in `.claude/skills/`
- **New Command:** Create `.md` file in `.claude/commands/`
- **New Workflow:** Add to `orchestrator-config.json`

---

## 📄 License

MIT License

---

## 💬 Questions?

This is a **development environment** for building Loyalty Quests. The actual app code will be generated by these subagents based on the architecture in `.claude/docs/`.

**Next Steps:**
1. Review architecture docs in `.claude/docs/`
2. Configure Claude Desktop with all 11 subagents
3. Start with `/shopify-setup` or `/create-quest-type`
4. Use subagents to build the app following the architecture

**Happy Building! 🚀**
