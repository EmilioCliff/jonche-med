# ChemStock Frontend

This is the frontend for ChemStock, a modern pharmacy inventory management system built with React, TypeScript, and Vite.

## Features

-   Dashboard with sales charts, inventory stats, and quick actions
-   Products management: search, filter, pagination, add/edit/delete
-   User management: view, create, edit, delete users
-   User profile: view and update details, change password
-   Reports: generate and export inventory/sales reports
-   Responsive, user-friendly UI with validation and modals
-   Type-safe codebase using Zod schemas and React Query

## Getting Started

1. Install dependencies:
    ```bash
    npm install
    ```
2. Start the development server:
    ```bash
    npm run dev
    ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

-   `src/pages/` — Main app pages (Dashboard, Products, Users, Reports, UserProfile)
-   `src/components/` — Reusable UI components (Pagination, DateRangePicker, Spinner, etc.)
-   `src/services/` — API service functions
-   `src/lib/` — Schemas, mock data, and utilities

## Tech Stack

-   React + TypeScript
-   Vite
-   Recharts (charts)
-   Zod (validation)
-   React Query (data fetching)
-   Tailwind CSS (styling)

## Linting & Type Safety

-   ESLint and recommended type-aware rules
-   Zod schemas for form and API validation

## Contributing

Pull requests and suggestions are welcome!

---

For backend/API setup, see the ChemStock backend project.
