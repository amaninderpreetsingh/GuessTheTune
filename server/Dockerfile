# Use Node.js 18 LTS as base image
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
