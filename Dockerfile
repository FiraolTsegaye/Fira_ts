# -------------------- Stage 1: Build Dependencies --------------------
FROM node:22-alpine AS deps

WORKDIR /app/backend

# Install build tools required for native SQLite compilation
RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci --omit=dev

# -------------------- Stage 2: Production Runtime --------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime C++ library
RUN apk add --no-cache libstdc++

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy code and dependencies
COPY --from=deps --chown=appuser:appgroup /app/backend/node_modules ./backend/node_modules
COPY --chown=appuser:appgroup backend/ ./backend/
COPY --chown=appuser:appgroup frontend/ ./frontend/

# Set working directory to backend where server.js and DB files execute
WORKDIR /app/backend

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]