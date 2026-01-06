# Contributing to InferaDB Dashboard

Thank you for your interest in contributing to the InferaDB Dashboard!

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 24+ (we recommend using [mise](https://mise.jdx.dev/))
- npm 10+

### Getting Started

```bash
# Clone the repository
git clone https://github.com/inferadb/dashboard
cd dashboard

# Install tool versions (if using mise)
mise install

# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173).

## Code Quality

Before submitting a pull request, ensure all checks pass:

```bash
# Type checking (auto-generates route types)
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format:check

# Or fix formatting issues automatically
npm run format
```

### Code Style

- **TypeScript**: Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- **Formatting**: Prettier with default settings (see `.prettierrc`)
- **Linting**: ESLint 9 with flat config (see `eslint.config.js`)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `policy-editor.tsx` |
| Components | PascalCase | `PolicyEditor` |
| Hooks | camelCase with `use` prefix | `useToast` |
| Types/Interfaces | PascalCase | `ApiError` |

### Import Aliases

Use the `@/` alias for imports from the `src/` directory:

```typescript
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/           # Base UI primitives (shadcn/ui style)
│   ├── layout/       # Header, Sidebar
│   └── ...           # Feature components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and API clients
├── routes/           # TanStack file-based routes
└── types/            # TypeScript type definitions
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass (`npm run typecheck && npm run lint && npm run format:check`)
4. Submit a pull request with a clear description

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run with coverage
npm run test:coverage
```

## Questions?

Open an issue on GitHub if you have questions or need help.
