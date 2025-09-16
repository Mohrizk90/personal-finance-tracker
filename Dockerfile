# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy server files
COPY server/ ./server/

# Copy client files
COPY client/ ./client/

# Copy other necessary files
COPY Procfile ./
COPY railway.json ./
COPY env.example ./

# Build the React app
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
