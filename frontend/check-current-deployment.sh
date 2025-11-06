#!/bin/bash

# Quick check of what's currently deployed

NGINX_DIR="/var/www/gyanin.academy"
BUILD_DIR="/var/www/GyanIn/frontend/dist"

echo "=========================================="
echo "🔍 Current Deployment Status"
echo "=========================================="
echo ""

echo "1. Deployed JS files in Nginx directory:"
if [ -d "$NGINX_DIR" ]; then
    JS_FILES=$(find "$NGINX_DIR" -name "*.js" -type f | head -5)
    if [ -n "$JS_FILES" ]; then
        for file in $JS_FILES; do
            echo "   - $(basename "$file")"
            # Check for EdgeStore URL
            if grep -qE 'https://gyanin\.academy/api/edgestore' "$file" 2>/dev/null; then
                echo "     ❌ WRONG: Contains gyanin.academy/api/edgestore"
            elif grep -q "api\.gyanin\.academy.*edgestore" "$file" 2>/dev/null; then
                echo "     ✅ CORRECT: Contains api.gyanin.academy/api/edgestore"
            else
                echo "     ⚠️  Could not find EdgeStore URL (might be minified)"
            fi
        done
    else
        echo "   ⚠️  No JS files found"
    fi
else
    echo "   ❌ Nginx directory does not exist"
fi

echo ""
echo "2. Built JS files (not yet deployed):"
if [ -d "$BUILD_DIR" ]; then
    JS_FILES=$(find "$BUILD_DIR" -name "*.js" -type f | head -5)
    if [ -n "$JS_FILES" ]; then
        for file in $JS_FILES; do
            echo "   - $(basename "$file")"
            if grep -qE 'https://gyanin\.academy/api/edgestore' "$file" 2>/dev/null; then
                echo "     ❌ WRONG: Contains gyanin.academy/api/edgestore"
            elif grep -q "api\.gyanin\.academy.*edgestore" "$file" 2>/dev/null; then
                echo "     ✅ CORRECT: Contains api.gyanin.academy/api/edgestore"
            fi
        done
    else
        echo "   ⚠️  No build files found (run build first)"
    fi
else
    echo "   ⚠️  Build directory does not exist"
fi

echo ""
echo "3. Comparing file names:"
DEPLOYED=$(find "$NGINX_DIR" -name "index-*.js" -type f 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")
BUILT=$(find "$BUILD_DIR" -name "index-*.js" -type f 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")

echo "   Deployed: $DEPLOYED"
echo "   Built:    $BUILT"

if [ "$DEPLOYED" != "$BUILT" ] && [ "$DEPLOYED" != "none" ] && [ "$BUILT" != "none" ]; then
    echo "   ⚠️  WARNING: Deployed files don't match build files!"
    echo "      You need to redeploy!"
fi

echo ""
echo "=========================================="

