#!/bin/bash

# Script to allow all origins for development (USE WITH CAUTION)
# This is less secure but useful for development

echo "=========================================="
echo "Enabling ALLOW_ALL_ORIGINS for Development"
echo "=========================================="

# Backup current .env file
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up .env file"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from env.example..."
    cp env.example .env
fi

# Update ALLOW_ALL_ORIGINS
if grep -q "^ALLOW_ALL_ORIGINS=" .env; then
    sed -i 's|^ALLOW_ALL_ORIGINS=.*|ALLOW_ALL_ORIGINS=true|' .env
    echo "✅ Updated ALLOW_ALL_ORIGINS=true"
else
    echo "" >> .env
    echo "# Development: Allow all origins (USE WITH CAUTION)" >> .env
    echo "ALLOW_ALL_ORIGINS=true" >> .env
    echo "✅ Added ALLOW_ALL_ORIGINS=true"
fi

echo ""
echo "⚠️  WARNING: This allows ALL origins. Use only for development!"
echo ""
echo "Current ALLOW_ALL_ORIGINS:"
grep "^ALLOW_ALL_ORIGINS=" .env || echo "ALLOW_ALL_ORIGINS not found"

echo ""
echo "=========================================="
echo "Next steps:"
echo "1. Review the updated .env file"
echo "2. Restart the backend: pm2 restart all"
echo "3. Test from localhost:3000"
echo "=========================================="

