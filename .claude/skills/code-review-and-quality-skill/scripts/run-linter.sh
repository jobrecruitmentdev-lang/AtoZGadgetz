#!/bin/bash
# Runs code quality and linting checks

echo "Starting Code Quality Validation..."

# Check if target directory is provided
TARGET_DIR=${1:-"."}

# Example: If running in a Node.js project
if [ -f "$TARGET_DIR/package.json" ]; then
    echo "▶️ Node.js project detected. Running npm run lint..."
    npm run lint --prefix "$TARGET_DIR" || echo "⚠️ Linting warnings/errors detected."
fi

# Example: If running in a Python project
if [ -f "$TARGET_DIR/requirements.txt" ] || [ -f "$TARGET_DIR/pyproject.toml" ]; then
    echo "▶️ Python project detected."
    if command -v ruff &> /dev/null; then
        echo "Running ruff..."
        ruff check "$TARGET_DIR"
    elif command -v flake8 &> /dev/null; then
        echo "Running flake8..."
        flake8 "$TARGET_DIR"
    else
        echo "⚠️ No Python linter (ruff/flake8) found in path."
    fi
fi

echo "✅ Code quality checks complete!"
