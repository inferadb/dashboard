# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 dashboard

# Copy built application (TanStack Start outputs to dist/)
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/server.mjs /app/server.mjs
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Install production dependencies only (needed for SSR server runtime)
RUN npm ci --omit=dev

# Set ownership
RUN chown -R dashboard:nodejs /app

USER dashboard

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the server (custom wrapper that starts HTTP server with SSR handler)
CMD ["node", "server.mjs"]
