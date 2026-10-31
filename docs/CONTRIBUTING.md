# Contributing to destiny

Thank you for your interest in contributing to destiny! This document outlines the guidelines and workflow for contributing to the project.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Format](#commit-message-format)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/destiny.git
   cd destiny
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/dinirixtechlabs/destiny.git
   ```
4. **Create a branch** for your work (see [Branch Naming Convention](#branch-naming-convention)).
5. Make your changes, commit, push, and open a Pull Request.

---

## Git Workflow

We follow a **feature-branch workflow**:

```
main (stable, production-ready)
 └── develop (integration branch)
      ├── feature/your-feature
      ├── bugfix/fix-description
      └── hotfix/critical-fix
```

1. Always branch off `develop` for new work.
2. Keep your branch up to date with `develop`:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```
3. Once your work is complete, open a Pull Request targeting `develop`.
4. After review and approval, your branch will be merged into `develop`.
5. Periodically, `develop` is merged into `main` for releases.

---

## Branch Naming Convention

Use the following prefixes for branch names:

| Prefix | Use Case | Example |
|---|---|---|
| `feature/` | New features or enhancements | `feature/ride-booking-api` |
| `bugfix/` | Bug fixes | `bugfix/fix-login-redirect` |
| `hotfix/` | Critical production fixes | `hotfix/patch-jwt-expiry` |
| `docs/` | Documentation changes | `docs/update-api-design` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/clean-up-serializers` |
| `test/` | Adding or updating tests | `test/add-ride-api-tests` |

**Rules:**
- Use lowercase letters.
- Separate words with hyphens (`-`).
- Keep names short but descriptive.

---

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (deps, configs, CI) |
| `perf` | Performance improvements |

### Scopes

Use the component name as scope: `backend`, `admin-dashboard`, `passenger-app`, `driver-app`, `docs`.

### Examples

```
feat(backend): add ride booking API endpoint
fix(passenger-app): resolve map not loading on Android
docs(docs): update API design with fare endpoints
chore(admin-dashboard): upgrade Tailwind CSS to v4
refactor(backend): extract fare calculation into a utility
```

---

## Code Style Guidelines

### Python (Backend)

- Follow [PEP 8](https://peps.python.org/pep-0008/) style guidelines.
- Use **4 spaces** for indentation (no tabs).
- Maximum line length: **120 characters**.
- Use **type hints** where practical.
- Write **docstrings** for all public classes, functions, and modules.
- Use `snake_case` for variables, functions, and file names.
- Use `PascalCase` for class names.
- Keep imports organized: standard library → third-party → local (use `isort`).
- Use Django conventions for models, serializers, and views.

### JavaScript / TypeScript (Admin Dashboard & Mobile Apps)

- Follow standard React / React Native conventions.
- Use **2 spaces** for indentation.
- Use **functional components** with hooks (no class components).
- Use `camelCase` for variables and functions.
- Use `PascalCase` for component names and file names.
- Prefer `const` over `let`; avoid `var`.
- Use **arrow functions** for callbacks and inline functions.
- Keep components small and focused — one component per file.
- Use meaningful prop names and destructure props.
- Handle loading and error states in every component that fetches data.

### General

- Remove all `console.log` / `print` statements before committing (except intentional logging).
- Do not commit `.env` files, secrets, or API keys.
- Write self-documenting code; add comments only when logic is non-obvious.
- Keep functions short and single-purpose.

---

## Pull Request Process

### Before Submitting

1. Ensure your code follows the [Code Style Guidelines](#code-style-guidelines).
2. Test your changes locally.
3. Update documentation if your changes affect APIs, setup steps, or behavior.
4. Rebase your branch on the latest `develop`:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```
5. Resolve any merge conflicts.

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature
   ```
2. Open a Pull Request on GitHub targeting the `develop` branch.
3. Fill in the PR template with:
   - **Description** — What does this PR do?
   - **Related Issue** — Link to the relevant issue (e.g., `Closes #42`).
   - **Type of Change** — Feature / Bug Fix / Docs / Refactor / etc.
   - **Testing** — How was this tested?
   - **Screenshots** — Include UI screenshots if applicable.

### Review Process

1. At least **1 approving review** is required before merging.
2. Reviewers may request changes — address feedback and push updates to the same branch.
3. Keep the PR focused on a single concern. Avoid mixing unrelated changes.
4. Once approved, the maintainer will **squash and merge** the PR.

---

## Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/dinirixtechlabs/destiny/issues) with:

- **Title** — Clear, concise summary.
- **Description** — Steps to reproduce (for bugs) or detailed explanation (for features).
- **Environment** — OS, browser/device, Node.js version, Python version.
- **Screenshots / Logs** — If applicable.

---

Thank you for helping make destiny better! 🚀
