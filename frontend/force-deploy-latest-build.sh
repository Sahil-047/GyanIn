#!/bin/bash

# Force deploy the latest build and clear all caches

set -e

BUILD_DIR="/var/www/GyanIn/frontend/dist"
NGINX_DIR="/var/www/gyanin.academy"

echo "=========================================="
echo "🔥 Force Deploy Latest Build"
echo "=========================================="

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found: $BUILD_DIR"
    echo "Run: npm run build"
    exit 1
fi

# Get build file name
BUILT_FILE=$(find "$BUILD_DIR/assets" -name "index-*.js" -type f | head -1)
if [ -z "$BUILT_FILE" ]; then
    echo "❌ No built JS file found"
    exit 1
fi

BUILT_FILENAME=$(basename "$BUILT_FILE")
echo "✅ Found build file: $BUILT_FILENAME"

# Verify it has correct URL
if grep -q "https://api\.gyanin\.academy.*edgestore" "$BUILT_FILE" 2>/dev/null; then
    echo "✅ Build has correct EdgeStore URL"
else
    echo "❌ Build does NOT have correct URL!"
    exit 1
fi

echo ""
echo "Step 1: Removing ALL old deployed files..."
rm -rf "$NGINX_DIR"/*

echo "Step 2: Copying new build..."
cp -r "$BUILD_DIR"/* "$NGINX_DIR/"

echo "Step 3: Setting permissions..."
chown -R www-data:www-data "$NGINX_DIR"
chmod -R 755 "$NGINX_DIR"

echo "Step 4: Verifying deployed file..."
DEPLOYED_FILE=$(find "$NGINX_DIR/assets" -name "index-*.js" -type f | head -1)
DEPLOYED_FILENAME=$(basename "$DEPLOYED_FILE")
echo "   Deployed file: $DEPLOYED_FILENAME"

if [ "$BUILT_FILENAME" != "$DEPLOYED_FILENAME" ]; then
    echo "   ⚠️  WARNING: Filenames don't match!"
    echo "      Built: $BUILT_FILENAME"
    echo "      Deployed: $DEPLOYED_FILENAME"
fi

echo "Step 5: Clearing Nginx cache..."
rm -rf /var/cache/nginx/* 2>/dev/null || true

echo "Step 6: Reloading Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Deployed file: $DEPLOYED_FILENAME"
echo ""
echo "📝 CRITICAL: Clear browser cache completely:"
echo "   1. Open DevTools (F12)"
echo "   2. Right-click the refresh button"
echo "   3. Select 'Empty Cache and Hard Reload'"
echo ""
echo "   OR:"
echo "   1. Press Ctrl+Shift+Delete"
echo "   2. Select 'Cached images and files'"
echo "   3. Time range: 'All time'"
echo "   4. Clear data"
echo ""
echo "   OR use Incognito/Private mode to test"
echo ""

