# General Code Quality Style Guide

## Readability & Naming
* Use descriptive, intention-revealing names for all variables, functions, and classes.
* Avoid magic numbers; extract them into named constants.
* Keep functions small and focused on a single responsibility (Single Responsibility Principle).

## Documentation
* Add comments only to explain *why* something is done, not *what* is done (the code should be self-evident).
* Write clear docstrings for all public APIs, interfaces, classes, and complex methods.

## Error Handling
* Never use empty catch blocks or swallow exceptions silently.
* Handle expected errors gracefully, and fail fast for unexpected errors.
* Log errors with sufficient context to aid debugging.

## Formatting
* Maintain consistent indentation and spacing as defined by the project's linter configuration.
* Group imports logically (standard library, third-party, internal).
