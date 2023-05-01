# Use an official Node runtime as a parent image
FROM node:14.17.6-alpine AS base

# Set the working directory to /code
WORKDIR /code

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Production stage
FROM node:14.17.6-alpine

# Set the working directory to /app
WORKDIR /app

# Copy only the necessary files and production dependencies from the build stage
COPY --from=base /code/node_modules ./node_modules
COPY . .

# Run modclean to remove unused modules and files
RUN npx modclean --path ./node_modules --no-progress --keep-empty

# Copy the entrypoint script and make it executable
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

# Expose port 3000 for the React app
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT "./entrypoint.sh"