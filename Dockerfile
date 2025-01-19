# Use a Node.js image
FROM node:16-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
