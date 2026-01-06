# InferaDB Dashboard - Essential Commands

## Development
```bash
npm run dev          # Start dev server (port 5173)
```

## Building
```bash
npm run build        # Production build
npm run preview      # Preview production build
npm run start        # Start production server
```

## Testing
```bash
npm test             # Run Vitest tests (watch mode)
npm test -- --run    # Run tests once
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Run tests with coverage
```

## Code Quality
```bash
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier formatting
npm run format:check # Check formatting
```

## Full CI Check
```bash
npm run typecheck && npm run lint && npm run format:check
```

## Tool Management
```bash
mise install         # Install tool versions from .mise.toml
```

## System Utilities (macOS/Darwin)
```bash
git status/log/diff  # Version control
ls -la               # List files
```