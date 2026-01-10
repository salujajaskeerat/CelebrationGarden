#!/bin/bash

# PM2 Setup Script for Strapi
# Run this script on your EC2 server to set up PM2 for Strapi
# Usage: ./setup-pm2-strapi.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up PM2 for Strapi...${NC}"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 not found. Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 is already installed${NC}"
fi
echo ""

# Create log directory
echo -e "${YELLOW}📁 Creating PM2 log directory...${NC}"
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
echo -e "${GREEN}✅ Log directory created${NC}"
echo ""

# Check if we're in the right directory
STRAPI_DIR="/var/www/CelebrationGarden/backend/celebration-garden-cms"
if [ ! -d "$STRAPI_DIR" ]; then
    echo -e "${RED}❌ Error: Strapi directory not found at $STRAPI_DIR${NC}"
    exit 1
fi

# #region agent log
DEBUG_LOG="/tmp/pm2-setup-debug.log"
echo "{\"location\":\"setup-pm2-strapi.sh:38\",\"message\":\"Before cd\",\"data\":{\"PWD\":\"$(pwd)\",\"BASH_SOURCE\":\"${BASH_SOURCE[0]}\",\"USER\":\"$USER\",\"HOME\":\"$HOME\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"A\"}" >> "$DEBUG_LOG" 2>/dev/null || true
# #endregion

# Get the directory where this script is located BEFORE changing directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# #region agent log
echo "{\"location\":\"setup-pm2-strapi.sh:46\",\"message\":\"SCRIPT_DIR calculated\",\"data\":{\"SCRIPT_DIR\":\"$SCRIPT_DIR\",\"BASH_SOURCE\":\"${BASH_SOURCE[0]}\",\"PWD_BEFORE\":\"$(pwd)\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"A\"}" >> "$DEBUG_LOG" 2>/dev/null || true
# #endregion

cd "$STRAPI_DIR"

# #region agent log
echo "{\"location\":\"setup-pm2-strapi.sh:50\",\"message\":\"After cd to STRAPI_DIR\",\"data\":{\"PWD_AFTER\":\"$(pwd)\",\"STRAPI_DIR\":\"$STRAPI_DIR\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"C\"}" >> "$DEBUG_LOG" 2>/dev/null || true
# #endregion

# Check locations in order of likelihood
# #region agent log
DEBUG_LOG="/tmp/pm2-setup-debug.log"
CHECK1="$SCRIPT_DIR/../config/pm2-ecosystem.config.js"
CHECK2="/var/www/CelebrationGarden/deployment/config/pm2-ecosystem.config.js"
CHECK3="$HOME/CelebrationGarden/deployment/config/pm2-ecosystem.config.js"
CHECK4="./deployment/config/pm2-ecosystem.config.js"
CHECK5="./pm2-ecosystem.config.js"
echo "{\"location\":\"setup-pm2-strapi.sh:57\",\"message\":\"Checking PM2 config locations\",\"data\":{\"CHECK1\":\"$CHECK1\",\"CHECK1_EXISTS\":\"$([ -f \"$CHECK1\" ] && echo true || echo false)\",\"CHECK2\":\"$CHECK2\",\"CHECK2_EXISTS\":\"$([ -f \"$CHECK2\" ] && echo true || echo false)\",\"CHECK3\":\"$CHECK3\",\"CHECK3_EXISTS\":\"$([ -f \"$CHECK3\" ] && echo true || echo false)\",\"CHECK4\":\"$CHECK4\",\"CHECK4_EXISTS\":\"$([ -f \"$CHECK4\" ] && echo true || echo false)\",\"CURRENT_PWD\":\"$(pwd)\",\"HOME\":\"$HOME\",\"USER\":\"$USER\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"B\"}" >> "$DEBUG_LOG" 2>/dev/null || true
# #endregion

if [ -f "$SCRIPT_DIR/../config/pm2-ecosystem.config.js" ]; then
    # Config is in deployment/config/ relative to scripts/
    PM2_CONFIG="$SCRIPT_DIR/../config/pm2-ecosystem.config.js"
    # #region agent log
    echo "{\"location\":\"setup-pm2-strapi.sh:62\",\"message\":\"Found config at CHECK1\",\"data\":{\"PM2_CONFIG\":\"$PM2_CONFIG\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"A\"}" >> "$DEBUG_LOG" 2>/dev/null || true
    # #endregion
elif [ -f "/var/www/CelebrationGarden/deployment/config/pm2-ecosystem.config.js" ]; then
    # Absolute path to config
    PM2_CONFIG="/var/www/CelebrationGarden/deployment/config/pm2-ecosystem.config.js"
    # #region agent log
    echo "{\"location\":\"setup-pm2-strapi.sh:67\",\"message\":\"Found config at CHECK2\",\"data\":{\"PM2_CONFIG\":\"$PM2_CONFIG\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"B\"}" >> "$DEBUG_LOG" 2>/dev/null || true
    # #endregion
