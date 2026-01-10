#!/bin/bash

# Database Backup Script
# This script creates a backup of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/var/backups/celebration-garden"
DB_NAME="celebration_garden"
DB_USER="strapi_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating database backup..."
echo "   Database: $DB_NAME"
echo "   Backup file: $BACKUP_FILE"

# Create backup
PGPASSWORD="$DATABASE_PASSWORD" pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup created: $BACKUP_FILE"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +30 -delete

echo "✅ Old backups cleaned up (kept last 30 days)"
echo ""
echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

