# Task Completion Checklist

When completing a task in InferaDB Dashboard, run these checks:

## 1. Type Checking
```bash
npm run typecheck
# or
make typecheck
```
Ensure no TypeScript errors.

## 2. Linting
```bash
npm run lint
# or
npm run lint:fix   # to auto-fix issues
```
Follow ESLint rules for React and TypeScript.

## 3. Testing
```bash
npm test -- --run   # Run tests once
# or
make test
```
Ensure existing tests pass. Write tests for new functionality.

## 4. Quick Validation Combo
```bash
make check   # Runs lint + typecheck
make ci      # Runs lint + typecheck + test
```

## 5. Manual Verification
- Start dev server: `npm run dev`
- Verify the feature works at http://localhost:5173
- Check browser console for errors

## Pre-Commit Summary
```bash
make ci   # Complete CI pipeline validation
```

## Notes
- The project uses Vitest for testing
- Coverage can be checked with `npm run test:coverage`
- Format code with `make format` (Prettier) if needed
