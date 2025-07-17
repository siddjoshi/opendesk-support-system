# OpenDesk MVP Project Structure

This document outlines the structure and setup of the OpenDesk Minimum Viable Product (MVP).

## Directory Structure

```
/opendesk
  /frontend                     # React frontend application
    /public                     # Static assets
    /src
      /components               # Reusable UI components
        /layout                 # Layout components
      /context                  # React context providers
      /layouts                  # Page layout templates
      /pages                    # Route components/pages
      /services                 # API service functions
      /styles                   # CSS/styling files
      /utils                    # Utility functions
  /backend                      # Node.js/Express API
    /src
      /config                   # Configuration files
      /controllers              # Route controllers
      /middleware               # Express middleware
      /models                   # Database models
      /routes                   # API routes
      /services                 # Business logic
  /docs                         # Documentation
  /scripts                      # Utility scripts
  /.github/workflows            # GitHub Actions CI/CD
  docker-compose.yml            # Docker setup
```

## Technology Stack

### Frontend
- React (with TypeScript)
- React Router for routing
- Context API for state management
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Sequelize ORM
- JWT for authentication
- Winston for logging

### DevOps
- Docker and Docker Compose
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites
- Node.js (v16+)
- Docker and Docker Compose
- PostgreSQL

### Setup
1. Clone the repository
2. Create `.env` files from the `.env.example` files
3. Run `npm run install:all` to install all dependencies
4. Start the application:
   - Development: `npm start`
   - With Docker: `docker-compose up`

## MVP Features

The MVP focuses on the core ticketing system functionality:

1. **User Authentication**
   - Login/Registration
   - Role-based access control (Admin, Agent, Customer)

2. **Ticket Management**
   - Create tickets
   - Assign tickets to agents
   - Update ticket status
   - Add comments/replies

3. **Admin Controls**
   - User management
   - Basic configuration

## Development Notes

- The frontend is set up with Tailwind CSS for rapid UI development
- The backend follows a Controller-Service-Model pattern
- API routes are versioned and protected with JWT authentication
- Database models are defined with TypeScript and Sequelize ORM
