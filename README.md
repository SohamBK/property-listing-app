# Propertist

A full-stack property management application built with the MERN stack (MongoDB/PostgreSQL, Express, React, Node.js).

## Tech Stack

| Layer        | Technology                                             |
| ------------ | ------------------------------------------------------ |
| **Frontend** | React 19, TypeScript, Redux Toolkit, TailwindCSS, Vite |
| **Backend**  | Node.js, Express 5, Prisma ORM, PostgreSQL             |
| **Auth**     | JWT-based authentication with cookies                  |

## Project Structure

```
propertist-mern-task/
├── backend/           # Express API server
│   ├── prisma/        # Database schema & migrations
│   └── src/
│       ├── api/v1/    # API routes, controllers, services
│       ├── middleware/# Auth, validation, error handling
│       └── utils/     # Logger, response helpers, JWT
└── frontend/          # React application
    └── src/
        ├── features/  # Redux slices & API calls
        ├── pages/     # Route components
        ├── components/# Reusable UI components
        └── services/  # Axios configuration
```

## Prerequisites

- Node.js 18+
- PostgreSQL database

## Getting Started

### 1. Database Setup

Create a `.env` file as per `.env.example` file in the `backend/` directory:

Run migrations and seed data:

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed:users
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Available Scripts

| Command          | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `npm run dev`    | Start development server (backend: nodemon, frontend: Vite) |
| `npm run build`  | Build frontend for production                               |
| `npm run lint`   | Run ESLint                                                  |
| `npm run format` | Format code with Prettier (backend only)                    |

## Features

- User registration and login
- Property listing with filters (location, BHK, type, price range)
- Create, edit, and delete properties (agent only)
- Agents can view properties they listed
- Image upload for properties
- Pagination for property listings
- Users can submit enquiries and agents can view enquiries received on properties they listed
