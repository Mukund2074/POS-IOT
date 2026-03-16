#!/usr/bin/env bash
# install.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${BLUE}[$(date '+%F %T')]${NC} $*"; }
success() { echo -e "${GREEN}✅ $*${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $*${NC}"; }
error() { echo -e "${RED}❌ $*${NC}"; }

# Configuration
REPO_URL="https://gitlab.com/xmatiq/clients/findsalon/fiind-iot.git"
REPO_DIR="/opt/fiind-iot"
SETUP_SCRIPT="setup.sh"
WIFI_MANAGER_SCRIPT="iot-wifi-manager.sh"

log "🚀 Starting automated IoT device setup..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user."
   exit 1
fi

# Update package list
log "📦 Updating package list..."
sudo apt update -y

# Install git if not present
log "🔧 Installing git..."
if ! command -v git >/dev/null 2>&1; then
    sudo apt install -y git
    success "Git installed successfully"
else
    success "Git is already installed"
fi

# Configure git if needed (for authentication)
log "🔐 Configuring git authentication..."
echo "Please ensure you have access to the repository: $REPO_URL"
echo "If the repository requires authentication, you may need to:"
echo "1. Set up SSH keys, or"
echo "2. Use a personal access token, or"
echo "3. Use HTTPS with stored credentials"
echo ""
read -p "Press Enter to continue with git clone..."

# Create permanent directory and set permissions
log "📁 Creating permanent directory $REPO_DIR..."
sudo mkdir -p "$REPO_DIR"
sudo chown -R "$(whoami):$(whoami)" "$REPO_DIR"

# Clone the repository
log "📥 Cloning repository from $REPO_URL..."
if [ -d "$REPO_DIR/.git" ]; then
    warning "Repository already exists in $REPO_DIR. Updating it..."
    cd "$REPO_DIR"
    git pull origin main || git pull origin master
else
    git clone "$REPO_URL" "$REPO_DIR"
fi
success "Repository cloned/updated successfully"

# Change to repository directory
cd "$REPO_DIR"

# Make scripts executable
log "🔧 Making scripts executable..."
chmod +x "$SETUP_SCRIPT"
chmod +x "$WIFI_MANAGER_SCRIPT"
success "Scripts made executable"

# Check if scripts exist
if [ ! -f "$SETUP_SCRIPT" ]; then
    error "Setup script ($SETUP_SCRIPT) not found in repository"
    exit 1
fi

if [ ! -f "$WIFI_MANAGER_SCRIPT" ]; then
    error "WiFi manager script ($WIFI_MANAGER_SCRIPT) not found in repository"
    exit 1
fi

# Run setup.sh first
log "🏗️  Running setup script..."
echo "This will install Node.js, PM2, and configure the IoT application..."
read -p "Press Enter to continue with setup..."

./"$SETUP_SCRIPT"
success "Setup script completed"

# Run iot-wifi-manager.sh
log "📡 Running WiFi manager installation..."
echo "This will install and configure the WiFi manager with captive portal..."
echo "⚠️  This requires sudo privileges for system configuration..."
read -p "Press Enter to continue with WiFi manager installation..."

sudo ./"$WIFI_MANAGER_SCRIPT"
success "WiFi manager installation completed"

# Final status
log "🎉 Installation completed successfully!"
echo ""
echo "📋 Summary of what was installed:"
echo "  • Git (if not already present)"
echo "  • Node.js LTS and pnpm"
echo "  • PM2 process manager"
echo "  • IoT application with PM2"
echo "  • WiFi manager with captive portal"
echo ""
echo "🔧 Next steps:"
echo "  • The IoT application should be running via PM2"
echo "  • WiFi manager service should be active"
echo "  • If no internet connection, device will create AP 'Device-Setup'"
echo "  • Connect to AP and configure WiFi through captive portal"
echo ""
echo "📊 To check status:"
echo "  • PM2 status: pm2 status"
echo "  • WiFi manager logs: sudo journalctl -u iot-wifi-manager -f"
echo "  • Application logs: pm2 logs fiindap-iot-client"
