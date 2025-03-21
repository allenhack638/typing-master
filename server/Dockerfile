# Use an official Node.js LTS image as the base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN npm install -g typescript

# Compile TypeScript to JavaScript
RUN npm run build  # This will generate the "dist" folder

# ------------------ Production Image ------------------
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only the compiled code and node_modules from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

COPY .env .env

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]
