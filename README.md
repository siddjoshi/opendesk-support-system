# OpenDesk - Customer Support Ticketing System

This repository contains the OpenDesk application, a web-based SaaS platform for customer support ticket management.

## Project Structure

```
/opendesk
  /frontend      # React application
  /backend       # Express API
  /docs          # Documentation
  /scripts       # Deployment and utility scripts
  docker-compose.yml
  .github/workflows  # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url> opendesk
   cd opendesk
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   Edit the .env files with your configuration.

4. Start the development environment:
   ```bash
   # Using npm scripts
   npm start
   
   # Or using Docker
   docker-compose up
   ```

## Features

### MVP (Phase 1)

- Ticketing system (web form + email)
- Agent dashboard
- Basic admin features
- Authentication system

## License

[MIT License](LICENSE)
