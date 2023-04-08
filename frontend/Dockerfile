# Use an official Node runtime as a parent image
FROM node:14.17.6-alpine

# Set the working directory to /app
WORKDIR /code/

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app to the container
COPY . .
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

# Expose port 3000 for the React app
EXPOSE 3000

ENTRYPOINT ./entrypoint.sh
