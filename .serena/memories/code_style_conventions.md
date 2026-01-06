# InferaDB Dashboard - Code Style & Conventions

## TypeScript Configuration
- **Target**: ES2022
- **Strict mode**: enabled
- **noUnusedLocals**: true
- **noUnusedParameters**: true
- **No explicit return types required** (inferred)

## Naming Conventions
- **Files**: kebab-case (e.g., `policy-editor.tsx`, `use-toast.ts`)
- **Components**: PascalCase (e.g., `PolicyEditor`, `Button`)
- **Hooks**: camelCase with `use` prefix (e.g., `useToast`)
- **Types/Interfaces**: PascalCase (e.g., `ApiError`, `User`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants, camelCase for const bindings

## React Patterns

### Components
- Use function components with named exports
- Use `React.forwardRef` for components accepting refs
- Set `displayName` for forwardRef components

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return <button ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { Button };
```

### Hooks
- Custom hooks in `src/hooks/` directory
- Export named functions (not default exports)

### Routes (TanStack Router)
- File-based routing under `src/routes/`
- Use `createFileRoute()` pattern
- `_authed.tsx` layout for authenticated routes
- Dynamic params: `$paramName` (e.g., `$orgId.tsx`)

```tsx
export const Route = createFileRoute("/_authed/organizations/$orgId")({
  beforeLoad: async ({ params }) => { /* ... */ },
  component: OrgPage,
});
```

## Styling Patterns

### Tailwind CSS
- Use `cn()` utility from `@/lib/utils` for class merging
- Use class-variance-authority (cva) for component variants
- Semantic color tokens (e.g., `text-muted-foreground`, `bg-primary`)

```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-classes", conditional && "conditional-class")} />
```

### UI Components (shadcn/ui style)
- Located in `src/components/ui/`
- Radix UI primitives as base
- Composable with variant props

## API Patterns

### ApiClient Class
- Singleton instance exported as `api` from `@/lib/api.ts`
- Methods: `get<T>()`, `post<T>()`, `patch<T>()`, `delete<T>()`
- Throws `ApiClientError` on non-2xx responses
- Credentials included via cookies

```tsx
import { api } from "@/lib/api";
const orgs = await api.get<Organization[]>("/v1/organizations");
```

## Import Order (Convention)
1. React imports
2. External libraries
3. Internal aliases (`@/lib/...`, `@/components/...`)
4. Relative imports
5. Types (use `import type` where applicable)
