# InferaDB Dashboard - Project Overview

## Purpose
Web console for InferaDB authorization system, providing:
- **Tenant Management** — Organizations, teams, and vaults
- **Policy Editor** — IPL (InferaDB Policy Language) with syntax highlighting
- **Decision Simulator** — Test authorization before deployment
- **Relationship Visualizer** — Interactive graph exploration
- **Audit Explorer** — Review authorization decisions

## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (full-stack React framework) |
| Router | TanStack Router (file-based routing) |
| UI | React 19 + Radix UI primitives |
| Styling | Tailwind CSS v4 + class-variance-authority |
| Forms | TanStack Form |
| Tables | TanStack Table |
| Editor | CodeMirror 6 (IPL policy editor) |
| Graphs | React Flow + D3.js |
| Build | Vite 7 |
| Testing | Vitest + @vitest/ui + @vitest/coverage-v8 |
| Validation | Zod v4 |

## Project Structure
```
src/
├── components/       # React components
│   ├── ui/           # Base UI primitives (shadcn/ui style)
│   ├── layout/       # Header, Sidebar
│   ├── policy-editor/# CodeMirror IPL editor
│   ├── relationship-graph/
│   ├── audit-log/
│   └── bulk-operations/
├── hooks/            # Custom React hooks
├── lib/              # Utilities and API clients
│   ├── api.ts        # ApiClient class for HTTP requests
│   ├── auth.ts       # Authentication utilities
│   ├── organizations.ts, teams.ts, vaults.ts, clients.ts
│   └── utils.ts      # cn() helper, date formatters
├── routes/           # TanStack file-based routes
│   ├── __root.tsx    # Root layout
│   ├── _authed.tsx   # Authenticated layout wrapper
│   └── _authed/      # Protected routes (orgs, teams, vaults)
└── types/            # TypeScript types
    └── api.ts        # API response types
```

## Configuration
| Variable | Default | Purpose |
|----------|---------|---------|
| CONTROL_API_URL | http://localhost:8081 | Control Plane API |
| ENGINE_API_URL | http://localhost:8080 | Authorization Engine API |

## Path Aliases
- `@/*` → `./src/*` (configured in tsconfig.json)
