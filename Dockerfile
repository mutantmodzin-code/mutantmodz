FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy server code
WORKDIR /app
COPY server/ ./server/

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Start the server
WORKDIR /app/server
CMD ["npm", "start"]
