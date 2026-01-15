# Jules Mechanic

This is the monorepo for the Jules Mechanic workshop management system.

## Backend

The backend is a Node.js Express application.

### Setup

1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Start the PostgreSQL database: `docker compose up -d`
4.  Run the database migrations: `npx prisma migrate dev`
5.  Seed the database: `npm run seed`
6.  Start the server: `npm start`

The server will be running on `http://localhost:4000`.

### Usage

The API is protected by JWT authentication. You will need to log in to get a token.

-   **POST /auth/login**: Log in with a user's email and password.
-   **GET /auth/me**: Get the currently logged in user's information.

The default admin user is:

-   **Email**: `admin@local`
-   **Password**: `Password123!`
