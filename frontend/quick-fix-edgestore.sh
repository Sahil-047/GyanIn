#!/bin/bash

# Quick diagnostic and fix script for EdgeStore URL issue

set -e

echo "=========================================="
echo "🔍 EdgeStore URL Diagnostic & Fix"
echo "=========================================="

FRONTEND_DIR="/var/www/GyanIn/frontend"
NGINX_DIR="/var/www/gyanin.academy"
CONFIG_FILE="$FRONTEND_DIR/src/config.js"

echo ""
echo "Step 1: Checking config.js..."
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ config.js exists"
    echo ""
    echo "Current baseURL setting:"
    grep -A 2 "baseURL:" "$CONFIG_FILE" | head -5
    echo ""
    
    if grep -q "baseURL: 'https://api.gyanin.academy'" "$CONFIG_FILE"; then
        echo "✅ config.js has correct production URL"
    else
        echo "❌ config.js does NOT have correct production URL!"
        echo "   Please update config.js to use: baseURL: 'https://api.gyanin.academy'"
        exit 1
    fi
else
    echo "❌ config.js not found at $CONFIG_FILE"
    exit 1
fi

echo ""
echo "Step 2: Checking built files..."
BUILD_DIR="$FRONTEND_DIR/dist"
if [ -d "$BUILD_DIR" ]; then
    echo "✅ Build directory exists"
    
    # Check for EdgeStore URLs in built files
    echo ""
    echo "Searching for EdgeStore URLs in built JS files..."
    JS_FILES=$(find "$BUILD_DIR" -name "*.js" -type f | head -3)
    
    if [ -n "$JS_FILES" ]; then
        for file in $JS_FILES; do
            echo ""
            echo "File: $(basename "$file")"
            
            # Check for correct URL
            if grep -q "api\.gyanin\.academy" "$file" 2>/dev/null; then
                echo "  ✅ Contains: api.gyanin.academy"
                grep -oE ".{0,80}api\.gyanin\.academy.{0,80}" "$file" 2>/dev/null | head -2 | sed 's/^/    /' || true
            fi
            
            # Check for wrong URL (without api. prefix)
            if grep -qE 'https://gyanin\.academy/api/edgestore' "$file" 2>/dev/null; then
                echo "  ❌ Contains WRONG URL: gyanin.academy/api/edgestore"
                grep -oE ".{0,80}gyanin\.academy/api/edgestore.{0,80}" "$file" 2>/dev/null | head -2 | sed 's/^/    /' || true
            fi
            
            # Check for relative paths
            if grep -qE '"/api/edgestore|/api/edgestore' "$file" 2>/dev/null; then
                echo "  ⚠️  Contains relative path: /api/edgestore"
            fi
        done
    else
        echo "  ⚠️  No JS files found in build directory"
    fi
else
    echo "⚠️  Build directory not found - run build first"
fi

echo ""
echo "Step 3: Checking deployed files..."
if [ -d "$NGINX_DIR" ]; then
    echo "✅ Nginx directory exists"
    
    DEPLOYED_JS=$(find "$NGINX_DIR" -name "*.js" -type f | head -3)
    if [ -n "$DEPLOYED_JS" ]; then
        echo ""
        echo "Checking deployed JS files for EdgeStore URLs..."
        for file in $DEPLOYED_JS; do
            if grep -q "api\.gyanin\.academy" "$file" 2>/dev/null; then
                echo "  ✅ Deployed file contains: api.gyanin.academy"
                echo "     File: $(basename "$file")"
            elif grep -qE 'https://gyanin\.academy/api/edgestore' "$file" 2>/dev/null; then
                echo "  ❌ Deployed file contains WRONG URL: gyanin.academy/api/edgestore"
                echo "     File: $(basename "$file")"
            fi
        done
    else
        echo "  ⚠️  No deployed JS files found"
    fi
fi

echo ""
echo "Step 4: Testing EdgeStore endpoint..."
echo "Testing: https://api.gyanin.academy/api/edgestore/init"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.gyanin.academy/api/edgestore/init" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "405" ]; then
    echo "  Response code: $HTTP_CODE"
    if [ "$HTTP_CODE" = "405" ]; then
        echo "  ⚠️  405 Method Not Allowed - check backend CORS and route configuration"
    fi
else
    echo "  ⚠️  Could not connect (code: $HTTP_CODE)"
fi

echo ""
echo "=========================================="
echo "📋 Summary & Next Steps"
echo "=========================================="
echo ""
echo "If config.js is correct but build has wrong URL:"
echo "  1. Clean build: rm -rf $BUILD_DIR"
echo "  2. Rebuild: cd $FRONTEND_DIR && npm run build"
echo "  3. Redeploy: ./clean-rebuild-deploy.sh"
echo ""
echo "If 405 error persists:"
echo "  1. Check Nginx config for gyanin.academy - should NOT proxy /api/*"
echo "  2. Check backend CORS configuration"
echo "  3. Verify backend edgestore route is working"
echo ""

