# Migrating from SQLite to PostgreSQL

This guide helps you migrate your existing SQLite database to PostgreSQL.

## Prerequisites

- PostgreSQL installed and running
- Database and user created (see `setup-postgres.sh`)
- Strapi application with existing SQLite data

## Method 1: Using Strapi's Built-in Migration

Strapi can automatically migrate your schema when you switch databases.

### Steps:

1. **Backup your SQLite database:**
   ```bash
   cp celebration-garden-cms/.tmp/data.db celebration-garden-cms/.tmp/data.db.backup
   ```

2. **Update environment variables:**
   - Set `DATABASE_CLIENT=postgres` in your `.env` file
   - Configure PostgreSQL connection details

3. **Install PostgreSQL driver:**
   ```bash
   cd celebration-garden-cms
   npm install pg
   ```

4. **Start Strapi:**
   ```bash
   npm run develop
   ```
   - Strapi will automatically create the schema in PostgreSQL
   - **Note**: Content data will need to be migrated separately

## Method 2: Manual Data Migration

If you have existing content in SQLite that needs to be preserved:

### Export from SQLite:

1. **Install sqlite3 tools:**
   ```bash
   sudo apt-get install sqlite3
   ```

2. **Export data to SQL:**
   ```bash
   sqlite3 celebration-garden-cms/.tmp/data.db .dump > sqlite_export.sql
   ```

### Import to PostgreSQL:

1. **Convert SQLite SQL to PostgreSQL format:**
   - SQLite and PostgreSQL have different syntax
   - You may need to manually adjust the SQL file
   - Or use a migration tool like `pgloader`

2. **Using pgloader (Recommended):**
   ```bash
   sudo apt-get install pgloader
   pgloader sqlite:///var/www/celebration-garden-cms/.tmp/data.db postgresql://strapi_user:password@localhost/celebration_garden
   ```

## Method 3: Fresh Start (Recommended for New Deployments)

If you're setting up a fresh production environment:

1. **Start with PostgreSQL from the beginning:**
   - Don't migrate SQLite data
   - Set up Strapi with PostgreSQL
   - Re-create content in Strapi admin panel
   - This is cleaner and avoids migration issues

## Verification

After migration:

1. **Check database connection:**
   ```bash
   psql -U strapi_user -d celebration_garden -c "\dt"
   ```
   Should show Strapi tables

2. **Test Strapi:**
   - Start Strapi
   - Login to admin panel
   - Verify content is accessible

3. **Check logs:**
   ```bash
   pm2 logs strapi
   ```

## Troubleshooting

### Connection Issues:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check firewall rules
- Verify credentials in `.env`

### Schema Issues:
- Drop and recreate database if needed
- Let Strapi recreate schema automatically

### Data Issues:
- Restore from backup if needed
- Use `backup-database.sh` and `restore-database.sh` scripts

