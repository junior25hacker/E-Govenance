# Emergence-Connect / CitizenNode

This repository implements a prototype e‑governance portal for managing **citizen services** and **document verification**. It includes:

- A **static frontend** experience (HTML/CSS/JS) for landing and service pages.
- Two backend implementations:
  1. An **Express + TypeORM** API for authentication and document verification.
  2. A **NestJS** application that serves **Handlebars (HBS)** views.

> Note: Folder names and UI branding in this repo reference both **Emergence-Connect** and **CitizenNode** (both are present in the existing pages).

---

## High-level architecture

### 1) Frontend (static pages)
The root and supporting folders contain web pages that provide the portal UI:

- `index.html` – Landing page for the portal.
- `login.html` – Login/authentication UI.
- `civil-status.html` – Civil status service landing.
- `citizen web portal/` – Additional static portal assets (HTML/CSS).
- `status dashboard/status.html` – Example status dashboard UI.

These pages are served as static files (no framework required) and use client-side JavaScript for basic UI interactions.

### 2) Backend (Express + TypeORM)
`back_end/` contains a REST API built with:

- **Express** (HTTP server)
- **TypeORM** (data access)
- **PostgreSQL** (database)
- `dotenv` + environment variables for configuration

Key parts:
- `back_end/src/server.ts`
  - Sets up middleware (`cors`, `express.json`, `express.urlencoded`)
  - Exposes `GET /api/v1/health`
  - Mounts routes:
    - `POST /api/v1/auth/login`
    - `GET /api/v1/documents/:id/verify`
  - Initializes the TypeORM connection via `AppDataSource.initialize()`.

- `back_end/src/config/database.ts`
  - Defines `AppDataSource` (PostgreSQL connection)
  - Registers `Document` entity

- `back_end/src/entities/Document.ts`
  - TypeORM entity mapped to `documents`
  - Stores document metadata (citizen info, jurisdiction, file path, status, timestamps)

- `back_end/src/routes/authRoutes.ts`
  - Admin login route

- `back_end/src/routes/documentRoutes.ts`
  - Admin verification route protected by an auth middleware

### 3) Backend (NestJS + Handlebars)
`egov-backend/` contains a **NestJS** application that renders server-side views.

- **NestJS** (`@nestjs/*`)
- **Express adapter** via `@nestjs/platform-express`
- **Handlebars (HBS)** via the `hbs` package

Key parts:
- `egov-backend/src/main.ts`
  - Creates the Nest app
  - Configures static assets and the HBS view engine
  - Starts the server (and attempts to open the landing URL automatically)

- `egov-backend/views/*.hbs`
  - `index.hbs`, `login.hbs`, `dashboard.hbs`, `civil-status.hbs`

---

## Repository structure

```text
.
├─ README.md
├─ index.html
├─ login.html
├─ civil-status.html
├─ citizen web portal/
│  ├─ index.html
│  └─ style.css
├─ status dashboard/
│  └─ status.html
├─ back_end/
│  └─ src/
│     ├─ server.ts
│     ├─ config/
│     │  └─ database.ts
│     ├─ entities/
│     │  └─ Document.ts
│     └─ routes/
│        ├─ authRoutes.ts
│        └─ documentRoutes.ts
└─ egov-backend/
   ├─ package.json
   ├─ src/
   │  ├─ main.ts
   │  ├─ app.module.ts
   │  ├─ app.controller.ts
   │  ├─ app.service.ts
   │  └─ ...
   └─ views/
      ├─ index.hbs
      ├─ login.hbs
      ├─ dashboard.hbs
      └─ civil-status.hbs
```

---

## Frameworks / technologies used

- **Frontend**: plain **HTML/CSS/JavaScript** (static pages)
- **Express** (HTTP API server)
- **TypeORM** (ORM + PostgreSQL integration)
- **PostgreSQL** (database)
- **NestJS** (server-side framework)
- **Handlebars (HBS)** (templating)
- **CORS** and JSON request parsing (`cors`, `express.json`)
- **dotenv** (environment configuration)

---

## Running the backend (quick notes)

### Express + TypeORM (`back_end/`)
- `back_end/src/server.ts` expects PostgreSQL configuration via environment variables (see `back_end/src/config/database.ts`).
- Start the server from within `back_end/` (use your existing Node/TS setup in that folder).

### NestJS (`egov-backend/`)
- Install dependencies:
  - `cd egov-backend && npm install`
- Start dev server:
  - `npm run start:dev`

---

## Next steps (optional)
- Consolidate frontend routing so it consistently targets either static pages or the NestJS HBS views.
- Add shared API documentation (endpoints, request/response examples) for both backends.
- Unify “Emergence-Connect” vs “CitizenNode” naming if needed for the final product branding.

