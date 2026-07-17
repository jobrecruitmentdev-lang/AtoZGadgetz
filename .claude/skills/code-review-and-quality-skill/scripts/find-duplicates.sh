#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-.}"
echo "🔍 Scanning for copy-paste structural duplicate patterns in ${TARGET_DIR}..."
# Fallback method: Use jscpd via npx if available to check JS/TS/Python code clone blocks
if command -v npx &> /dev/null; then
    echo "⚡ Running jscpd analyzer..."
    npx -y jscpd "$TARGET_DIR" --ignore "**/.next/**,**/node_modules/**,**/.venv*/**" || true
else
    # Simplistic structural line frequency analysis for rapid fallback checking
    echo "⚠️ npx missing. Running simple block sorting check..."
    find "$TARGET_DIR" -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" \) \
      -not -path "*/node_modules/*" -not -path "*/.*" | xargs md5sum 2>/dev/null | sort | uniq -w 32 -d || echo "No direct matching duplicate file hashes."
fi
