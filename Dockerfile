# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy all files explicitly
COPY server/ ./server/
COPY client/ ./client/
COPY Procfile ./
COPY railway.json ./
COPY env.example ./

# Debug: List files to verify copying
RUN echo "=== Root directory ==="
RUN ls -la /app/
RUN echo "=== Client directory ==="
RUN ls -la /app/client/
RUN echo "=== Client public directory ==="
RUN ls -la /app/client/public/
RUN echo "=== Looking for index.html ==="
RUN find /app -name "index.html" -type f

# Build React app
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
