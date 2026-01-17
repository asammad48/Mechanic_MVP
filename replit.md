# Jules Mechanic Workshop Management System

## Overview

Jules Mechanic is a workshop management system MVP designed for automotive repair shops. The system provides role-based access control, job card management per vehicle visit, financial costing with server-side calculations, and analytics reporting. It follows a monorepo structure with separate frontend and backend applications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Project Structure
- **Monorepo layout**: Two separate applications in `/backend` and `/frontend` directories
- Each application has its own `package.json` and dependency management

### Backend Architecture
- **Framework**: Node.js with Express.js
- **Language**: TypeScript (CommonJS modules)
- **Database ORM**: Prisma with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Input Validation**: Zod schemas for request validation
- **Server-side calculations**: All financial calculations (totals, discounts, taxes) handled server-side

### API Design Pattern
- RESTful API structure organized by domain:
  - `/auth` - Authentication endpoints
  - `/users` - User management (Admin only)
  - `/customers` - Customer CRUD operations
  - `/vehicles` - Vehicle management
  - `/visits` - Job cards/visits with nested resources (labor-items, part-items, payments)
  - `/analytics` - Reporting and analytics

### Role-Based Access Control
Four user roles with hierarchical permissions:
1. **Owner/Admin** - Full system access
2. **Manager** - Management functions, analytics access
3. **Mechanic** - Visit updates, labor items
4. **Receptionist** - Customer/vehicle/visit creation, payments

### Frontend Architecture
- **Framework**: React 19 with Vite
- **Language**: JavaScript (ES modules)
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **HTTP Client**: Axios with token interceptor
- **Styling**: Emotion for styled components

### Key Design Decisions

**Prisma with PostgreSQL Adapter**: Uses `@prisma/adapter-pg` with a connection pool for database access. This provides type-safe database queries and handles migrations through Prisma's migration system.

**JWT Authentication Flow**: Tokens are stored in localStorage on the frontend and passed via Bearer token in Authorization headers. The backend middleware validates tokens and attaches user context to requests.

**Domain-Driven Route Organization**: Each business domain (customers, vehicles, visits, etc.) has its own controller, routes, and validation logic in separate directories.

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Prisma**: ORM with migrations and seeding support

### Authentication
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `PORT`: Backend server port (default: 4000)
- `VITE_API_URL`: Frontend API base URL

### Frontend Dependencies
- **@mui/material**: UI component library
- **@emotion/react & @emotion/styled**: CSS-in-JS styling
- **axios**: HTTP client
- **react-router-dom**: Client-side routing

### Development & Workflows

To start the development environment, use the **App Server** workflow:
- **Command**: `bash -c "cd backend && npm run start & cd frontend && npm run dev"`
- **Backend**: Runs on port 3000 (accessible via `http://localhost:3000`)
- **Frontend**: Runs on port 5000 (accessible via `http://0.0.0.0:5000`)

### Database Migrations
To sync the database schema without resetting data:
```bash
cd backend && npx prisma db push
```
To seed initial data:
```bash
cd backend && npx prisma db seed
```

### Development Tools
- **TypeScript**: Backend type checking
- **tsx**: TypeScript execution for seeding
- **Vite**: Frontend build tool and dev server
- **ESLint**: Code linting for frontend