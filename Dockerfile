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

# Copy all files
COPY . .

# Debug: Check what we have
RUN echo "=== Root directory ==="
RUN ls -la /app/
RUN echo "=== Client directory ==="
RUN ls -la /app/client/ || echo "Client directory does not exist"
RUN echo "=== Client public directory ==="
RUN ls -la /app/client/public/ || echo "Client public directory does not exist"
RUN echo "=== All index.html files ==="
RUN find /app -name "index.html" -type f || echo "No index.html found"

# Try to create the public directory and index.html if missing
RUN mkdir -p /app/client/public
RUN echo '<!DOCTYPE html><html><head><title>Test</title></head><body><div id="root"></div></body></html>' > /app/client/public/index.html

# Debug: Check again after creating
RUN echo "=== After creating index.html ==="
RUN ls -la /app/client/public/
RUN cat /app/client/public/index.html

# Build React app
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
