# Repository Design Specification
### Backend Pattern: Service-Repository Separation
FastAPI endpoints handle HTTP parsing and pass clean data objects into decoupled Service classes. Service classes invoke Prisma/SQL engines. Avoid putting complex business calculations directly into endpoint routing decorators.
### Frontend Pattern: Clean Architecture
- `/components/ui`: Dumb presentation inputs and primitives (Buttons, Inputs).
- `/components/features`: Complex domain components tied to state (UserForms, CartLists).
- `/hooks`: Custom data fetching modules wrapping Axios/Fetch endpoints.
