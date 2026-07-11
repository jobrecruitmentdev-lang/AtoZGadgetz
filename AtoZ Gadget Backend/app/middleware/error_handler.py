from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


def setup_exception_handlers(app: FastAPI):

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "status": False,
                "message": exc.detail,
                "errors": []
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            field = ".".join(map(str, error["loc"][1:])) if len(error["loc"]) > 1 else str(error["loc"][0])
            errors.append({
                "field": field,
                "message": error["msg"]
            })

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "status": False,
                "message": "Validation Error",
                "errors": errors
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status": False,
                "message": "Internal Server Error",
                "errors": [{"detail": str(exc)}]
            }
        )


# Import JSONResponse to make sure setup works without any missing name errors
from fastapi.responses import JSONResponse