elif [ -f "$HOME/CelebrationGarden/deployment/config/pm2-ecosystem.config.js" ]; then
    # Check home directory (using $HOME instead of ~)
    PM2_CONFIG="$HOME/CelebrationGarden/deployment/config/pm2-ecosystem.config.js"
    # #region agent log
    echo "{\"location\":\"setup-pm2-strapi.sh:72\",\"message\":\"Found config at CHECK3\",\"data\":{\"PM2_CONFIG\":\"$PM2_CONFIG\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"C\"}" >> "$DEBUG_LOG" 2>/dev/null || true
    # #endregion
elif [ -f "./deployment/config/pm2-ecosystem.config.js" ]; then
    # Try relative path from project root
    PM2_CONFIG="./deployment/config/pm2-ecosystem.config.js"
    # #region agent log
    echo "{\"location\":\"setup-pm2-strapi.sh:77\",\"message\":\"Found config at CHECK4\",\"data\":{\"PM2_CONFIG\":\"$PM2_CONFIG\",\"RESOLVED\":\"$(readlink -f \"$PM2_CONFIG\" 2>/dev/null || realpath \"$PM2_CONFIG\" 2>/dev/null || echo \"$PM2_CONFIG\")\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"D\"}" >> "$DEBUG_LOG" 2>/dev/null || true
    # #endregion
elif [ -f "./pm2-ecosystem.config.js" ]; then
    # Try current directory (fallback)
    PM2_CONFIG="./pm2-ecosystem.config.js"
    # #region agent log
    echo "{\"location\":\"setup-pm2-strapi.sh:82\",\"message\":\"Found config at CHECK5 (current dir)\",\"data\":{\"PM2_CONFIG\":\"$PM2_CONFIG\",\"RESOLVED\":\"$(readlink -f \"$PM2_CONFIG\" 2>/dev/null || realpath \"$PM2_CONFIG\" 2>/dev/null || echo \"$PM2_CONFIG\")\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"E\"}" >> "$DEBUG_LOG" 2>/dev/null || true
    # #endregion
else
    # #region agent log
    echo "{\"location\":\"setup-pm2-strapi.sh:82\",\"message\":\"PM2 config NOT FOUND\",\"data\":{\"CHECK1\":\"$CHECK1\",\"CHECK1_EXISTS\":\"$([ -f \"$CHECK1\" ] && echo true || echo false)\",\"CHECK2\":\"$CHECK2\",\"CHECK2_EXISTS\":\"$([ -f \"$CHECK2\" ] && echo true || echo false)\",\"CHECK3\":\"$CHECK3\",\"CHECK3_EXISTS\":\"$([ -f \"$CHECK3\" ] && echo true || echo false)\",\"CHECK4\":\"$CHECK4\",\"CHECK4_EXISTS\":\"$([ -f \"$CHECK4\" ] && echo true || echo false)\",\"CURRENT_PWD\":\"$(pwd)\"},\"timestamp\":$(date +%s),\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"ALL\"}" >> "$DEBUG_LOG" 2>/dev/null || true
    # #endregion
    echo -e "${RED}❌ Error: PM2 config file not found${NC}"
    echo "   Searched locations:"
    echo "   - $SCRIPT_DIR/../config/pm2-ecosystem.config.js"
    echo "   - /var/www/CelebrationGarden/deployment/config/pm2-ecosystem.config.js"
    echo "   - $HOME/CelebrationGarden/deployment/config/pm2-ecosystem.config.js"
    echo "   - ./deployment/config/pm2-ecosystem.config.js"
    echo "   - ./pm2-ecosystem.config.js"
    echo ""
    echo "   Debug log saved to: $DEBUG_LOG"
    echo "   To view debug log: cat $DEBUG_LOG"
    exit 1
fi

echo -e "${GREEN}✅ Found PM2 config at: $PM2_CONFIG${NC}"

# Copy PM2 config to a convenient location
echo -e "${YELLOW}📋 Copying PM2 config...${NC}"
cp "$PM2_CONFIG" /var/www/pm2-ecosystem.config.js
echo -e "${GREEN}✅ PM2 config copied to /var/www/pm2-ecosystem.config.js${NC}"
echo ""

# Stop any existing Strapi process if running
echo -e "${YELLOW}🛑 Stopping any existing Strapi process...${NC}"
pm2 stop strapi 2>/dev/null || true
pm2 delete strapi 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned up existing processes${NC}"
echo ""

# Start Strapi with PM2
echo -e "${YELLOW}🚀 Starting Strapi with PM2...${NC}"
cd /var/www
pm2 start pm2-ecosystem.config.js --only strapi

# Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"
echo ""

# Setup PM2 to start on boot
echo -e "${YELLOW}⚙️  Setting up PM2 to start on boot...${NC}"
echo "   Run the command that PM2 outputs below:"
echo ""
pm2 startup
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Copy and run the command shown above to enable PM2 on boot${NC}"
echo ""

# Show status
echo -e "${GREEN}✅ PM2 setup completed!${NC}"
echo ""
echo -e "${GREEN}📊 Current PM2 status:${NC}"
pm2 status
echo ""
echo "Useful commands:"
echo "  - View logs:        pm2 logs strapi"
echo "  - Restart Strapi:   pm2 restart strapi"
echo "  - Stop Strapi:      pm2 stop strapi"
echo "  - View all logs:    pm2 logs"
echo "  - Monitor:          pm2 monit"
echo ""
