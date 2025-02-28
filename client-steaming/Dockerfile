# Use a lightweight Node.js image
FROM node:18-alpine 

# Set working directory
WORKDIR /app 

# Copy package.json and package-lock.json to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application
COPY . . 

# Expose the required port (modify as needed)
EXPOSE 3200 

# Start the microservice
CMD ["node", "client-steaming.js"]

