#!/usr/bin/env bash
# Exit immediately if a command fails, or if an unset variable is used
set -euo pipefail

TARGET_LAYER="${1:-fullstack}"
EXIT_STATUS=0

echo "🚀 Launching Functionality and End-to-End Testing Engine: [${TARGET_LAYER}]"
# ==========================================
# 1. BACKEND FUNCTIONAL TESTING (FASTAPI + PYTEST)
# ==========================================
run_backend_tests() {
    echo "🐍 Context: FastAPI Backend Testing Pipeline"
    BACKEND_DIR="backend"
    
    if [ -d "$BACKEND_DIR" ]; then
        VENV_DIR="${BACKEND_DIR}/.venv-test"
        if [ ! -d "$VENV_DIR" ]; then
            echo "📦 Building temporary virtual environment for testing..."
            python3 -m venv "$VENV_DIR"
            "$VENV_DIR/bin/pip" install --quiet -r "${BACKEND_DIR}/requirements.txt" || true
            "$VENV_DIR/bin/pip" install --quiet pytest httpx pytest-asyncio
        fi
        
        # Activate environment safely
        # shellcheck disable=SC1091
        source "$VENV_DIR/bin/activate"
        
        echo "⚡ Running Pytest Suites..."
        # Run test suites with output capture configured for clear terminal parsing
        if ! pytest "$BACKEND_DIR" -v --tb=short; then
            echo "❌ Backend: Pytest suite execution failed."
            EXIT_STATUS=1
        fi
        deactivate
    else
        echo "⚠️ Warning: '${BACKEND_DIR}' folder not found. Skipping backend layer."
    fi
}
# ==========================================
# 2. FRONTEND E2E TESTING (NEXT.JS + PLAYWRIGHT)
# ==========================================
run_frontend_tests() {
    echo "🟢 Context: Next.js Frontend E2E Testing Pipeline"
    FRONTEND_DIR="frontend"
    
    if [ -d "$FRONTEND_DIR" ]; then
        if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
            echo "📦 Installing frontend testing runtime instances..."
            npm --prefix "$FRONTEND_DIR" ci --quiet
        fi
        
        # Ensure Playwright browser binaries are present
        if ! npx --prefix "$FRONTEND_DIR" playwright --version &> /dev/null; then
             npm --prefix "$FRONTEND_DIR" install --save-dev @playwright/test
             npx --prefix "$FRONTEND_DIR" playwright install --with-deps chromium
        fi

        echo "⚡ Running Playwright End-to-End Tests..."
        if ! npx --prefix "$FRONTEND_DIR" playwright test; then
            echo "❌ Frontend: Playwright test execution failed."
            EXIT_STATUS=1
        fi
    else
         echo "⚠️ Warning: '${FRONTEND_DIR}' folder not found. Skipping frontend layer."
    fi
}
# ==========================================
# 3. ROUTING EXECUTION FLOW
# ==========================================
case "$TARGET_LAYER" in
    "backend")
        run_backend_tests
        ;;
    "frontend")
        run_frontend_tests
        ;;
    "fullstack")
        run_backend_tests
        run_frontend_tests
        ;;
    *)
        echo "🛑 Unknown layer selector target: ${TARGET_LAYER}"
        exit 2
        ;;
esac

# Final summary feedback reporting loops back into agent console context
echo "------------------------------------------------"
if [ $EXIT_STATUS -eq 0 ]; then
    echo "✅ SUCCESS: All functional and E2E verification test cycles completed cleanly."
    exit 0
else
    echo "🛑 FAILURE: Functional test mutations broke assertions. Read logs above and self-correct."
    exit 1
fi
