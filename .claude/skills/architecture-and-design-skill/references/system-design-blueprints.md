# System Design Blueprints

## Architectural Boundary Rules (Layer Isolation)
* **Data Access Layer**: MUST ONLY contain logic interacting directly with the database. MUST NOT contain business logic.
* **Presentation Layer**: Frontend UI or API Controllers MUST NOT directly query the database. They must rely on services.
* **Domain/Service Layer**: All business logic belongs exclusively in the service layer.
* **Third-Party Integrations**: External dependencies and APIs MUST be wrapped in an adapter/facade and MUST be mocked during unit tests.
