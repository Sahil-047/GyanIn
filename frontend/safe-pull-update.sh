#!/bin/bash

# Safe Git Pull Script for Server
# This script safely pulls updates without overwriting server-specific configurations

set -e

echo "=========================================="
echo "🔄 Safe Git Pull & Update Script"
echo "=========================================="

FRONTEND_DIR="/var/www/GyanIn/frontend"
BACKUP_DIR="/var/www/GyanIn/backup_$(date +%Y%m%d_%H%M%S)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Navigate to frontend directory
echo ""
echo "📁 Step 1: Navigating to frontend directory..."
cd "$FRONTEND_DIR"

if [ ! -d ".git" ]; then
    echo -e "${RED}❌ ERROR: Not a git repository!${NC}"
    echo "Please initialize git or clone the repository first."
    exit 1
fi

# Step 2: Check for uncommitted changes
echo ""
echo "🔍 Step 2: Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo "Files with changes:"
    git status --porcelain
    
    read -p "Do you want to stash these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stashing changes..."
        git stash push -m "Stashed before pull $(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Changes stashed${NC}"
    else
        echo -e "${RED}❌ Aborting to preserve your changes${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Step 3: Backup important files that might be server-specific
echo ""
echo "💾 Step 3: Backing up server-specific files..."
mkdir -p "$BACKUP_DIR"

# Backup config.js (in case it has server-specific settings)
if [ -f "src/config.js" ]; then
    cp "src/config.js" "$BACKUP_DIR/config.js.backup"
    echo "  ✅ Backed up config.js"
fi

# Backup .env files if they exist
if [ -f "../backend/.env" ]; then
    cp "../backend/.env" "$BACKUP_DIR/backend.env.backup"
    echo "  ✅ Backed up backend/.env"
fi

# Step 4: Pull latest changes
echo ""
echo "⬇️  Step 4: Pulling latest changes from Git..."
git fetch origin

# Check if there are updates
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️  Already up to date with remote${NC}"
else
    echo "Pulling changes..."
    git pull origin main
    echo -e "${GREEN}✅ Successfully pulled latest changes${NC}"
fi

# Step 5: Restore config.js if it was customized
echo ""
echo "🔧 Step 5: Checking config.js..."
if [ -f "$BACKUP_DIR/config.js.backup" ]; then
    # Compare backup with current
    if ! cmp -s "$BACKUP_DIR/config.js.backup" "src/config.js"; then
        echo -e "${YELLOW}⚠️  config.js has changed${NC}"
        echo ""
        echo "Current config.js (first few lines):"
        head -10 "src/config.js"
        echo ""
        echo "Backed up config.js (first few lines):"
        head -10 "$BACKUP_DIR/config.js.backup"
        echo ""
        read -p "Do you want to restore your backed-up config.js? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$BACKUP_DIR/config.js.backup" "src/config.js"
            echo -e "${GREEN}✅ Restored your config.js${NC}"
        else
            echo -e "${YELLOW}⚠️  Keeping new config.js from Git${NC}"
            echo "Please verify it has the correct production settings:"
            echo "  baseURL: 'https://api.gyanin.academy'"
        fi
    else
        echo -e "${GREEN}✅ config.js unchanged${NC}"
        rm "$BACKUP_DIR/config.js.backup"
    fi
fi

# Step 6: Verify production config
echo ""
echo "✅ Step 6: Verifying production configuration..."
if grep -q "baseURL: 'https://api.gyanin.academy'" "src/config.js"; then
    echo -e "${GREEN}✅ config.js has correct production URL${NC}"
else
    echo -e "${RED}❌ WARNING: config.js does not have production URL!${NC}"
    echo "Please check src/config.js and ensure it has:"
    echo "  baseURL: 'https://api.gyanin.academy'"
fi

# Step 7: Make scripts executable
echo ""
echo "🔧 Step 7: Making scripts executable..."
chmod +x clean-rebuild-deploy.sh 2>/dev/null || true
chmod +x quick-fix-edgestore.sh 2>/dev/null || true
chmod +x check-deployed-urls.sh 2>/dev/null || true
echo -e "${GREEN}✅ Scripts are executable${NC}"

# Step 8: Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Git Pull Complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "   1. Verify config.js has correct settings:"
echo "      cat src/config.js | grep baseURL"
echo ""
echo "   2. Run clean rebuild and deploy:"
echo "      ./clean-rebuild-deploy.sh"
echo ""
echo "   3. Or run diagnostic first:"
echo "      ./quick-fix-edgestore.sh"
echo ""
echo "💾 Backup location: $BACKUP_DIR"
echo ""

