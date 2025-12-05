# InferaDB Dashboard

**Web console** — policy design, simulation, and observability for InferaDB authorization.

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

| Technology    | Purpose              |
| ------------- | -------------------- |
| TanStack Start| Full-stack framework |
| React         | UI components        |
| Hono          | API routes           |
| Tailwind CSS  | Styling              |
| Vite          | Build tooling        |

## Development

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint code
npm run test      # Run tests
```

## Configuration

| Variable              | Default                 | Description          |
| --------------------- | ----------------------- | -------------------- |
| `MANAGEMENT_API_URL`  | `http://localhost:8081` | Management API       |
| `SERVER_API_URL`      | `http://localhost:8080` | Server API           |

## License

[Apache License 2.0](LICENSE)
