#!/bin/bash

# Script to add SSH config for Celebration Garden EC2
# This makes it easier to connect: just type "ssh celebration-garden"

set -e

SSH_CONFIG="$HOME/.ssh/config"
SSH_DIR="$HOME/.ssh"

# Create .ssh directory if it doesn't exist
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# Check if config already exists
if grep -q "Host celebration-garden" "$SSH_CONFIG" 2>/dev/null; then
    echo "⚠️  SSH config for 'celebration-garden' already exists!"
    echo "   Edit ~/.ssh/config manually to update it."
    exit 1
fi

# Get the path to the PEM file
echo "Enter the full path to your CelebrationGarden.pem file:"
echo "   (or press Enter to use: ~/.ssh/CelebrationGarden.pem)"
read -r PEM_PATH

if [ -z "$PEM_PATH" ]; then
    PEM_PATH="$HOME/.ssh/CelebrationGarden.pem"
fi

# Convert to absolute path
PEM_PATH=$(eval echo "$PEM_PATH")

# Check if PEM file exists
if [ ! -f "$PEM_PATH" ]; then
    echo "❌ Error: PEM file not found at: $PEM_PATH"
    echo "   Please copy your CelebrationGarden.pem file to ~/.ssh/ or provide the correct path."
    exit 1
fi

# Set correct permissions on PEM file
chmod 400 "$PEM_PATH"

# Create or append to SSH config
if [ ! -f "$SSH_CONFIG" ]; then
    touch "$SSH_CONFIG"
    chmod 600 "$SSH_CONFIG"
fi

# Add the config entry
cat >> "$SSH_CONFIG" << EOF

# Celebration Garden EC2 Instance
Host celebration-garden
    HostName ec2-13-203-214-241.ap-south-1.compute.amazonaws.com
    User ubuntu
    IdentityFile $PEM_PATH
    ServerAliveInterval 60
    ServerAliveCountMax 3
EOF

echo "✅ SSH config added successfully!"
echo ""
echo "📝 You can now connect with:"
echo "   ssh celebration-garden"
echo ""
echo "💡 The config has been added to: $SSH_CONFIG"

