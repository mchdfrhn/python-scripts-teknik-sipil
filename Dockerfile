# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/civil-scripts-web

# Copy package files for dependency installation
COPY civil-scripts-web/package.json civil-scripts-web/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend source code
COPY civil-scripts-web/ ./

# Build the frontend (outputs to /app/civil-scripts-web/dist)
RUN npm run build

# Stage 2: Create the production runner
FROM python:3.11-slim AS runner
WORKDIR /app/backend

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/main.py ./

# Copy built frontend assets from the builder stage
COPY --from=frontend-builder /app/civil-scripts-web/dist ./dist

# Expose default port
EXPOSE 8000

# Start the FastAPI server using the dynamic PORT environment variable (default: 8000)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
