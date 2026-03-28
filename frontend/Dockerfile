# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set work directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy local build to Nginx serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# For the single-origin architecture with Docker Compose, we keep it simple.
# The user's Vite proxy configuration is for dev, so for production, 
# a custom nginx.conf would be needed to proxy /api to the backend.
# But for now, we'll stop at the standard Nginx serving.

CMD ["nginx", "-g", "daemon off;"]
