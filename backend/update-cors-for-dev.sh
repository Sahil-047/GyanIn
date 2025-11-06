#!/bin/bash

# Script to update backend CORS configuration for development
# This allows localhost:3000 to access the hosted backend API

echo "=========================================="
echo "Updating Backend CORS Configuration"
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

# Check if localhost:3000 is already in FRONTEND_URL
if grep -q "localhost:3000" .env; then
    echo "✅ localhost:3000 is already in FRONTEND_URL"
else
    # Add localhost:3000 to FRONTEND_URL
    # Check current FRONTEND_URL format
    if grep -q "^FRONTEND_URL=" .env; then
        # Update existing FRONTEND_URL
        sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://gyanin.academy,https://www.gyanin.academy,http://localhost:3000|' .env
        echo "✅ Added http://localhost:3000 to FRONTEND_URL"
    else
        # Add new FRONTEND_URL line
        echo "" >> .env
        echo "# Development: Allow localhost:3000 for local frontend development" >> .env
        echo "FRONTEND_URL=https://gyanin.academy,https://www.gyanin.academy,http://localhost:3000" >> .env
        echo "✅ Added FRONTEND_URL with localhost:3000"
    fi
fi

# Show current FRONTEND_URL
echo ""
echo "Current FRONTEND_URL:"
grep "^FRONTEND_URL=" .env || echo "FRONTEND_URL not found"

echo ""
echo "=========================================="
echo "Next steps:"
echo "1. Review the updated .env file"
echo "2. Restart the backend: pm2 restart all"
echo "3. Test from localhost:3000"
echo "=========================================="

