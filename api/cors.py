"""
CORS Configuration for FastAPI Backend
======================================

Add this to your EXISTING FastAPI application to resolve the CORS error:

    XMLHttpRequest cannot load http://127.0.0.1:8000/api/persons/
    due to access control checks.

HOW TO USE
----------
In your main FastAPI file (e.g. `main.py`), add the middleware:

    from fastapi.middleware.cors import CORSMiddleware
    from cors import get_cors_config  # import from this file

    app = FastAPI()
    app.add_middleware(CORSMiddleware, **get_cors_config())

That's it. The middleware will add the required
`Access-Control-Allow-*` headers to every response so the browser
allows requests coming from your frontend.

NOTE
----
In production (especially behind Docker), replace the `allow_origins`
list with your actual deployed frontend URL(s), e.g.:

    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:5173",
    ]
"""


def get_cors_config() -> dict:
    """
    Returns a dict of keyword arguments for FastAPI's CORSMiddleware.

    `allow_origins`  -> which frontend origins are allowed.
    `allow_credentials` -> allow cookies / Authorization headers.
    `allow_methods`  -> HTTP methods allowed on the API.
    `allow_headers`  -> request headers allowed (includes Authorization).
    """
    return {
        # Frontend origins allowed to call the API.
        # `http://localhost:5173` is the default Vite dev server URL.
        # Add your production domain here when deploying.
        "allow_origins": [
            "http://localhost:5173",   # Vite dev server
            "http://127.0.0.1:5173",   # Vite dev server (127.0.0.1)
            "http://localhost:4173",   # Vite preview server
            "http://127.0.0.1:4173",   # Vite preview server
            "http://localhost:3000",   # Common alternative frontend port
            "http://127.0.0.1:3000",
        ],
        # If True, allows the browser to send cookies / Authorization
        # headers with cross-origin requests.
        "allow_credentials": True,
        # All standard HTTP methods used by the API.
        "allow_methods": [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        # All headers the frontend may send (Authorization, Content-Type, ...).
        "allow_headers": [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
        ],
        # Optional: maximum age (seconds) for the browser to cache the
        # preflight (OPTIONS) response, reducing extra requests.
        "max_age": 3600,
    }

