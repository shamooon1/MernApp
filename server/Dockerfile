# /backend/Dockerfile

# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your Express server runs on (e.g., 5000)
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]