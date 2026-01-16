# Jules Mechanic - Project Documentation

This document provides a detailed overview of the work done on the Jules Mechanic project, covering the backend, frontend, and database.

## Backend

The backend is a robust Node.js application built with Express and PostgreSQL. It provides a comprehensive set of API endpoints for managing all aspects of the workshop.

### Key Features

-   **Authentication & Authorization:** The backend uses JWT-based authentication to secure all API endpoints. Role-Based Access Control (RBAC) is implemented to ensure that users can only access the resources and perform the actions that are appropriate for their role.
-   **Server-Side Calculations:** All financial calculations, including visit totals, discounts, and taxes, are performed on the server-side to ensure data integrity and prevent manipulation.
-   **Input Validation:** The backend uses Zod to validate all incoming data, ensuring that only valid data is processed and stored in the database.
-   **Database Management:** Prisma is used for database management, including schema definition, migrations, and seeding.

### API Endpoints

The backend provides the following API endpoints:

-   **Authentication:**
    -   `POST /auth/login`: Authenticates a user and returns a JWT.
    -   `GET /auth/me`: Returns the currently authenticated user.
-   **Users & Roles (Admin Only):**
    -   `GET/POST /roles`: Manage roles.
    -   `GET/POST /users`: Manage users.
-   **Customers & Vehicles:**
    -   `GET /customers?search=`: Search for customers by name or phone number.
    -   `POST /customers`: Create a new customer.
    -   `GET /vehicles?search=`: Search for vehicles by registration number.
    -   `POST /vehicles`: Create a new vehicle.
-   **Visits (Job Cards):**
    -   `POST /visits`: Create a new visit.
    -   `GET /visits`: Get a list of visits with filtering and searching capabilities.
    -   `GET /visits/:id`: Get the details of a specific visit.
    -   `PATCH /visits/:id`: Update the details of a specific visit.
-   **Items & Payments:**
    -   `POST /visits/:id/labor-items`: Add a labor item to a visit.
    -   `DELETE /labor-items/:id`: Delete a labor item.
    -   `POST /visits/:id/part-items`: Add a part item to a visit.
    -   `DELETE /part-items/:id`: Delete a part item.
    -   `POST /visits/:id/payments`: Add a payment to a visit.
    -   `DELETE /payments/:id`: Delete a payment.
-   **Visit Notes:**
    -   `POST /visits/:id/notes`: Add a note to a visit.
    -   `GET /visits/:id/notes`: Get all notes for a visit.
-   **Analytics:**
    -   `GET /analytics/summary?range=week|month|year`: Get a summary of analytics data for a specific range.
    -   `GET /analytics/range?dateFrom=&dateTo=`: Get analytics data for a custom date range.

## Frontend

The frontend is a single-page application built with React and Vite. It provides a user-friendly interface for managing all aspects of the workshop.

### Key Features

-   **Role-Based UI:** The frontend dynamically adjusts the UI based on the user's role, hiding or disabling elements as appropriate.
-   **Component-Based Architecture:** The frontend is built with a component-based architecture, which makes it easy to maintain and extend.
-   **State Management:** The frontend uses the React Context API to manage the user's authentication state.

### Pages & Components

The frontend consists of the following pages and components:

-   **Pages:**
    -   `LoginPage.jsx`: A simple login page with fields for email and password.
    -   `DashboardPage.jsx`: The main dashboard page, which includes the following components:
-   **Components:**
    -   `VisitsTable.jsx`: A table that displays a list of visits.
    -   `NewCarEntryModal.jsx`: A modal for creating new car entries.
    -   `VisitDetailsPanel.jsx`: A panel for viewing and editing the details of a visit.
    -   `AnalyticsSnapshot.jsx`: A set of cards that display a snapshot of the weekly, monthly, and yearly analytics.

## Database

The database is a PostgreSQL database that is managed with Prisma. It is designed to be a single source of truth for all workshop data.

### Schema

The database schema consists of the following tables:

-   **`Role`**: Stores the user roles (e.g., "Owner/Admin", "Manager", "Mechanic", "Receptionist").
-   **`User`**: Stores user information, including a hashed password and a role.
-   **`Customer`**: Stores customer information.
-   **`Vehicle`**: Stores vehicle information and is linked to a customer.
-   **`Visit`**: Stores visit (job card) information, including the status, complaint, and financial totals.
-   **`LaborItem`**: Stores the labor items for a visit.
-   **`PartItem`**: Stores the part items for a visit.
-   **`Payment`**: Stores the payments for a visit.
-   **`VisitNote`**: Stores the notes for a visit.
