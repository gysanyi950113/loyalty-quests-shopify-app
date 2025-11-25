# Git Workflow for Loyalty Quests

This document describes the GitFlow branching strategy and development workflow for the Loyalty Quests Shopify app.

## Repository

- **GitHub:** https://github.com/gysanyi950113/loyalty-quests-shopify-app

## Branch Structure (GitFlow)

### Permanent Branches

#### `main`
- Production-ready code only
- Protected branch
- Only updated through PRs from `develop` or hotfix branches
- Every merge to main creates a release

#### `develop`
- Integration branch for features
- Always contains latest delivered development changes
- Base branch for feature branches
- Merged to `main` for releases

### Temporary Branches

#### Feature Branches (`feature/*`)
- For new features and enhancements
- Branch from: `develop`
- Merge back to: `develop`
- Naming: `feature/short-description`
- Examples:
  - `feature/quest-engine`
  - `feature/reward-system`
  - `feature/analytics-dashboard`

#### Release Branches (`release/*`)
- Preparation for production release
- Branch from: `develop`
- Merge to: `main` AND `develop`
- Naming: `release/v1.0.0`

#### Hotfix Branches (`hotfix/*`)
- Emergency fixes for production
- Branch from: `main`
- Merge to: `main` AND `develop`
- Naming: `hotfix/bug-description`

---

## Feature Development Workflow

### 1. Start a New Feature

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Develop and Commit

```bash
# Make your changes
# Stage and commit regularly
git add .
git commit -m "feat: add quest condition evaluator

- Implement ORDER_COUNT condition type
- Add progress calculation logic
- Include unit tests

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Commit Message Convention

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 3. Push Feature Branch

```bash
# Push to remote
git push -u origin feature/your-feature-name
```

### 4. Create Pull Request

```bash
# Using GitHub CLI
gh pr create --base develop --title "feat: Add quest condition evaluator" --body "$(cat <<'EOF'
## Summary
- Implement ORDER_COUNT condition type
- Add progress calculation logic with caching
- Include comprehensive unit tests

## Changes
- `src/services/quest-engine/conditions/order-count.ts` - Condition evaluator
- `src/services/quest-engine/progress-tracker.ts` - Progress calculation
- `tests/quest-engine/conditions.test.ts` - Unit tests

## Testing
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing completed

## Related Issues
Closes #42

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Or create PR manually on GitHub:
- Go to: https://github.com/gysanyi950113/loyalty-quests-shopify-app/pulls
- Click "New pull request"
- Base: `develop` ← Compare: `feature/your-feature-name`
- Fill in title and description

### 5. Code Review

- Request reviewers
- Address feedback and push changes:

```bash
# Make requested changes
git add .
git commit -m "fix: address PR feedback"
git push
```

### 6. Merge After Approval

Once approved, merge using one of these methods:

**Option A: Squash and Merge (Recommended for Features)**
- Keeps develop history clean
- All feature commits become one commit

**Option B: Merge Commit**
- Preserves all commit history
- Shows exact development timeline

**Option C: Rebase and Merge**
- Linear history
- No merge commit

### 7. Cleanup

```bash
# Switch back to develop
git checkout develop
git pull origin develop

# Delete local feature branch
git branch -d feature/your-feature-name

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/your-feature-name
```

---

## Release Workflow

### Creating a Release

```bash
# From develop branch
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v1.0.0

# Update version numbers, changelog, etc.
# Make any final adjustments

# Commit release preparation
git add .
git commit -m "chore: prepare release v1.0.0"

# Push release branch
git push -u origin release/v1.0.0
```

### Finalizing Release

```bash
# Create PR to main
gh pr create --base main --title "Release v1.0.0"

# After approval, merge to main
# Then merge back to develop

# Tag the release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## Hotfix Workflow

### Creating a Hotfix

```bash
# From main branch
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/critical-bug-fix

# Fix the bug
git add .
git commit -m "fix: resolve critical authentication issue"

# Push hotfix branch
git push -u origin hotfix/critical-bug-fix
```

### Deploying Hotfix

```bash
# Create PR to main
gh pr create --base main --title "Hotfix: Critical authentication bug"

# After approval, merge to main
# Also merge to develop to keep branches in sync

# Tag the hotfix
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin v1.0.1
```

---

## Quick Reference

### Feature Development

```bash
# Start
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Develop
# ... make changes ...
git add .
git commit -m "feat: description"
git push -u origin feature/my-feature

# Create PR
gh pr create --base develop --title "feat: My Feature"

# After merge
git checkout develop
git pull origin develop
git branch -d feature/my-feature
```

### Check Current Status

```bash
# See current branch and changes
git status

# See all branches
git branch -a

# See recent commits
git log --oneline -10
```

### Sync with Remote

```bash
# Update current branch
git pull

# Update all branches
git fetch --all --prune
```

---

## Best Practices

### Commit Frequency
- Commit often with logical units of work
- Each commit should be a complete, working change
- Write clear, descriptive commit messages

### Pull Request Size
- Keep PRs focused and reasonably sized
- Prefer smaller PRs (< 500 lines) when possible
- Split large features into multiple PRs

### Code Review
- Review PRs promptly
- Provide constructive feedback
- Test the changes locally when needed

### Branch Management
- Delete merged branches to keep repo clean
- Regularly sync with develop/main
- Resolve conflicts early

### Testing Before PR
- Run all tests locally
- Test manually in development environment
- Ensure code passes linting and type checking

---

## CI/CD Integration

When CI/CD is set up, every PR will automatically:

1. Run linting (ESLint)
2. Run type checking (TypeScript)
3. Run unit tests (Jest/Vitest)
4. Run integration tests
5. Build the project
6. Report results on PR

PRs can only merge when all checks pass.

---

## Branch Protection (To Be Configured)

Recommended protection rules:

### `main` Branch
- Require pull request reviews (at least 1)
- Require status checks to pass
- Require branches to be up to date
- No force pushes
- No deletions

### `develop` Branch
- Require pull request reviews (at least 1)
- Require status checks to pass
- Allow force pushes by admins (for cleanup)

---

## Troubleshooting

### Merge Conflicts

```bash
# Update your branch with latest develop
git checkout feature/my-feature
git fetch origin
git merge origin/develop

# Resolve conflicts in your editor
# After resolving:
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

### Accidentally Committed to Wrong Branch

```bash
# Save your changes
git stash

# Switch to correct branch
git checkout correct-branch

# Apply your changes
git stash pop
```

### Undo Last Commit (Not Pushed)

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes and commit
git reset --hard HEAD~1
```

---

## Examples from Documentation

### Creating Quest Engine Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/quest-engine

# Use Quest Engine subagent to create quest system
# Develop, test, commit...

git add .
git commit -m "feat: implement quest engine with ORDER_COUNT condition

- Add quest condition evaluator
- Implement progress tracking with Redis cache
- Create Prisma models for quests and conditions
- Add comprehensive unit tests

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push -u origin feature/quest-engine

gh pr create --base develop --title "feat: Implement Quest Engine" --body "$(cat <<'EOF'
## Summary
Complete quest engine implementation with ORDER_COUNT condition type

## Changes
- Quest condition evaluator service
- Progress tracking with caching
- Prisma database models
- Unit and integration tests

## Testing
- [x] All tests passing
- [x] Manual testing in dev environment

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Contact

For questions about this workflow, refer to:
- Main README: `README.md`
- Architecture: `.claude/docs/architect.md`
- Next Steps: `NEXT-STEPS.md`

---

**Repository:** https://github.com/gysanyi950113/loyalty-quests-shopify-app
