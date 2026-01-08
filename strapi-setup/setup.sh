#!/bin/bash

# Strapi Setup Script for Celebration Garden
# This script automates the Strapi setup process

echo "🎉 Setting up Strapi CMS for Celebration Garden..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Create Strapi project
echo "📦 Creating Strapi project..."
npx create-strapi-app@latest celebration-garden-cms --quickstart --no-run

if [ $? -ne 0 ]; then
    echo "❌ Failed to create Strapi project"
    exit 1
fi

echo ""
echo "✅ Strapi project created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Start Strapi: cd celebration-garden-cms && npm run develop"
echo "2. Create your admin account in the browser"
echo "3. Import the content type: Settings → Import/Export → Import → invitation-content-type.json"
echo "4. Configure permissions: Settings → Users & Permissions → Roles → Public → Enable find & findOne"
echo ""
echo "🎊 Setup complete! Follow the instructions above to finish configuration."

