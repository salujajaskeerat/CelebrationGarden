#!/bin/bash

# Database Restore Script
# This script restores a PostgreSQL database from a backup

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide backup file path"
    echo "Usage: ./restore-database.sh /path/to/backup.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="celebration_garden"
DB_USER="strapi_user"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring database from backup..."
echo "   Database: $DB_NAME"
echo "   Backup file: $BACKUP_FILE"
echo ""
read -p "⚠️  This will overwrite the current database. Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "📦 Decompressing backup..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
fi

# Drop and recreate database
echo "🗑️  Dropping existing database..."
PGPASSWORD="$DATABASE_PASSWORD" psql -U "$DB_USER" -h localhost -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
PGPASSWORD="$DATABASE_PASSWORD" psql -U "$DB_USER" -h localhost -d postgres -c "CREATE DATABASE ${DB_NAME};"

# Restore from backup
echo "📥 Restoring database..."
PGPASSWORD="$DATABASE_PASSWORD" psql -U "$DB_USER" -h localhost "$DB_NAME" < "$BACKUP_FILE"

# Clean up temp file if we decompressed
if [ -f "${BACKUP_FILE%.gz}" ] && [[ "$1" == *.gz ]]; then
    rm "${BACKUP_FILE%.gz}"
fi

echo "✅ Database restored successfully!"

