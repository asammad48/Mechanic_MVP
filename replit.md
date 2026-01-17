# Jules Mechanic Workshop Management System

## Overview

Jules Mechanic is a workshop management system MVP designed for automotive repair shops.

## Recent Changes
- **2026-01-17**: Updated database schema to support detailed costing:
    - `Visit`: Added `mileage` (required) and switched financial fields to `Decimal`.
    - `LaborItem`: Updated to support per-hour pricing (`hours`, `ratePerHour`).
    - `PartItem`: Switched financial fields to `Decimal`.
    - `OutsideWorkItem`: New model for tracking work sent to external vendors.
    - Added `subtotalOutside` to `Visit` totals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Project Structure
- **Monorepo layout**: Two separate applications in `/backend` and `/frontend` directories

### Backend Architecture
- **Framework**: Node.js with Express.js
- **Database ORM**: Prisma with PostgreSQL
- **Money Handling**: Uses `Decimal` type for all financial fields to ensure precision.

... [rest of the file remains same]
