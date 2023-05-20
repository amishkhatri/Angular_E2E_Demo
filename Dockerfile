# Base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory into the container
COPY . .

# Build the Angular app
RUN npm run build

# Expose the port your Angular app will run on (default is 4200)
EXPOSE 4200

# Start the Angular app
CMD ["npm", "start"]
