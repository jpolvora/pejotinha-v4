# Plan - Fix Next.js Lint Error

The current `npm run check:all` command fails because `next lint` is incorrectly looking for a directory named `lint`, which does not exist in the project structure.

## 🔍 Analysis
- **Problem**: `next lint` reports `Invalid project directory provided, no such directory: C:\Users\galaxy\source\pejotinha-v4\lint`.
- **Project Structure**: Source code is located in `src/`.
- **Hypothesis**: `next lint` might be defaulting to paths that don't exist or is being passed an erroneous argument. Specifying the target directories might fix this.

## 🛠️ Proposed Changes
### 1. Update `package.json`
- Modify the `lint` script to explicitly include the source directory: `next lint src`.
- Alternatively, check for any `.eslintrc.json` that might be misconfigured.

### 2. Verification
- Run `npm run lint` manually.
- Run `npm run check:all`.

## ✅ Success Criteria
- `npm run check:all` runs to completion (or at least past the linting phase).
- Next.js linting is correctly applied to the `src/` directory.
