#!/bin/bash

# Verify EdgeStore configuration in built files

BUILD_DIR="/var/www/GyanIn/frontend/dist"
CONFIG_FILE="/var/www/GyanIn/frontend/src/config.js"

echo "=========================================="
echo "🔍 Verifying EdgeStore Configuration"
echo "=========================================="
echo ""

echo "1. Checking source config.js:"
if [ -f "$CONFIG_FILE" ]; then
    echo "   ✅ config.js exists"
    echo ""
    echo "   Current configuration:"
    grep -A 3 "baseURL:" "$CONFIG_FILE" | head -5 | sed 's/^/      /'
    echo ""
    
    # Check if production config is active
    if grep -q "baseURL: 'https://api.gyanin.academy'" "$CONFIG_FILE"; then
        echo "   ✅ Production URL found in config"
    else
        echo "   ❌ Production URL NOT found!"
        echo "      Please check config.js"
    fi
    
    # Check if dev config is commented
    if grep -q "^/\*" "$CONFIG_FILE" && grep -q "^const API_CONFIG = {" "$CONFIG_FILE"; then
        echo "   ⚠️  WARNING: Both dev and prod configs might be active!"
    fi
else
    echo "   ❌ config.js not found!"
    exit 1
fi

echo ""
echo "2. Checking built files for EdgeStore basePath:"
if [ -d "$BUILD_DIR" ]; then
    JS_FILES=$(find "$BUILD_DIR" -name "*.js" -type f)
    
    if [ -n "$JS_FILES" ]; then
        FOUND_ABSOLUTE=false
        FOUND_RELATIVE=false
        FOUND_WRONG=false
        
        for file in $JS_FILES; do
            # Search for absolute URL pattern
            if grep -qE 'https://api\.gyanin\.academy.*edgestore|edgestore.*https://api\.gyanin\.academy' "$file" 2>/dev/null; then
                FOUND_ABSOLUTE=true
                echo "   ✅ Found ABSOLUTE URL (correct) in: $(basename "$file")"
                # Show context
                grep -oE ".{0,100}https://api\.gyanin\.academy.*edgestore.{0,50}|.{0,100}edgestore.*https://api\.gyanin\.academy.{0,50}" "$file" 2>/dev/null | head -1 | sed 's/^/      /' || true
            fi
            
            # Search for wrong absolute URL (gyanin.academy without api.)
            if grep -qE 'https://gyanin\.academy.*edgestore|edgestore.*https://gyanin\.academy' "$file" 2>/dev/null; then
                FOUND_WRONG=true
                echo "   ❌ Found WRONG absolute URL in: $(basename "$file")"
                grep -oE ".{0,100}https://gyanin\.academy.*edgestore.{0,50}" "$file" 2>/dev/null | head -1 | sed 's/^/      /' || true
            fi
            
            # Search for relative path pattern
            if grep -qE '"/api/edgestore|/api/edgestore"|basePath.*"/api/edgestore' "$file" 2>/dev/null; then
                # Check if it's part of a larger absolute URL context
                if ! grep -qE 'https://api\.gyanin\.academy' "$file" 2>/dev/null; then
                    FOUND_RELATIVE=true
                    echo "   ⚠️  Found RELATIVE path /api/edgestore in: $(basename "$file")"
                    echo "      This will resolve to gyanin.academy instead of api.gyanin.academy"
                    grep -oE ".{0,80}/api/edgestore.{0,80}" "$file" 2>/dev/null | head -1 | sed 's/^/      /' || true
                fi
            fi
        done
        
        echo ""
        if [ "$FOUND_ABSOLUTE" = true ]; then
            echo "   ✅ Build contains correct absolute URL"
        fi
        if [ "$FOUND_WRONG" = true ]; then
            echo "   ❌ Build contains WRONG absolute URL"
        fi
        if [ "$FOUND_RELATIVE" = true ] && [ "$FOUND_ABSOLUTE" != true ]; then
            echo "   ❌ Build contains RELATIVE path (will fail in production)"
        fi
    else
        echo "   ⚠️  No JS files found in build directory"
    fi
else
    echo "   ⚠️  Build directory does not exist"
    echo "      Run: npm run build"
fi

echo ""
echo "3. Searching for EdgeStore initialization pattern:"
if [ -d "$BUILD_DIR" ]; then
    for file in "$BUILD_DIR"/assets/*.js; do
        if [ -f "$file" ]; then
            # Look for createEdgeStoreProvider or basePath assignment
            if grep -qE 'createEdgeStoreProvider|basePath' "$file" 2>/dev/null; then
                echo "   Found in: $(basename "$file")"
                # Try to extract the basePath value
                grep -oE 'basePath[^,}]*' "$file" 2>/dev/null | head -3 | sed 's/^/      /' || true
            fi
        fi
    done
fi

echo ""
echo "=========================================="

