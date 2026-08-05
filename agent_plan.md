# Frontend Agent Specification Plan

## Overview

This document is a complete specification for building a **full, working frontend** for the **Extra Hours Management API** backend. The frontend is an admin-only dashboard application for managing persons and tracking their extra hours.

The backend is a FastAPI application (already built and tested). The frontend agent should build the frontend to consume the existing API. **Do NOT modify the backend** — only build the frontend against the existing API contract described below.

---

## 1. Backend Context & How to Run It

- **Backend language/framework:** Python / FastAPI
- **Base URL (dev):** `http://localhost:8000`
- **API docs:** `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`
- **Run backend:** `uvicorn main:app --reload` (from the project root)
- **Database:** SQLite (auto-created on startup). No DB setup needed.
- **CORS:** The backend already allows origins for common frontend dev servers:
  - `http://localhost:5173`, `http://127.0.0.1:5173` (Vite dev)
  - `http://localhost:4173`, `http://127.0.0.1:4173` (Vite preview)
  - `http://localhost:3000`, `http://127.0.0.1:3000`
  - **Recommendation:** Use **Vite** on port `5173` for the frontend so CORS works out of the box.

### Authentication Flow (important)

1. **Register** the first admin account (open endpoint).
2. **Login** → receive `access_token` and `refresh_token`.
3. Store both tokens. Send `Authorization: Bearer <access_token>` on all protected requests.
4. When the access token expires (60 min), use the `refresh_token` via `POST /api/auth/refresh` to get a new pair (token rotation).
5. `GET /api/auth/me` returns the current admin profile.

---

## 2. Feature Requirements

The frontend must implement the following full set of features:

### 2.1 Authentication

- **Register page** — create a new admin account (name, surname, username, email optional, password).
- **Login page** — username + password.
- **Logout** — clear stored tokens and redirect to login.
- **Session persistence** — keep the user logged in across page reloads (store tokens in localStorage/sessionStorage).
- **Token refresh** — automatically refresh the access token when it expires (or on 401) using the refresh token.
- **Protected routes** — redirect unauthenticated users to the login page.
- **Show current admin profile** in the app (e.g., in the header/navbar).

### 2.2 Persons Management (CRUD)

- **List persons** — table/cards showing all persons (name, surname, faculty, working status).
- **Create person** — form: name, surname, faculty (optional), is_working (optional).
- **View person detail** — includes total extra hours summary (`total_extra_hours`, `extra_hours_count`).
- **Edit person** — update name, surname, faculty, is_working.
- **Delete person** — with confirmation (deletes the person AND all their extra hours records).
- **Filter** — by working status (`is_working` true/false).
- **Pagination** — skip/limit params.

### 2.3 Extra Hours Management (CRUD)

- **List extra hours records** — table showing date, person, hours, minutes, description.
- **Create extra hours record** — form: person_id (select from persons), hours, minutes, description (optional), date (optional, defaults to today).
- **View/edit record** — update hours, minutes, description, date.
- **Delete record** — with confirmation.
- **Filter by person** — `person_id` query param.
- **Pagination** — skip/limit params.
- **Person hours summary** — display total hours per person (from `GET /api/extra-hours/persons/{person_id}/summary`).

### 2.4 Dashboard / Overview (recommended)

- A dashboard showing:
  - Total number of persons.
  - Total number of extra hours records.
  - Total aggregated extra hours across all persons.
  - List of persons with their accumulated hours (using the summary endpoint or person detail).

---

## 3. API Reference (Complete Contract)

All protected endpoints require header: `Authorization: Bearer <access_token>`.

### 3.1 Authentication (`/api/auth`)

| Method | Endpoint             | Auth | Request Body                                  | Success | Notes                                                     |
| ------ | -------------------- | ---- | --------------------------------------------- | ------- | --------------------------------------------------------- |
| POST   | `/api/auth/register` | No   | `{name, surname, username, email?, password}` | 201     | Returns `AdminUserResponse`. 409 if username/email taken. |
| POST   | `/api/auth/login`    | No   | `{username, password}`                        | 200     | Returns `TokenResponse`. 401 invalid creds, 403 inactive. |
| POST   | `/api/auth/refresh`  | No   | `{refresh_token}`                             | 200     | Returns new `TokenResponse`. 401 invalid/expired.         |
| GET    | `/api/auth/me`       | Yes  | —                                             | 200     | Returns `AdminUserResponse`.                              |

