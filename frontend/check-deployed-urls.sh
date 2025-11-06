#!/bin/bash

# Diagnostic script to check what URLs are in the deployed frontend files

echo "=========================================="
echo "🔍 Checking Deployed Frontend URLs"
echo "=========================================="

NGINX_DIR="/var/www/gyanin.academy"
BUILD_DIR="/var/www/GyanIn/frontend/dist"

echo ""
echo "Checking Nginx deployment directory: $NGINX_DIR"
if [ -d "$NGINX_DIR" ]; then
    echo "✅ Directory exists"
    
    # Find all JS files
    JS_FILES=$(find "$NGINX_DIR" -name "*.js" -type f 2>/dev/null | head -5)
    
    if [ -n "$JS_FILES" ]; then
        echo ""
        echo "📄 Checking JS files for EdgeStore URLs..."
        for file in $JS_FILES; do
            echo ""
            echo "File: $(basename $file)"
            
            # Check for correct URL
            if grep -q "api.gyanin.academy.*edgestore" "$file" 2>/dev/null; then
                echo "  ✅ Contains: api.gyanin.academy/api/edgestore"
            fi
            
            # Check for wrong URL
            if grep -q '"https://gyanin.academy/api/edgestore' "$file" 2>/dev/null || \
               grep -q "'https://gyanin.academy/api/edgestore" "$file" 2>/dev/null; then
                echo "  ❌ Contains WRONG URL: gyanin.academy/api/edgestore (missing 'api.')"
                echo "  Showing context:"
                grep -o '.{0,50}gyanin.academy/api/edgestore.{0,50}' "$file" | head -3
            fi
            
            # Show any EdgeStore references
            if grep -q "edgestore" "$file" 2>/dev/null; then
                echo "  📍 EdgeStore references found:"
                grep -o '.{0,80}edgestore.{0,80}' "$file" | head -3 | sed 's/^/    /'
            fi
        done
    else
        echo "❌ No JS files found in deployment directory"
    fi
else
    echo "❌ Directory does not exist"
fi

echo ""
echo "Checking build directory: $BUILD_DIR"
if [ -d "$BUILD_DIR" ]; then
    echo "✅ Build directory exists"
    
    JS_FILES=$(find "$BUILD_DIR" -name "*.js" -type f 2>/dev/null | head -5)
    
    if [ -n "$JS_FILES" ]; then
        echo ""
        echo "📄 Checking built JS files for EdgeStore URLs..."
        for file in $JS_FILES; do
            echo ""
            echo "File: $(basename $file)"
            
            if grep -q "api.gyanin.academy.*edgestore" "$file" 2>/dev/null; then
                echo "  ✅ Contains: api.gyanin.academy/api/edgestore"
            fi
            
            if grep -q '"https://gyanin.academy/api/edgestore' "$file" 2>/dev/null || \
               grep -q "'https://gyanin.academy/api/edgestore" "$file" 2>/dev/null; then
                echo "  ❌ Contains WRONG URL: gyanin.academy/api/edgestore"
            fi
        done
    fi
else
    echo "⚠️  Build directory does not exist (run build first)"
fi

echo ""
echo "Checking source config.js:"
CONFIG_FILE="/var/www/GyanIn/frontend/src/config.js"
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ Config file exists"
    echo ""
    echo "Current config.js content:"
    grep -A 5 "baseURL:" "$CONFIG_FILE" | head -10
else
    echo "❌ Config file not found"
fi

echo ""
echo "=========================================="

