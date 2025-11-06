#!/bin/bash

# Force config.js to production mode only

CONFIG_FILE="/var/www/GyanIn/frontend/src/config.js"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "🔧 Fixing config.js for Production"
echo "=========================================="

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ config.js not found at $CONFIG_FILE"
    exit 1
fi

# Backup current config
echo "Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Create production-only config
echo ""
echo "Creating production config..."
cat > "$CONFIG_FILE" << 'EOF'
// API Configuration
// PRODUCTION CONFIGURATION - Active
// Frontend: https://gyanin.academy
// Backend: https://api.gyanin.academy

const API_CONFIG = {
  baseURL: 'https://api.gyanin.academy',
  edgestoreBasePath: '/api/edgestore',
};

export default API_CONFIG;
EOF

echo "✅ Production config created"

# Verify
echo ""
echo "Verifying config..."
if grep -q "baseURL: 'https://api.gyanin.academy'" "$CONFIG_FILE"; then
    echo "✅ Config verified - production URL found"
else
    echo "❌ Config verification failed!"
    exit 1
fi

# Check for any empty baseURL (should not exist)
if grep -q "baseURL: ''" "$CONFIG_FILE"; then
    echo "⚠️  WARNING: Empty baseURL found! This should not be in production."
    exit 1
fi

echo ""
echo "Current config.js content:"
cat "$CONFIG_FILE"

echo ""
echo "=========================================="
echo "✅ Config fixed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Rebuild: npm run build"
echo "  2. Verify build: ./verify-build-edgestore.sh"
echo "  3. Deploy: ./force-update-deploy.sh"
echo ""