**`AdminUserResponse` shape:**

```json
{
  "id": 1,
  "name": "Test",
  "surname": "Admin",
  "username": "test_admin",
  "email": null,
  "is_active": true,
  "created_at": "2025-01-01T00:00:00"
}
```

**`TokenResponse` shape:**

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "expires_in_minutes": 60,
  "refresh_token_expires_in_days": 30,
  "admin": {
    "id": 1,
    "name": "...",
    "surname": "...",
    "username": "...",
    "email": null,
    "is_active": true,
    "created_at": "..."
  }
}
```

### 3.2 Persons (`/api/persons`)

All require auth.

| Method | Endpoint            | Request Body / Query                                                     | Success | Notes                                                    |
| ------ | ------------------- | ------------------------------------------------------------------------ | ------- | -------------------------------------------------------- |
| GET    | `/api/persons/`     | Query: `skip` (0), `limit` (100, max 500), `is_working` (bool, optional) | 200     | Returns array of `PersonResponse`.                       |
| POST   | `/api/persons/`     | `{name, surname, faculty?, is_working?}`                                 | 201     | Returns `PersonResponse`.                                |
| GET    | `/api/persons/{id}` | —                                                                        | 200     | Returns `PersonDetailResponse` (includes hours summary). |
| PUT    | `/api/persons/{id}` | Any subset of `{name, surname, faculty, is_working}`                     | 200     | Returns `PersonResponse`.                                |
| DELETE | `/api/persons/{id}` | —                                                                        | 204     | Deletes person + all their hours.                        |

**`PersonResponse` shape:**

```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "faculty": "Engineering",
  "is_working": true,
  "created_by_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

**`PersonDetailResponse` = `PersonResponse` + summary:**

```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "faculty": "Engineering",
  "is_working": true,
  "created_by_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00",
  "total_extra_hours": 2.5,
  "extra_hours_count": 3
}
```

### 3.3 Extra Hours (`/api/extra-hours`)

All require auth.

| Method | Endpoint                                       | Request Body / Query                                              | Success | Notes                                                |
| ------ | ---------------------------------------------- | ----------------------------------------------------------------- | ------- | ---------------------------------------------------- |
| GET    | `/api/extra-hours/`                            | Query: `skip` (0), `limit` (100, max 500), `person_id` (optional) | 200     | Array of `ExtraHoursResponse`, ordered by date desc. |
| POST   | `/api/extra-hours/`                            | `{person_id, hours, minutes, description?, date?}`                | 201     | 404 if person not found.                             |
| GET    | `/api/extra-hours/{id}`                        | —                                                                 | 200     | Single `ExtraHoursResponse`.                         |
| PUT    | `/api/extra-hours/{id}`                        | Any subset of `{hours, minutes, description, date}`               | 200     | Returns `ExtraHoursResponse`.                        |
| DELETE | `/api/extra-hours/{id}`                        | —                                                                 | 204     | Delete record.                                       |
| GET    | `/api/extra-hours/persons/{person_id}/summary` | —                                                                 | 200     | Returns summary dict.                                |

**`ExtraHoursResponse` shape:**

```json
{
  "id": 1,
  "person_id": 2,
  "hours": 2,
  "minutes": 30,
  "description": "Weekend project work",
  "date": "2025-01-01",
  "created_by_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00",
  "edited_by_id": null
}
```

**`summary` endpoint response shape:**

```json
{
  "person_id": 2,
  "person_name": "John Doe",
  "total_hours": 2,
  "total_minutes": 30,
  "decimal_hours": 2.5,
  "total_records": 3
}
```

---

## 4. Validation Rules (from backend schemas)

Enforce these in the frontend forms:

- **name / surname:** required, 1–100 chars.
- **username:** required, 3–100 chars (unique).
- **email:** optional, valid email format if provided.
- **password:** required, 6–72 chars.
- **faculty:** optional, max 200 chars (defaults to `"Unknown"`).
- **hours:** integer ≥ 0.
- **minutes:** integer 0–59.
- **description:** optional, max 500 chars.
- **date:** optional, format `YYYY-MM-DD` (defaults to today).
- **person_id:** required integer > 0 (must exist, else 404).

