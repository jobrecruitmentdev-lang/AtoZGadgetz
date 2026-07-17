#!/usr/bin/env bash
# Exit immediately if a command fails, or if an unset variable is used
set -euo pipefail

SEARCH_QUERY="${1:-}"
if [ -z "$SEARCH_QUERY" ]; then
    echo "🛑 Error: No search query provided."
    echo "Usage: ./test-search.sh \"your search query here\""
    exit 1
fi

echo "🌐 Initiating real-time web search for: \"${SEARCH_QUERY}\""
# Execute google-search-mcp via npx to grab a clean JSON string of search engine results page (SERP) snippets
# This requires no api keys and bypasses bot blocks using browser fingerprint automation
if ! npx -y @mcp-server/google-search-mcp@latest search --query "$SEARCH_QUERY" > .search_results.json 2>/dev/null; then
    # Fallback to a fast curl request or alternative free tool if npx network block occurs
    echo "⚠️ Playwright search driver failed. Attempting lightweight engine fallback..."
    curl -s "https://duckduckgo.com/?q=$(echo "$SEARCH_QUERY" | sed 's/ /+/g')" | grep -oP '(?<=<a class="topic" href=")[^"]*' | head -n 5 > .search_results.json || true
fi
# Print out results safely for agent visibility
if [ -s .search_results.json ]; then
    cat .search_results.json
    rm -f .search_results.json
    exit 0
else
    echo "🛑 Search processing failed. No relevant web snippets retrieved."
    rm -f .search_results.json
    exit 1
fi
