#!/bin/bash

# PostgreSQL Setup Script
# Run this script to create the database and user for Strapi

set -e

echo "🗄️  Setting up PostgreSQL for Celebration Garden..."
echo ""

# Prompt for database password
read -sp "Enter password for strapi_user: " DB_PASSWORD
echo ""
read -sp "Confirm password: " DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

# Create database and user
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE celebration_garden;

-- Create user
CREATE USER strapi_user WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE celebration_garden TO strapi_user;

-- Allow user to create databases (needed for Strapi migrations)
ALTER USER strapi_user CREATEDB;

-- Connect to database and grant schema privileges
\c celebration_garden
GRANT ALL ON SCHEMA public TO strapi_user;
EOF

echo "✅ PostgreSQL database and user created successfully!"
echo ""
echo "📝 Database details:"
echo "   Database: celebration_garden"
echo "   User: strapi_user"
echo "   Password: [the password you entered]"
echo ""
echo "💡 Save these credentials for your .env file!"

