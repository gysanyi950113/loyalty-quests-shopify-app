#!/usr/bin/env node

/**
 * Verify Setup Script
 * Checks that all subagent dependencies are installed correctly
 */

const fs = require('fs');
const path = require('path');

const SUBAGENTS_DIR = path.join(__dirname, '..', '.claude', 'subagents');
const MCP_DIR = path.join(__dirname, '..', '.claude', 'mcp');

const SUBAGENTS = [
  'shopify-integration',
  'marketing-features',
  'monetization',
  'frontend',
  'backend',
  'testing',
  'deployment',
  'quest-engine',
  'reward-system',
  'analytics',
  'webhook-automation'
];

const MCP_SERVERS = ['shopify-mcp'];

console.log('🔍 Verifying Loyalty Quests Development Environment Setup...\n');

let allGood = true;

// Check Node.js version
console.log('📦 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 20) {
  console.log(`✅ Node.js ${nodeVersion} (OK)\n`);
} else {
  console.log(`❌ Node.js ${nodeVersion} - Need v20.x or higher\n`);
  allGood = false;
}

// Check subagents
console.log('🤖 Checking subagents...');
SUBAGENTS.forEach(subagent => {
  const subagentPath = path.join(SUBAGENTS_DIR, subagent);
  const nodeModulesPath = path.join(subagentPath, 'node_modules');
  const packageJsonPath = path.join(subagentPath, 'package.json');
  const indexPath = path.join(subagentPath, 'index.js');

  if (!fs.existsSync(subagentPath)) {
    console.log(`❌ ${subagent}: Directory not found`);
    allGood = false;
    return;
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ ${subagent}: package.json missing`);
    allGood = false;
    return;
  }

  if (!fs.existsSync(indexPath)) {
    console.log(`❌ ${subagent}: index.js missing`);
    allGood = false;
    return;
  }

  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`❌ ${subagent}: node_modules missing (run npm install)`);
    allGood = false;
    return;
  }

  console.log(`✅ ${subagent}`);
});

console.log();

// Check MCP servers
console.log('🔌 Checking MCP servers...');
MCP_SERVERS.forEach(mcp => {
  const mcpPath = path.join(MCP_DIR, mcp);
  const nodeModulesPath = path.join(mcpPath, 'node_modules');
  const packageJsonPath = path.join(mcpPath, 'package.json');
  const indexPath = path.join(mcpPath, 'index.js');

  if (!fs.existsSync(mcpPath)) {
    console.log(`❌ ${mcp}: Directory not found`);
    allGood = false;
    return;
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ ${mcp}: package.json missing`);
    allGood = false;
    return;
  }

  if (!fs.existsSync(indexPath)) {
    console.log(`❌ ${mcp}: index.js missing`);
    allGood = false;
    return;
  }

  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`❌ ${mcp}: node_modules missing (run npm install)`);
    allGood = false;
    return;
  }

  console.log(`✅ ${mcp}`);
});

console.log();

// Check documentation
console.log('📚 Checking documentation...');
const docs = [
  '.claude/docs/README.md',
  '.claude/docs/architect.md',
  '.claude/docs/TECH-STACK.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, '..', doc);
  if (fs.existsSync(docPath)) {
    console.log(`✅ ${doc}`);
  } else {
    console.log(`❌ ${doc}: Missing`);
    allGood = false;
  }
});

console.log();

// Final summary
if (allGood) {
  console.log('✅ All checks passed! Your development environment is ready.');
  console.log('\n📖 Next steps:');
  console.log('1. Configure Claude Desktop with MCP servers');
  console.log('2. Restart Claude Desktop');
  console.log('3. Start building with: "Let\'s build the Loyalty Quests app!"');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\n💡 Common fixes:');
  console.log('- Run: npm run install:all');
  console.log('- Check Node.js version: node --version');
  console.log('- Review NEXT-STEPS.md for detailed setup instructions');
  process.exit(1);
}
