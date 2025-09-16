# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files first
COPY . .

# Install dependencies
RUN npm install
RUN cd client && npm install

# Build the React app
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
