# Use a Node.js image to build the application
FROM node:alpine3.20 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) into the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Build the React application for production
RUN npm run build

# Use Node.js to serve the build
FROM node:alpine3.20

# Set the working directory inside the container
WORKDIR /app

# Copy the built application from the build stage into the current image
COPY --from=build /app/dist /app/dist

# Install a simple HTTP server (like `serve`) to serve the production build
RUN npm install -g serve

# Expose port 5000 for the application
EXPOSE 5000

# Start the server to serve the build directory
CMD ["serve", "-s", "dist", "-l", "5000"]
