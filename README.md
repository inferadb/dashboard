<div align="center">
    <p><a href="https://inferadb.com"><img src=".github/inferadb.png" width="100" alt="InferaDB Logo" /></a></p>
    <h1>InferaDB Management Dashboard</h1>
    <p>
        <a href="https://codecov.io/github/inferadb/dashboard"><img src="https://codecov.io/github/inferadb/dashboard/graph/badge.svg?token=S4493HEHYQ" alt="Code Coverage" /></a>
        <a href="#license"><img src="https://img.shields.io/badge/license-MIT%2FApache--2.0-blue.svg"></a>
    </p>
    <p>Account management, policy design, simulation and observability</p>
</div>

> [!IMPORTANT]
> Under active development. Not production-ready.

## Features

- **Tenant Management** — Create and manage organizations, teams, and vaults
- **Policy Editor** — Edit IPL schemas with syntax highlighting and validation
- **Decision Simulator** — Test authorization decisions before deployment
- **Relationship Visualizer** — Explore relationship graphs interactively
- **Audit Explorer** — Review authorization decisions and access patterns

## Quick Start

```bash
git clone https://github.com/inferadb/dashboard && cd dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Stack

| Technology     | Purpose              |
| -------------- | -------------------- |
| TanStack Start | Full-stack framework |
| React 19       | UI components        |
| Tailwind CSS 4 | Styling              |
| Vite 7         | Build tooling        |
| Vitest         | Testing              |

## Development

```bash
# Start development server with hot reload
npm run dev

# Run code quality checks
npm run generate:routes # Generate TanStack Router types
npm run typecheck      # TypeScript type checking (auto-generates routes)
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Format with Prettier
npm run format:check   # Check formatting

# Testing
npm test               # Run tests in watch mode
npm test -- --run      # Run tests once
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage

# Build
npm run build          # Production build
npm run preview        # Preview production build
npm run start          # Start production server
```

## Configuration

| Variable          | Default                 | Description |
| ----------------- | ----------------------- | ----------- |
| `CONTROL_API_URL` | `http://localhost:8081` | Control API |
| `ENGINE_API_URL`  | `http://localhost:8080` | Engine API  |

## Tool Versions

This project uses [mise](https://mise.jdx.dev/) for tool version management. Run `mise install` to install the correct versions of Node.js and other tools.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Licensed under either of:

- [Apache License, Version 2.0](LICENSE-APACHE)
- [MIT License](LICENSE-MIT)

at your option.
