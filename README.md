<div align="center">
    <p><a href="https://inferadb.com"><img src=".github/inferadb.png" width="100" alt="InferaDB Logo" /></a></p>
    <h1>InferaDB Management Dashboard</h1>
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
| React          | UI components        |
| Tailwind CSS   | Styling              |
| Vite           | Build tooling        |

## Development

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint code
npm run test      # Run tests
```

## Configuration

| Variable          | Default                 | Description |
| ----------------- | ----------------------- | ----------- |
| `CONTROL_API_URL` | `http://localhost:8081` | Control API |
| `ENGINE_API_URL`  | `http://localhost:8080` | Engine API  |

## License

[Apache License 2.0](LICENSE)
