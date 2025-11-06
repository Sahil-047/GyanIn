#!/bin/bash

# Force Update and Deploy Script
# This aggressively clears caches and redeploys

set -e

echo "=========================================="
echo "🔥 Force Update & Deploy"
echo "=========================================="

FRONTEND_DIR="/var/www/GyanIn/frontend"
NGINX_DIR="/var/www/gyanin.academy"
BUILD_DIR="$FRONTEND_DIR/dist"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "Step 1: Verifying config.js on server..."
if [ -f "$FRONTEND_DIR/src/config.js" ]; then
    if grep -q "baseURL: 'https://api.gyanin.academy'" "$FRONTEND_DIR/src/config.js"; then
        echo -e "${GREEN}✅ config.js is correct${NC}"
    else
        echo -e "${RED}❌ config.js is WRONG!${NC}"
        echo "Please update config.js first!"
        exit 1
    fi
else
    echo -e "${RED}❌ config.js not found!${NC}"
    exit 1
fi

echo ""
echo "Step 2: Aggressively cleaning ALL caches..."
cd "$FRONTEND_DIR"

# Remove all build artifacts
echo "   Removing build directory..."
rm -rf "$BUILD_DIR"

# Remove all Vite caches
echo "   Removing Vite caches..."
rm -rf .vite
rm -rf node_modules/.vite
find . -name ".vite" -type d -exec rm -rf {} + 2>/dev/null || true

# Clear npm cache
echo "   Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

echo -e "${GREEN}✅ All caches cleared${NC}"

echo ""
echo "Step 3: Reinstalling dependencies..."
npm install

echo ""
echo "Step 4: Building fresh frontend..."
npm run build

echo ""
echo "Step 5: Verifying build has correct URL..."
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Check for correct URL in built files
FOUND_CORRECT=false
FOUND_WRONG=false

for file in "$BUILD_DIR"/assets/*.js; do
    if [ -f "$file" ]; then
        if grep -q "api\.gyanin\.academy.*edgestore\|edgestore.*api\.gyanin\.academy" "$file" 2>/dev/null; then
            FOUND_CORRECT=true
            echo -e "${GREEN}✅ Found correct URL in: $(basename "$file")${NC}"
        fi
        if grep -qE 'https://gyanin\.academy/api/edgestore' "$file" 2>/dev/null; then
            FOUND_WRONG=true
            echo -e "${RED}❌ Found WRONG URL in: $(basename "$file")${NC}"
        fi
    fi
done

if [ "$FOUND_WRONG" = true ]; then
    echo -e "${RED}❌ Build contains wrong URL! Aborting deployment.${NC}"
    exit 1
fi

if [ "$FOUND_CORRECT" = false ]; then
    echo -e "${YELLOW}⚠️  Could not verify correct URL in build (might be minified)${NC}"
fi

echo ""
echo "Step 6: Removing ALL old deployed files..."
# Completely remove old files
find "$NGINX_DIR" -mindepth 1 -delete 2>/dev/null || true
# Ensure directory exists
mkdir -p "$NGINX_DIR"

echo ""
echo "Step 7: Copying new build files..."
cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

echo ""
echo "Step 8: Setting permissions..."
chown -R www-data:www-data "$NGINX_DIR"
chmod -R 755 "$NGINX_DIR"

echo ""
echo "Step 9: Testing Nginx config and reloading..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx config test failed!${NC}"
    exit 1
fi

echo ""
echo "Step 10: Verifying deployed files..."
DEPLOYED_JS=$(find "$NGINX_DIR" -name "*.js" -type f | head -1)
if [ -n "$DEPLOYED_JS" ]; then
    echo "Deployed JS file: $(basename "$DEPLOYED_JS")"
    if grep -q "api\.gyanin\.academy" "$DEPLOYED_JS" 2>/dev/null; then
        echo -e "${GREEN}✅ Deployed file contains correct URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify URL in deployed file${NC}"
    fi
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Force Deploy Complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Critical Next Steps:"
echo "   1. Clear browser cache completely:"
echo "      - Chrome: Ctrl+Shift+Delete → Clear cached images and files"
echo "      - Or use Incognito mode to test"
echo ""
echo "   2. Hard refresh the page:"
echo "      - Windows: Ctrl+F5"
echo "      - Mac: Cmd+Shift+R"
echo ""
echo "   3. Check browser console for:"
echo "      [EdgeStore] Production mode - basePath: https://api.gyanin.academy/api/edgestore"
echo ""
echo "   4. Verify Network tab shows requests to:"
echo "      https://api.gyanin.academy/api/edgestore/init"
echo "      NOT: https://gyanin.academy/api/edgestore/init"
echo ""
echo "   5. If still seeing old files, check Nginx cache:"
echo "      sudo rm -rf /var/cache/nginx/*"
echo "      sudo systemctl reload nginx"
echo ""

