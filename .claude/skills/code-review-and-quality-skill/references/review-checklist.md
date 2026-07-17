# Review Checklist

## Security
- No hardcoded secrets, tokens, or passwords.
- No direct database queries in UI or controller layers (SQL injection protection).
- Validate all incoming user data and payload structures.

## Style & Compliance
- Adhere to the `naming-rules.md` provided in the advanced-coding-skill.
- Use explicit error handling (no empty `try-catch` blocks).

## Architecture
- Logic is placed in the correct layer (Service vs Controller).
- Dependencies are appropriately injected.
