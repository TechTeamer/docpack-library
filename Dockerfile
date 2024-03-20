# Use Node.js version 16 as the base for the build stage
FROM node:16 AS build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Copy Babel configuration
COPY .babelrc ./

# Copy the source code of the application
COPY src/ ./src/

# Install dependencies, including 'devDependencies' which should include Babel
RUN npm install

# Run the build script defined in package.json, which should use Babel to transpile the code
RUN npm run build

# Start a new stage for the production environment to create a smaller image
FROM node:16 AS production-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) again in the production stage
COPY package*.json ./

# Copy the built application from the previous stage to the production stage
COPY --from=build-stage /app/dist ./dist

# Install only production dependencies
RUN npm install --only=production

# Set the environment variable for the port the server will listen on
ENV PORT 80

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Command to run the application
CMD ["node", "dist/index.js"]
