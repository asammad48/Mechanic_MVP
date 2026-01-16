# Jules Mechanic Workshop Management System

This is an MVP workshop management system called "Jules Mechanic" with role-based access, job cards per vehicle visit, costing, and analytics.

## Project Structure

The project is a monorepo with two separate folders:

-   `/backend`: Node.js, Express, and PostgreSQL backend.
-   `/frontend`: React frontend.

## Prerequisites

-   Node.js (v14 or later)
-   npm
-   Docker and Docker Compose

## Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create a `.env` file:**

    Create a `.env` file in the `backend` directory and add the following environment variables:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/jules_mechanic"
    JWT_SECRET="your_jwt_secret"
    PORT=4000
    ```

    Replace `your_jwt_secret` with a long, random string.

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Start the PostgreSQL database:**

    From the root of the project, run:

    ```bash
    docker compose up -d
    ```

5.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

6.  **Seed the database:**

    This will create the default roles and an admin user.

    ```bash
    npm run seed
    ```

    The default admin user credentials are:
    -   **Email:** `admin@local`
    -   **Password:** `Password123!`

7.  **Start the backend server:**

    ```bash
    npm start
    ```

    The backend will be running at `http://localhost:4000`.

## Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Create a `.env` file:**

    Create a `.env` file in the `frontend` directory and add the following environment variable:

    ```env
    VITE_API_URL=http://localhost:4000
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Start the frontend development server:**

    ```bash
    npm run dev
    ```

    The frontend will be running at `http://localhost:5173`.
