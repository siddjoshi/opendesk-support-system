@echo off
REM This script helps with setting up the development environment on Windows

REM Create necessary directories
echo Creating logs directory for backend...
if not exist backend\logs mkdir backend\logs

REM Create .env files if they don't exist
echo Setting up environment files...
if not exist backend\.env copy backend\.env.example backend\.env
if not exist frontend\.env copy frontend\.env.example frontend\.env

REM Install dependencies
echo Installing dependencies...
call npm run install:all

echo Setup completed successfully.
echo Run 'npm start' to start the development server.
