# Multi-stage build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build React app
RUN cd client && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (omit dev dependencies)
RUN npm install --omit=dev

# Copy built React app from builder stage
COPY --from=builder /app/client/build ./client/build

# Copy server files
COPY server/ ./server/

# Copy other necessary files
COPY Procfile ./
COPY railway.json ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
