# Git Workflow Guide

> This document defines how to use Git properly throughout the Destiny project to keep code clean, organized, and safe.

---

## 1. Initial Repository Setup

### Step 1 — Initialize Git in the project root
```bash
cd destiny
git init
```

### Step 2 — Create .gitignore
Make sure `.gitignore` exists at the root (see `ENVIRONMENT_SETUP.md` for contents).

### Step 3 — First Commit
```bash
git add .
git commit -m "Initial project setup"
```

### Step 4 — Create GitHub Repository
- Go to https://github.com
- Click "New Repository"
- Name it: `destiny`
- Set to Private
- Do NOT initialize with README (we already have files)

### Step 5 — Connect Local to GitHub
```bash
git remote add origin https://github.com/your-username/destiny.git
git branch -M main
git push -u origin main
```

---

## 2. Branch Strategy

The project uses the following branches:

```
main
└── develop
    ├── feature/backend-auth
    ├── feature/backend-rides
    ├── feature/admin-dashboard
    ├── feature/passenger-app-auth
    ├── feature/driver-app
    └── fix/login-bug
```

### Branch Descriptions

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only. Never push directly here. |
| `develop` | Active development branch. Merge features here first. |
| `feature/*` | New features or modules being built |
| `fix/*` | Bug fixes |
| `hotfix/*` | Urgent fixes for production issues |

---

## 3. Branch Naming Rules

Use lowercase with hyphens. Always be descriptive.

### Feature branches:
```
feature/backend-auth
feature/backend-rides
feature/backend-locations
feature/admin-dashboard
feature/admin-driver-management
feature/passenger-app-auth
feature/passenger-app-home
feature/passenger-app-ride-tracking
feature/driver-app-auth
feature/driver-app-ride-request
```

### Fix branches:
```
fix/login-token-error
fix/ride-status-bug
fix/fare-calculation
```

---

## 4. Daily Workflow

### Step 1 — Always start from develop
```bash
git checkout develop
git pull origin develop
```

### Step 2 — Create a new feature branch
```bash
git checkout -b feature/backend-auth
```

### Step 3 — Work on your code
Make your changes, write your code.

### Step 4 — Stage and commit your changes
```bash
git add .
git commit -m "feat: add user registration API"
```

### Step 5 — Push your branch to GitHub
```bash
git push origin feature/backend-auth
```

### Step 6 — Merge into develop when feature is complete
```bash
git checkout develop
git merge feature/backend-auth
git push origin develop
```

### Step 7 — Delete the feature branch (optional, keeps it clean)
```bash
git branch -d feature/backend-auth
```

---

## 5. Commit Message Rules

Use this format for all commit messages:

```
type: short description
```

### Types:

| Type | When to Use |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Adding or updating documentation |
| `style` | Code formatting, no logic change |
| `refactor` | Code restructuring, no feature change |
| `test` | Adding or updating tests |
| `chore` | Setup, config, dependencies |

### Examples:
```bash
git commit -m "feat: add passenger registration API"
git commit -m "feat: add ride booking endpoint"
git commit -m "fix: fix JWT token expiry issue"
git commit -m "docs: add API documentation"
git commit -m "chore: add requirements.txt"
git commit -m "refactor: clean up ride serializer"
git commit -m "style: format models.py"
```

---

## 6. Merging to Main (Release)

Only merge to `main` when a full phase is complete and tested.

```bash
git checkout main
git merge develop
git push origin main
git tag -a v1.0.0 -m "Phase 1 - Backend Complete"
git push origin v1.0.0
```

### Version Tags:
```
v1.0.0 — Backend API Complete
v1.1.0 — Admin Dashboard Complete
v1.2.0 — Passenger App Complete
v1.3.0 — Driver App Complete
v2.0.0 — Major new version
```

---

## 7. Useful Git Commands

### Check current status
```bash
git status
```

### See commit history
```bash
git log --oneline
```

### See all branches
```bash
git branch -a
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Discard all local changes
```bash
git checkout -- .
```

### Pull latest changes
```bash
git pull origin develop
```

---

## 8. Rules to Always Follow

- ✅ Always pull before starting work: `git pull origin develop`
- ✅ Always work on a feature branch — never directly on `main` or `develop`
- ✅ Commit often — small, focused commits are better than one huge commit
- ✅ Write meaningful commit messages
- ✅ Never commit `.env` files or `node_modules/` or `venv/`
- ✅ Push your branch to GitHub at end of every work session
- ❌ Never force push to `main`: `git push --force` on main is forbidden
- ❌ Never commit passwords, API keys, or secrets

---

## 9. Git Flow Summary

```
Start Work
    ↓
git checkout develop
git pull origin develop
    ↓
git checkout -b feature/your-feature
    ↓
Write Code
    ↓
git add .
git commit -m "feat: your message"
    ↓
git push origin feature/your-feature
    ↓
Feature Done?
    ↓
git checkout develop
git merge feature/your-feature
git push origin develop
    ↓
Phase Done?
    ↓
git checkout main
git merge develop
git tag v1.x.x
git push origin main
```

---

*Document Version: 1.0*
*Project: Destiny Ride-Booking Platform*

