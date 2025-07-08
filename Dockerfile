# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

#Changed npm install to npm ci (Better for reproducible builds)
RUN npm ci --legacy-peer-deps

# Copy the full source code and build the application
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

#Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port
EXPOSE 3000

#Added Health Check for Next.js
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider http://localhost:3000 || exit 1

#Changed CMD ["npm", "start"] to CMD ["npx", "next", "start"] (Better for Next.js)
CMD ["npx", "next", "start"]

