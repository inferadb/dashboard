# InferaDB Dashboard - Essential Commands

## Development
```bash
npm run dev          # Start dev server (port 5173)
make dev             # Same, with mise support
```

## Building
```bash
npm run build        # Development build
make release         # Production build (NODE_ENV=production)
npm run preview      # Preview production build
```

## Testing
```bash
npm run test         # Run Vitest tests (watch mode)
npm test -- --run    # Run tests once
make test            # Run tests once via Makefile
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Run tests with coverage
```

## Code Quality
```bash
npm run lint         # ESLint (*.ts, *.tsx)
npm run lint:fix     # ESLint with auto-fix
npm run typecheck    # TypeScript type checking (tsc --noEmit)
make check           # Lint + typecheck
make format          # Prettier formatting
```

## CI/CD
```bash
make ci              # Full CI pipeline: lint → typecheck → test
```

## Cleanup
```bash
make clean           # Remove dist, .output, .vinxi
make reset           # Full reset (removes node_modules too)
```

## System Utilities (macOS/Darwin)
```bash
git status/log/diff  # Version control
ls -la               # List files
find . -name "*.ts"  # Find files
grep -r "pattern"    # Search content (or use Serena's search_for_pattern)
```
