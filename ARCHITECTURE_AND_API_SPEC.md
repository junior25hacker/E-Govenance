# CitizenNode Web Application: Architecture and API Specification

## 1. Overview

This document outlines the architecture of the CitizenNode web application and specifies the API contract for communication between the web application (frontend) and a JavaFX desktop application.

The system consists of:
- A static frontend (HTML/CSS/JS) for citizen-facing services.
- Two backend implementations:
  1. **Express + TypeORM API**: Provides RESTful endpoints for authentication and document verification.
  2. **NestJS + Handlebars**: Serves server-side rendered views for administrative dashboards.

The JavaFX desktop application will interact with the system via a well-defined REST API (primarily leveraging the Express + TypeORM backend) to perform operations such as user authentication, document submission, verification, and status tracking.

## 2. Frontend (Static Web Application)

The frontend is composed of static HTML pages enhanced with client-side JavaScript for basic interactions. Key pages include:
- `index.html`: Landing page.
- `login.html`: Authentication interface.
- `civil-status.html`: Civil status service portal.
- `citizen web portal/`: Additional static assets.
- `status dashboard/`: Example dashboard for service tracking.

These pages are served directly by the web server (or can be hosted on any static hosting solution) and communicate with the backend via AJAX/fetch calls to the API endpoints.

## 3. Backend Systems

### 3.1 Express + TypeORM API (`back_end/`)

This backend provides a RESTful API for core functionality. It is built with:
- **Express.js**: HTTP server framework.
- **TypeORM**: ORM for PostgreSQL database interactions.
- **PostgreSQL**: Relational database for persistent storage.
- **dotenv**: Environment variable management.

#### Key Components
- **server.ts**: Entry point configuring CORS, JSON parsing, route mounting, and database connection.
- **config/database.ts**: PostgreSQL connection configuration and TypeORM DataSource setup.
- **entities/Document.ts**: TypeORM entity representing documents stored in the system.
- **routes/authRoutes.ts**: Authentication endpoints (login).
- **routes/documentRoutes.ts**: Document management endpoints (submission, verification, status updates).

#### Existing API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Authenticate user (citizen ID and email) returns a mock JWT token. |
| POST | `/api/v1/auth/citizen/login` | Alternative login endpoint. |
| GET | `/api/v1/documents/:id` | Retrieve document details by ID (includes extracted OCR text). |
| POST | `/api/v1/documents/submit` | Submit a lost document report (generates a tracking ID). |
| POST | `/api/v1/documents/:id/verify-status` | Update verification status of a document. |
| GET | `/api/v1/documents/:id/verify` | Verify document (admin-protected, currently inline auth bypass). |
| GET | `/api/v1/health` | Health check endpoint. |

### 3.2 NestJS + Handlebars (`egov-backend/`)

This backend serves server-side rendered views for administrative interfaces. It is built with:
- **NestJS**: Progressive Node.js framework.
- **Express Adapter**: Underlying HTTP server.
- **Handlebars (HBS)**: Templating engine for dynamic HTML.

#### Key Components
- **main.ts**: Bootstrap NestJS application, configure static assets and view engine.
- **Views (`views/`)**: HBS templates for index, login, dashboard, and civil-status pages.
- **Controllers/Services**: Application logic (not detailed in the provided code snippets).

This backend primarily serves HTML to browsers and is not designed for direct API consumption by the JavaFX desktop app. However, it shares the same database and could be extended to provide API endpoints if needed.

## 4. Proposed API for JavaFX Desktop Application

To enable the JavaFX desktop application to interact with the CitizenNode system, we propose extending the existing Express + TypeORM API with additional endpoints tailored for desktop client operations. The desktop app will act as a complementary client (e.g., for field officers or administrative users) that requires secure access to backend services.

### 4.1 Authentication Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/v1/auth/login` | Authenticate user (citizen or admin) | `{ "citizenId": "string", "email": "string" }` | `{ "status": "success", "token": "jwt-token", "citizen": { "id": "...", "email": "..." } }` |
| POST | `/api/v1/auth/logout` | Invalidate token (client-side) | None | `{ "status": "success", "message": "Logged out" }` |
| POST | `/api/v1/auth/refresh` | Refresh expired token | `{ "refreshToken": "string" }` | `{ "status": "success", "token": "new-jwt-token" }` |

> **Note**: The current login endpoint returns a mock token. In production, this should be replaced with a proper JWT implementation.

