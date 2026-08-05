# Extra Hours Management Admin Panel

A full-featured React + TypeScript + Vite admin dashboard for managing persons and tracking their extra hours. Consumes a **FastAPI backend** via REST API.

## Stack

- **Frontend**: React 19, TypeScript, Vite 7, Zustand 5, React Router 7, Axios
- **Backend**: FastAPI (separate project: `Counter_Backend`)
- **Styling**: Dark glassmorphism CSS design system (CSS variables, no framework)
- **Validation**: Inline form validation matching backend Pydantic schemas

## Features

### ✅ Authentication

- Register admin account
- Login with username/password
- JWT access + refresh token flow
- Auto-refresh on 401 (Axios interceptor)
- Session persistence across reloads (localStorage)
- Admin profile displayed in navbar
- Protected routes that redirect to login

### ✅ Persons Management (CRUD)

- **List** persons with pagination (skip/limit) and filter by working status
- **Create** person (name, surname, faculty, active status)
- **View** person detail with total extra hours summary (decimal hours + record count)
- **Edit** person's name, surname, faculty, working status
- **Delete** person with confirmation — cascades to delete all their hours records

### ✅ Extra Hours Management (CRUD)

- **List** records with pagination and filter by person
- **Create** record (select person, hours, minutes, description, date)
- **Edit** record's hours, minutes, description, date
- **Delete** record with confirmation
- Minutes → hours converter tool built into create/edit forms

### ✅ Dashboard

- Aggregate stats: total persons, total records, total hours
- Per-person sorted list with accumulated hours
- Standalone minutes → hours converter (also available on login/register pages)
- Quick links to person detail and add extra hours

### ✅ UI/UX

- Dark glassmorphism design system
- Full responsive layout (mobile + desktop)
- Toast notifications (success, error, info)
- Loading spinners and skeleton states
- Friendly empty states with helpful actions
- Confirmation dialogs for destructive actions
- Semantic HTML and accessible labels

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx            # Shared layout: navbar, outlet, toasts
│   ├── Login.tsx             # Login form
│   ├── Register.tsx          # Registration form
│   ├── MinutesConverter.tsx  # Reusable minutes → hours converter
│   ├── ProtectedRoute.tsx    # Auth guard component
│   ├── ToastViewport.tsx     # Toast notification renderer
│   └── ui/
│       ├── Spinner.tsx       # Loading spinner
│       ├── EmptyState.tsx    # Empty state display
│       ├── Pagination.tsx    # Page navigation
│       └── ConfirmDialog.tsx # Confirmation modal
├── pages/
│   ├── Dashboard.tsx         # Overview with stats
│   ├── PersonsList.tsx       # Persons table with filter + pagination
│   ├── PersonCreate.tsx      # Create person form
│   ├── PersonDetail.tsx      # Person detail + hours summary
│   ├── PersonEdit.tsx        # Edit person form
│   ├── ExtraHoursList.tsx    # Extra hours table with filter + pagination
│   ├── ExtraHoursCreate.tsx  # Create extra hours form (+ converter)
│   └── ExtraHoursEdit.tsx    # Edit extra hours form (+ converter)
├── services/
│   ├── api.ts                # Axios instance + auth interceptors
│   ├── authService.ts        # Auth endpoints
│   ├── personService.ts      # Person CRUD
│   └── extraHoursService.ts  # Extra hours CRUD
├── store.ts                  # Zustand stores (auth, lists, toast)
├── type.ts                   # TypeScript types matching API
├── utils/
│   └── apiErrors.ts          # Error message extraction utility
├── style/                    # CSS files
│   ├── variable.css          # Design tokens / CSS variables
│   ├── index.css             # Global styles
│   ├── App.css               # Base app layout
│   ├── Login.css             # Auth form styles
│   ├── Layout.css            # Navbar + app shell
│   ├── ui.css                # Spinner, pagination, toast, dialogs
│   └── pages.css             # Page layout, tables, forms, cards
└── App.tsx                   # Router configuration
```

## Routes

| Path                    | Page             | Auth |
| ----------------------- | ---------------- | ---- |
| `/`                     | Dashboard        | ✅   |
| `/login`                | Login            | ❌   |
| `/register`             | Register         | ❌   |
| `/persons`              | Persons list     | ✅   |
| `/persons/new`          | Create person    | ✅   |
| `/persons/:id`          | Person detail    | ✅   |
| `/persons/:id/edit`     | Edit person      | ✅   |
| `/extra-hours`          | Extra hours list | ✅   |
| `/extra-hours/new`      | Create hours     | ✅   |
| `/extra-hours/:id/edit` | Edit hours       | ✅   |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the backend

Your FastAPI backend must be running at `http://127.0.0.1:8000` (see `Counter_Backend`).

```bash
# In a separate terminal:
cd ../Counter_Backend
uvicorn main:app --reload
```

### 3. Run the frontend

```bash
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://127.0.0.1:8000`, so no CORS issues.

### 4. Build for production

```bash
npm run build
npm run preview
```

## API Integration

Requests are made via `src/services/api.ts` (Axios instance). It:

- Attaches `Authorization: Bearer <access_token>` automatically
- Auto-refreshes expired access tokens using the refresh token
- Redirects to `/login` when refresh fails

## CORS

The backend allows the following frontend origins:

- `http://localhost:5173` (Vite dev — default)
- `http://127.0.0.1:5173`
- `http://localhost:4173` (Vite preview)
- `http://127.0.0.1:4173`
- `http://localhost:3000`

## Validation Rules

The frontend enforces the same validation rules as the backend:

- **name / surname**: required, 1–100 chars
- **username**: required, 3–100 chars
- **password**: required, 6–72 chars
- **email**: optional, valid email format
- **faculty**: optional, max 200 chars
- **hours**: integer ≥ 0
- **minutes**: integer 0–59
- **description**: optional, max 500 chars
- **date**: optional, YYYY-MM-DD format (defaults to today)

## Error Handling

| Status Code | Frontend Behavior                           |
| ----------- | ------------------------------------------- |
| 401         | Auto-refresh; if fails → redirect to login  |
| 403         | Show "account deactivated" message, log out |
| 404         | Friendly "not found" message                |
| 409         | Show "username/email already taken" message |
| 422         | Map validation errors to form fields        |
| Network     | Show "no connection" message                |
# Counter_Frontend
