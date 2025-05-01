FROM node:20-alpine as base

# Set working directory
WORKDIR /app

# Copy package files for efficient caching
COPY package*.json ./

# Install production dependencies
FROM base as production-deps
RUN npm ci --only=production

# Build stage for development
FROM base as development
ENV NODE_ENV=development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Build stage for production
FROM base as production
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose the application port
EXPOSE 3000

# Start application
CMD ["npm", "start"] 