---

## 5. Error Handling

Backend returns standard HTTP status codes. Handle these in the frontend:

- **401 Unauthorized** — token missing/invalid/expired. → Attempt refresh; if refresh fails, redirect to login.
- **403 Forbidden** — inactive/deactivated account. → Show message, log out.
- **404 Not Found** — resource doesn't exist. → Show friendly message.
- **409 Conflict** — duplicate username/email. → Show field error.
- **422 Validation Error** — invalid input. → Map errors to form fields.
- Successful deletes return **204** (no body).

Show clear, user-friendly success/error messages (toasts or inline alerts).

---

## 6. Recommended Tech Stack

Pick a stack that enables a fast, polished, complete implementation:

- **Framework:** React + Vite (recommended, matches CORS origins) or Vue + Vite, or Next.js.
- **Language:** TypeScript (recommended) or JavaScript.
- **Styling:** Tailwind CSS (recommended) or plain CSS / component library (e.g., shadcn/ui, MUI, Chakra).
- **State management:** React Context + localStorage for auth tokens (or Zustand/Redux Toolkit).
- **HTTP client:** Axios (recommended) with interceptors for auth token injection and auto-refresh.
- **Routing:** React Router (protected routes).
- **Form handling:** React Hook Form + Zod (or manual form validation).

**Important:** Ensure the frontend dev server runs on one of the CORS-allowed ports (e.g., Vite on `5173`).

---

## 7. Recommended Page/Route Structure

```
/                     → Dashboard (overview)
/login                → Login page
/register             → Register page
/persons              → Persons list (table + filters + pagination)
/persons/new          → Create person form
/persons/:id          → Person detail (with hours summary)
/persons/:id/edit     → Edit person form
/extra-hours          → Extra hours list (table + filters + pagination)
/extra-hours/new      → Create extra hours record form
/extra-hours/:id/edit → Edit extra hours record form
```

Add a shared layout with:

- Navigation sidebar or top navbar (Dashboard, Persons, Extra Hours).
- Logout button.
- Current admin name/username display.

---

## 8. Non-Functional Requirements

- **Responsive** UI — works on desktop and mobile.
- **Loading states** — spinners/skeletons while fetching.
- **Empty states** — friendly messages when no data.
- **Confirmations** — for destructive actions (delete person/record).
- **Accessibility** — proper labels, focus states, semantic HTML.
- **Consistent error handling** — friendly messages, not raw JSON.
- **Clean code** — well-organized components, reusable API client, environment config for the API base URL.

---

## 9. Acceptance Criteria

The frontend is considered complete when a user can:

1. Register a new admin account and log in.
2. Stay logged in across page reloads (session persistence).
3. Automatically get a new access token when it expires (refresh flow).
4. Log out and be redirected to the login page.
5. Create, view, edit, and delete persons.
6. Filter persons by working status and paginate through them.
7. Create, view, edit, and delete extra hours records.
8. Filter extra hours by person and paginate through them.
9. See a per-person total hours summary (decimal hours).
10. See an overall dashboard with aggregate stats.
11. Receive clear success/error messages for all actions.
12. Use the app on a mobile-sized screen without breakage.

---

## 10. Suggested Implementation Order

1. Scaffold the project (Vite + React + TS + Tailwind). Set up API base URL config.
2. Build the API client with axios interceptors (auth token injection + refresh on 401).
3. Build auth context/store (login, register, logout, refresh, session persistence, protected routes).
4. Build Login and Register pages.
5. Build shared layout + navigation + logout.
6. Build Persons list (with filters + pagination) + Create/Edit/Delete.
7. Build Person detail page (with hours summary).
8. Build Extra Hours list (with filter + pagination) + Create/Edit/Delete.
9. Build Dashboard with aggregate stats.
10. Polish: loading states, empty states, error toasts, responsive styling, confirmations.
11. End-to-end test against the running backend.

---

## 11. Testing Notes

- The backend ships with `test_api.py` which exercises the full API. Run it to confirm the backend is healthy: `python test_api.py`.
- Manually test the frontend against the running backend (`uvicorn main:app --reload`).
- Confirm CORS is working (frontend on port 5173 by default).
