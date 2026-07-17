#!/usr/bin/env bash
set -euo pipefail

TARGET_PATH="${1:-.}"
echo "🧐 Reviewing changes inside: ${TARGET_PATH}"
# Audit for raw hardcoded secrets or API tokens left by mistake
if grep -rniE "(password|secret|passwd|api_key|token|private_key)\s*=\s*['\"][A-Za-z0-9+/=_-]{12,}['\"]" "$TARGET_PATH" --exclude-dir=node_modules --exclude-dir=.venv*; then
    echo "🛑 CRITICAL: Hardcoded security parameters or keys detected!"
    exit 1
fi
# Audit Python if applicable
if command -v ruff &> /dev/null && [ -d "$TARGET_PATH" ]; then
    echo "🐍 Auditing Python rules..."
    ruff check "$TARGET_PATH" --select=E,F,B,S || true
fi

echo "✅ Code Review static checks executed successfully."
exit 0
