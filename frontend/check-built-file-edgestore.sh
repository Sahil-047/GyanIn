#!/bin/bash

# Check what EdgeStore URL is actually in the built files

BUILD_DIR="/var/www/GyanIn/frontend/dist"
DEPLOYED_DIR="/var/www/gyanin.academy"

echo "=========================================="
echo "🔍 Checking EdgeStore URL in Built Files"
echo "=========================================="
echo ""

# Check build directory
if [ -d "$BUILD_DIR/assets" ]; then
    echo "1. Checking BUILD directory ($BUILD_DIR/assets):"
    JS_FILES=$(find "$BUILD_DIR/assets" -name "*.js" -type f)
    
    for file in $JS_FILES; do
        FILENAME=$(basename "$file")
        echo ""
        echo "   File: $FILENAME"
        
        # Check for correct URL
        if grep -q "https://api\.gyanin\.academy.*edgestore\|edgestore.*https://api\.gyanin\.academy" "$file" 2>/dev/null; then
            echo "   ✅ Contains: https://api.gyanin.academy/api/edgestore (CORRECT)"
            # Show the actual line
            grep -oE '.{0,150}https://api\.gyanin\.academy.*edgestore.{0,50}' "$file" 2>/dev/null | head -1 | sed 's/^/      /'
        fi
        
        # Check for wrong URL (gyanin.academy without api.)
        if grep -q "https://gyanin\.academy.*edgestore\|edgestore.*https://gyanin\.academy" "$file" 2>/dev/null; then
            echo "   ❌ Contains: https://gyanin.academy/api/edgestore (WRONG!)"
            grep -oE '.{0,150}https://gyanin\.academy.*edgestore.{0,50}' "$file" 2>/dev/null | head -1 | sed 's/^/      /'
        fi
        
        # Check for relative path
        if grep -qE '"/api/edgestore|basePath.*"/api/edgestore' "$file" 2>/dev/null; then
            # Only show if we didn't find absolute URL
            if ! grep -q "https://.*gyanin\.academy.*edgestore" "$file" 2>/dev/null; then
                echo "   ⚠️  Contains relative path: /api/edgestore (will resolve to gyanin.academy)"
                grep -oE '.{0,100}/api/edgestore.{0,50}' "$file" 2>/dev/null | head -1 | sed 's/^/      /'
            fi
        fi
        
        # Search for any EdgeStore references
        EDGESTORE_COUNT=$(grep -o "edgestore" "$file" 2>/dev/null | wc -l)
        if [ "$EDGESTORE_COUNT" -gt 0 ]; then
            echo "   📍 Found $EDGESTORE_COUNT references to 'edgestore'"
        fi
    done
else
    echo "   ⚠️  Build directory not found: $BUILD_DIR/assets"
fi

echo ""
echo "2. Checking DEPLOYED files ($DEPLOYED_DIR/assets):"
if [ -d "$DEPLOYED_DIR/assets" ]; then
    JS_FILES=$(find "$DEPLOYED_DIR/assets" -name "*.js" -type f)
    
    for file in $JS_FILES; do
        FILENAME=$(basename "$file")
        echo ""
        echo "   File: $FILENAME"
        
        if grep -q "https://api\.gyanin\.academy.*edgestore\|edgestore.*https://api\.gyanin\.academy" "$file" 2>/dev/null; then
            echo "   ✅ Contains: https://api.gyanin.academy/api/edgestore (CORRECT)"
        elif grep -q "https://gyanin\.academy.*edgestore\|edgestore.*https://gyanin\.academy" "$file" 2>/dev/null; then
            echo "   ❌ Contains: https://gyanin.academy/api/edgestore (WRONG!)"
        elif grep -qE '"/api/edgestore' "$file" 2>/dev/null && ! grep -q "https://.*gyanin\.academy" "$file" 2>/dev/null; then
            echo "   ⚠️  Contains relative path: /api/edgestore"
        else
            echo "   ❓ No EdgeStore URL pattern found"
        fi
    done
else
    echo "   ⚠️  Deployed directory not found: $DEPLOYED_DIR/assets"
fi

echo ""
echo "=========================================="
echo "3. Summary:"
echo "=========================================="

# Check build
if [ -d "$BUILD_DIR/assets" ]; then
    BUILT_FILE=$(find "$BUILD_DIR/assets" -name "index-*.js" -type f | head -1)
    if [ -n "$BUILT_FILE" ]; then
        if grep -q "https://api\.gyanin\.academy.*edgestore" "$BUILT_FILE" 2>/dev/null; then
            echo "✅ BUILD: Has correct URL"
        elif grep -q "https://gyanin\.academy.*edgestore" "$BUILT_FILE" 2>/dev/null; then
            echo "❌ BUILD: Has wrong URL (gyanin.academy instead of api.gyanin.academy)"
        elif grep -qE '"/api/edgestore' "$BUILT_FILE" 2>/dev/null; then
            echo "❌ BUILD: Has relative path (will fail)"
        else
            echo "⚠️  BUILD: Could not determine URL pattern"
        fi
    fi
fi

# Check deployed
if [ -d "$DEPLOYED_DIR/assets" ]; then
    DEPLOYED_FILE=$(find "$DEPLOYED_DIR/assets" -name "index-*.js" -type f | head -1)
    if [ -n "$DEPLOYED_FILE" ]; then
        if grep -q "https://api\.gyanin\.academy.*edgestore" "$DEPLOYED_FILE" 2>/dev/null; then
            echo "✅ DEPLOYED: Has correct URL"
        elif grep -q "https://gyanin\.academy.*edgestore" "$DEPLOYED_FILE" 2>/dev/null; then
            echo "❌ DEPLOYED: Has wrong URL"
        elif grep -qE '"/api/edgestore' "$DEPLOYED_FILE" 2>/dev/null; then
            echo "❌ DEPLOYED: Has relative path"
        else
            echo "⚠️  DEPLOYED: Could not determine URL pattern"
        fi
    fi
fi

echo ""

