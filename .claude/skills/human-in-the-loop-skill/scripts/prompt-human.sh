#!/usr/bin/env bash
# Exit immediately if an unset variable is used
set -u

echo "🛑 [HUMAN-IN-THE-LOOP INTERCEPT ACTIVE]"
echo "--------------------------------------------------------"
echo "The AI Agent has paused execution because a critical design"
echo "decision or high-risk workspace action requires review."
echo "--------------------------------------------------------"
# 1. Output the current execution roadblock context summary
if [ -f .git/FETCH_HEAD ] || [ -f package.json ] || [ -f pyproject.toml ]; then
    echo "📍 Workspace Context: $(git status -s 2>/dev/null || echo 'Local directory root')"
fi

echo ""
echo "👉 Action Required: Type your decision or instructions below."
echo "   (Examples: 'Option A', 'Change database schema to integer', 'Abort run')"
echo "--------------------------------------------------------"
# 2. Open an interactive standard input loop to capture live human feedback
printf "📝 Your Input > "
if read -r USER_RESPONSE; then
    # Sanitize inputs for file logging
    CLEAN_RESPONSE=$(echo "$USER_RESPONSE" | xargs)
    
    if [ -z "$CLEAN_RESPONSE" ]; then
        echo "⚠️ Empty input received. Defaulting workflow to safe cancellation."
        exit 1
    fi
    
    # 3. Log the input to a temporary runtime block file so the agent's file tools can read it
    echo "$CLEAN_RESPONSE" > .human_decision.txt
    echo "✅ Response recorded successfully. Handing control back to AI agent workflow."
    exit 0
else
    echo "❌ Failed to read terminal input stream."
    exit 1
fi
