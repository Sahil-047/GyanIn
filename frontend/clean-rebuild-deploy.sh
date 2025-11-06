#!/bin/bash

# Frontend Clean Rebuild and Deploy Script
# This script ensures a completely fresh build with no cached artifacts

set -e  # Exit on any error

echo "=========================================="
echo "🔧 Frontend Clean Rebuild & Deploy"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="/var/www/GyanIn/frontend"
NGINX_DIR="/var/www/gyanin.academy"
NODE_MODULES_CACHE="$FRONTEND_DIR/node_modules/.vite"
VITE_CACHE="$FRONTEND_DIR/.vite"
BUILD_DIR="$FRONTEND_DIR/dist"

# Step 1: Verify config.js contains production URL
echo ""
echo "📋 Step 1: Verifying config.js..."
if grep -q "baseURL: 'https://api.gyanin.academy'" "$FRONTEND_DIR/src/config.js"; then
    echo -e "${GREEN}✅ config.js has correct production URL${NC}"
else
    echo -e "${RED}❌ ERROR: config.js does not contain 'https://api.gyanin.academy'${NC}"
    echo "Please check your config.js file!"
    exit 1
fi

# Step 2: Clean all caches
echo ""
echo "🧹 Step 2: Cleaning all caches..."

# Remove Vite cache
if [ -d "$VITE_CACHE" ]; then
    echo "   Removing .vite cache..."
    rm -rf "$VITE_CACHE"
fi

# Remove node_modules Vite cache
if [ -d "$NODE_MODULES_CACHE" ]; then
    echo "   Removing node_modules/.vite cache..."
    rm -rf "$NODE_MODULES_CACHE"
fi

# Remove old build
if [ -d "$BUILD_DIR" ]; then
    echo "   Removing old build directory..."
    rm -rf "$BUILD_DIR"
fi

# Clear npm cache (optional, can be slow)
echo "   Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

echo -e "${GREEN}✅ All caches cleaned${NC}"

# Step 3: Install dependencies (in case package.json changed)
echo ""
echo "📦 Step 3: Installing dependencies..."
cd "$FRONTEND_DIR"
npm install

# Step 4: Build
echo ""
echo "🏗️  Step 4: Building frontend..."
npm run build

# Step 5: Verify build output contains correct URL
echo ""
echo "🔍 Step 5: Verifying build output..."

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ ERROR: Build directory not found!${NC}"
    exit 1
fi

# Search for EdgeStore basePath in built files
# We're looking for 'https://api.gyanin.academy/api/edgestore'
FOUND_CORRECT_URL=false
FOUND_WRONG_URL=false

# Search in all JS files in the build
echo "   Searching for EdgeStore URLs in built files..."
for file in "$BUILD_DIR"/assets/*.js; do
    if [ -f "$file" ]; then
        # Check for correct URL (api.gyanin.academy)
        if grep -q "api\.gyanin\.academy.*edgestore\|edgestore.*api\.gyanin\.academy" "$file" 2>/dev/null; then
            FOUND_CORRECT_URL=true
            echo -e "   ${GREEN}✅ Found correct EdgeStore URL in: $(basename $file)${NC}"
            # Show the actual URL found
            grep -o ".{0,100}api\.gyanin\.academy.*edgestore.{0,50}" "$file" 2>/dev/null | head -1 | sed 's/^/      /'
        fi
        
        # Check for wrong URL (gyanin.academy without api. prefix)
        if grep -q '"https://gyanin\.academy/api/edgestore\|'https://gyanin\.academy/api/edgestore" "$file" 2>/dev/null; then
            FOUND_WRONG_URL=true
            echo -e "   ${RED}❌ WARNING: Found WRONG URL in: $(basename $file)${NC}"
            # Show the actual wrong URL
            grep -o ".{0,100}gyanin\.academy/api/edgestore.{0,50}" "$file" 2>/dev/null | head -1 | sed 's/^/      /'
        fi
        
        # Also check for relative paths that might resolve incorrectly
        if grep -q '"/api/edgestore\|'"/api/edgestore" "$file" 2>/dev/null && [ "$FOUND_CORRECT_URL" != true ]; then
            echo -e "   ${YELLOW}⚠️  Found relative path /api/edgestore in: $(basename $file)${NC}"
            echo "      This might resolve to gyanin.academy instead of api.gyanin.academy"
        fi
    fi
done

if [ "$FOUND_CORRECT_URL" = true ]; then
    echo -e "${GREEN}✅ Build verification passed - Correct URL found${NC}"
elif [ "$FOUND_WRONG_URL" = true ]; then
    echo -e "${RED}❌ ERROR: Build contains WRONG URL!${NC}"
    echo "   The build is trying to use gyanin.academy instead of api.gyanin.academy"
    echo "   This will cause 405 errors and EdgeStore failures"
    echo ""
    echo "   Please verify config.js contains:"
    echo "   baseURL: 'https://api.gyanin.academy'"
    exit 1
else
    echo -e "${YELLOW}⚠️  Could not verify EdgeStore URL in build files${NC}"
    echo "   This might be okay if minified, but please verify manually:"
    echo "   grep -r 'edgestore' $BUILD_DIR/assets/*.js | head -5"
fi

# Step 6: Backup old deployment (optional)
echo ""
echo "💾 Step 6: Backing up old deployment..."
BACKUP_DIR="/var/www/gyanin.academy.backup.$(date +%Y%m%d_%H%M%S)"
if [ -d "$NGINX_DIR" ] && [ "$(ls -A $NGINX_DIR 2>/dev/null)" ]; then
    echo "   Creating backup at: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r "$NGINX_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
fi

# Step 7: Deploy to Nginx
echo ""
echo "🚀 Step 7: Deploying to Nginx..."

# Create directory if it doesn't exist
mkdir -p "$NGINX_DIR"

# Remove old files (but keep the directory)
echo "   Removing old files..."
find "$NGINX_DIR" -mindepth 1 -delete

# Copy new build
echo "   Copying new build files..."
cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

# Set proper permissions
echo "   Setting permissions..."
chown -R www-data:www-data "$NGINX_DIR"
chmod -R 755 "$NGINX_DIR"

echo -e "${GREEN}✅ Files deployed to $NGINX_DIR${NC}"

# Step 8: Restart Nginx to clear cache
echo ""
echo "🔄 Step 8: Restarting Nginx..."
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# Step 9: Final verification
echo ""
echo "🧪 Step 9: Final verification..."
echo "   Testing frontend endpoint..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend might not be accessible (check Nginx config)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "   1. Clear your browser cache (Ctrl+Shift+Delete)"
echo "   2. Or do a hard refresh (Ctrl+F5)"
echo "   3. Check browser console for any errors"
echo "   4. Verify EdgeStore is calling: https://api.gyanin.academy/api/edgestore/init"
echo ""
echo "🔍 To verify the URL in built files manually:"
echo "   grep -r 'api.gyanin.academy' $BUILD_DIR/assets/*.js"
echo ""