### 4.2 Document Management Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/v1/documents/submit` | Report a lost document | `{ "citizenId": "string", "documentType": "string", "councilJurisdiction": "string", "filePath": "string" }` | `{ "status": "success", "message": "...", "data": { "id": "tracking-id", ... } }` |
| GET | `/api/v1/documents/:id` | Retrieve document details | None (path param) | `{ "status": "success", "data": { "id": "...", "citizenName": "...", "dob": "...", "hospitalName": "...", "extractedOcrText": "..." } }` |
| POST | `/api/v1/documents/:id/verify-status` | Update verification status | `{ "status": "string", "verifiedBy": "string" }` | `{ "status": "success", "message": "Document status updated to {status} by {verifiedBy}." }` |
| GET | `/api/v1/documents/:id/verify` | Verify document (requires auth) | None | `{ "status": "success", "data": { "id": "...", "verified": true, "message": "Document matched." } }` |
| GET | `/api/v1/documents` | List documents (with optional filters) | Query params: `?citizenId=&status=&type=&page=&limit=` | `{ "status": "success", "data": [ ... ], "pagination": { ... } }` |
| DELETE | `/api/v1/documents/:id` | Delete a document record | None | `{ "status": "success", "message": "Document deleted" }` |

### 4.3 Service Request Endpoints
*(Example for extending to other service types beyond documents)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/service-requests` | Submit a new service request (e.g., certificate request, complaint) |
| GET | `/api/v1/service-requests/:id` | Retrieve service request details |
| PUT | `/api/v1/service-requests/:id` | Update service request |
| GET | `/api/v1/service-requests` | List service requests (with filtering) |

### 4.4 Health and Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Basic health check (returns 200 OK if service is running) |
| GET | `/api/v1/health/detailed` | Detailed health check (database connectivity, disk space, etc.) |
| GET | `/api/v1/metrics` | Prometheus-style metrics (if monitoring is enabled) |

## 5. Data Models

### 5.1 Document (TypeORM Entity)
```typescript
@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column()
  documentType: string;

  @Column()
  councilJurisdiction: string;

  @Column()
  filePath: string;

  @Column({ default: "pending" })
  status: string; // pending, verified, rejected

  @Column({ nullable: true })
  extractedOcrText?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5.2 Authentication Response
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "citizen": {
    "id": "CIT-12345",
    "email": "citizen@example.com"
  }
}
```

### 5.3 Service Request (Example)
```json
{
  "id": "SRV-98765",
  "citizenId": "CIT-12345",
  "serviceType": "birth-certificate",
  "description": "Request for duplicate birth certificate",
  "status": "submitted",
  "submittedAt": "2026-05-22T10:30:00Z",
  "updatedAt": "2026-05-22T10:30:00Z"
}
```

## 6. Security Considerations

- **Authentication**: All endpoints (except health and public login) should require a valid JWT token in the `Authorization: Bearer <token>` header.
- **Authorization**: Implement role-based access control (RBAC) to differentiate between citizen, admin, and field officer permissions.
- **Input Validation**: Validate and sanitize all inputs to prevent injection attacks.
- **HTTPS**: Enforce HTTPS in production to encrypt traffic between clients and the server.
- **Rate Limiting**: Implement rate limiting on authentication endpoints to deter brute-force attacks.
- **Audit Log**: Log sensitive operations (document verification, status changes) for audit trails.

## 7. Communication Protocol

- **Format**: JSON for request and response bodies.
- **Transport**: REST over HTTP/1.1 or HTTP/2.
- **Base URL**: `https://api.citizenode.example.com/api/v1` (or relative to the deployed backend).
- **Error Responses**: Consistent error format:
  ```json
  {
    "status": "error",
    "message": "Descriptive error message",
    "code": "ERROR_CODE"
  }
  ```
- **Versioning**: API versioned in the path (`/api/v1/...`) to allow for backward compatibility.

## 8. Implementation Notes for JavaFX Desktop App

- Use HTTP client libraries (e.g., `java.net.http.HttpClient` in Java 11+) to make API calls.
- Store JWT token securely (e.g., in JavaFX application preferences or secure storage) and attach to outgoing requests.
- Handle token refresh transparently.
- Implement exponential backoff for retrying failed requests.
- Parse JSON responses into Java objects using libraries like Jackson or Gson.
- Consider offline capabilities: queue requests locally when offline and sync when connectivity is restored.

## 9. Future Work

- Replace mock authentication with a proper OAuth 2.0 / OpenID Connect provider.
- Add real document processing (OCR, validation) backend.
- Implement WebSocket endpoints for real-time updates (e.g., document verification status).
- Develop admin console in JavaFX for managing documents and service requests.
- Add comprehensive API documentation using OpenAPI/Swagger.

---
*This document serves as a blueprint for backend API development to support the JavaFX desktop application while maintaining compatibility with the existing web frontend.*