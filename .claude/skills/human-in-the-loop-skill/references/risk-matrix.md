# Human Intervention Risk Matrix
The AI Agent must immediately halt execution and trigger the Human-in-the-Loop Skill when encountering any of the following operational scenarios:
### ⚠️ High-Risk Scenarios (Mandatory Pauses)
| Category | Trigger Condition | Action Required |
| :--- | :--- | :--- |
| **Database** | Dropping columns or migrating production tables using Prisma | Present the exact schema diff before pushing |
| **Security** | Modifying authentication decorators, CORS policies, or JWT logic | Provide a summary of the security impact |
| **Costs** | Spinning up remote Docker containers or invoking third-party paid APIs | Request budget approval before launching |
| **Loops** | Failing the same local Pytest or Playwright assertion 3 times in a row | Present the error and ask for manual design guidance |
