FROM node:18-alpine

WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev
RUN apk add --no-cache libc6-compat pixman

# Copy package.json and package-lock.json first (if available) for caching
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Install nodemon globally (optional)
RUN npm install -g nodemon

# Copy all project files
COPY . .

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3001 

# Start the application
CMD ["npm", "start"]

