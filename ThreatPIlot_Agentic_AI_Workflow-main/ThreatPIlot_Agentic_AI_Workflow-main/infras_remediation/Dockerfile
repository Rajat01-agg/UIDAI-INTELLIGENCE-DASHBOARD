# Use official Node.js runtime
FROM node:18-alpine

# Set working directory inside image
WORKDIR /app

# Copy package.json first (better caching)
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Expose port 3000 (your app port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
