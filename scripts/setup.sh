#!/bin/bash
# This script helps with setting up the development environment

# Create necessary directories
echo "Creating logs directory for backend..."
mkdir -p backend/logs

# Create .env files if they don't exist
echo "Setting up environment files..."
[ ! -f backend/.env ] && cp backend/.env.example backend/.env
[ ! -f frontend/.env ] && cp frontend/.env.example frontend/.env

# Install dependencies
echo "Installing dependencies..."
npm run install:all

echo "Setup completed successfully."
echo "Run 'npm start' to start the development server."
