"""Main FastAPI application entrypoint for the HireNest ATS Checker microservice."""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes.ats_routes import router as ats_router
from app.schemas.ats_schema import HealthResponse

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Internal Python FastAPI microservice for HireNest ATS Resume Score Checker.",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Service-Token"],
)


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    """Consistent JSON error envelope without leaking stack traces or PII."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Consistent 400 error response for malformed multipart/form requests."""
    errors = exc.errors()
    first_msg = errors[0].get("msg", "Invalid request payload.") if errors else "Invalid request payload."
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "message": f"Validation error: {first_msg}",
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, __: Exception) -> JSONResponse:
    """Catch-all handler ensuring internal errors never leak sensitive stack details."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred inside the ATS analysis service.",
        },
    )


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Public loopback health check returning sanitized service status."""
    return HealthResponse(
        status="healthy",
        service="hirenest-ats-checker",
        version="1.0.0",
    )


app.include_router(ats_router)
