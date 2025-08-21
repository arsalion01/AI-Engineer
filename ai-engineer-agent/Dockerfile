# Production Docker Configuration for AI Engineer Agent
# Multi-stage build for optimal production deployment

# ============================================================================
# Build Stage - Frontend
# ============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install bun for faster package management
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# ============================================================================
# Build Stage - Backend API
# ============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install dependencies for backend services
RUN npm install -g typescript ts-node

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Build backend if using TypeScript
RUN npm run build 2>/dev/null || echo "No backend build step found"

# ============================================================================
# Production Stage
# ============================================================================
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    postgresql-client \
    redis \
    nginx

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend from builder stage
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/package.json ./

# Copy backend services
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend ./backend

# Copy additional configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh ./start.sh
COPY database/migration.sql ./database/migration.sql

# Make start script executable
RUN chmod +x ./start.sh

# Install production node modules
RUN npm install --only=production && npm cache clean --force

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/log/app && \
    chown -R nextjs:nodejs /var/log/app

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose ports
EXPOSE 3000 8080

# Start with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["./start.sh"]