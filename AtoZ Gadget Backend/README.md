# AtoZ Gadgets API

This is a production-ready, highly scalable enterprise-level backend API system built with FastAPI, SQLAlchemy ORM, and MySQL. It mimics key features of a large-scale e-commerce platform like AtoZ Gadgets, including robust JWT authentication, fine-grained Role-Based Access Control (RBAC), repository pattern abstractions, validation schemas, global error handling middleware, and comprehensive User CRUD management.

---

## Technical Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database Engine & ORM**: MySQL 8+ with SQLAlchemy ORM
- **Authentication**: JWT (python-jose) & bcrypt (passlib) password hashing
- **Data Validation & Typing**: Pydantic v2
- **Database Migration**: Alembic
- **ASGI Server**: Uvicorn

---

## Directory Layout
```text
app/
    main.py                 # FastAPI application initializer
    config/
        settings.py         # Global configuration settings via pydantic_settings
    database/
        connection.py       # SQLAlchemy engine & session pool connection setup
    models/
        __init__.py         # Model package exporter
        role.py             # Role DB model
        user.py             # User DB model
        permission.py       # Permission DB model
        role_permission.py  # Many-to-Many junction table model
        refresh_token.py    # Refresh tokens DB model
        address.py          # UserAddress DB model
    schemas/
        __init__.py         # Schema package exporter
        response_schema.py  # Standardized API response format models
        auth_schema.py      # Auth-related models (login, token)
        user_schema.py      # User CRUD input/output schemas with validation
        role_schema.py      # Role serialization schemas
        permission_schema.py# Permission serialization schemas
    routers/
        auth.py             # Auth endpoints (register, login, me)
        users.py            # User management CRUD endpoints
    services/
        auth_service.py     # JWT token generation logic
    repositories/
        __init__.py         # Repositories exporter
        base_repository.py  # Generic database CRUD class
        user_repository.py  # Specialized user querying/filtering methods
        role_repository.py  # Role queries
        permission_repository.py # Permission queries
    dependencies/
        auth_dependency.py  # Authentication and RBAC checking dependencies
    middleware/
        error_handler.py    # Global validation, HTTP, and system exception handlers
    seeds/
        run_seeds.py        # Central database seed execution orchestrator
        role_seed.py        # Seeds default roles (Super Admin, Admin, Customer)
        permission_seed.py  # Seeds default permissions
        role_permission_seed.py # Connects permissions to role assignments
```

---

## Installation & Setup

### 1. Prerequisites
Make sure you have **Python 3.10+** and **MySQL Server 8+** installed and running on your system.

### 2. Set Up Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate       # On Windows
source venv/bin/activate    # On Linux/macOS
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Database Setup
Create a new MySQL database named `deodap_clone_db`:
```sql
CREATE DATABASE deodap_clone_db;
```

### 5. Environment Configuration
Verify or create a `.env` file in the root directory:
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/deodap_clone_db
APP_NAME="AtoZ Gadgets API"
SECRET_KEY=deodap_secret_key_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```
*(Update database credentials as appropriate)*

---

## Migrations and Seeding

### 1. Run Alembic Database Migrations
To build database tables via Alembic:
```bash
alembic upgrade head
```

### 2. Seed Database Mappings (Roles, Permissions & Mappings)
Populate defaults (Super Admin, Admin, Customer, and the permissions mappings):
```bash
python -m app.seeds.run_seeds
```

---

## Running the Server

Start the local Uvicorn development server:
```bash
uvicorn app.main:app --reload
```
Once started, the API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## API Documentation & Testing

### 1. Swagger UI
Access the interactive API documentation at:
- **Swagger**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 2. API Response Formats

#### Success Format
```json
{
  "status": true,
  "message": "Operation description",
  "data": {}
}
```

#### Error Format
```json
{
  "status": false,
  "message": "Error main summary message",
  "errors": [
    {
      "field": "body.email",
      "message": "value is not a valid email address"
    }
  ]
}
```

### 3. Core Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register a new Customer.
- `POST /api/auth/login`: Login and receive access & refresh tokens.
- `GET /api/auth/me`: Get current logged-in user profile (Requires Bearer Token).

#### User Management CRUD (`/api/users`) - Role-Based Permission Enforced
- `GET /api/users`: Search, filter, and paginate users (Requires `user.read` permission).
- `GET /api/users/{id}`: View specific user details (Requires `user.read` permission).
- `POST /api/users`: Create a new user with a specific role (Requires `user.create` permission).
- `PUT /api/users/{id}`: Update user attributes (Requires `user.update` permission).
- `DELETE /api/users/{id}`: Delete a user record (Requires `user.delete` permission).
