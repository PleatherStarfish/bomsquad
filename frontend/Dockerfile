# Stage 1: Build the app
FROM node:14.17.6-alpine AS builder

# Set the working directory
WORKDIR /code

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Run modclean to remove unused modules and files
RUN npx modclean --path ./node_modules --no-progress --keep-empty

# Build the React app
RUN npm run build

# Stage 2: Production image
FROM node:14.17.6-alpine

# Set the working directory
WORKDIR /app

# Copy the built app from the builder stage
COPY --from=builder /code/build /app/build

# Copy entrypoint.sh and make it executable
COPY --from=builder /code/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

# Expose port 3000 for the React app
EXPOSE 3000

# Start the app
ENTRYPOINT ./entrypoint.sh