# Database Cleanup Scripts

This directory contains scripts to completely delete all data from your PostgreSQL database.

## ⚠️ WARNING

**These scripts will PERMANENTLY DELETE ALL DATA from your database. This action cannot be undone!**

## Files

- `clear-database.sql` - SQL script that deletes all data from all tables
- `clear-database.sh` - Shell script that executes the SQL script with safety checks
- `README.md` - This documentation file

## Usage

### Option 1: Using the Shell Script (Recommended)

The shell script provides safety checks and confirmation prompts:

```bash
# From the project root directory
./scripts/clear-database.sh
```

The script will:
1. Load environment variables from `.env` file
2. Show a warning and ask for confirmation
3. Execute the SQL cleanup script
4. Verify that all data has been deleted
5. Show a summary of the cleanup

### Option 2: Using the SQL Script Directly

If you prefer to run the SQL script directly:

```bash
# Using psql command line
PGPASSWORD=your_password psql -h localhost -p 5432 -U postgres -d myapp -f scripts/clear-database.sql

# Or using Docker (if your database is running in Docker)
docker exec -i your-db-container psql -U postgres -d myapp < scripts/clear-database.sql
```

## What Gets Deleted

The scripts will delete all data from these tables in the correct order:

1. `vote` - All vote records
2. `answer` - All answer records  
3. `question_tag` - Junction table for question-tag relationships
4. `question` - All question records
5. `tag` - All tag records
6. `users` - All user records

## Prerequisites

- PostgreSQL client tools (`psql`) installed, OR
- Docker (if using Docker-based database)
- `.env` file with database connection details
- Appropriate database permissions

## Environment Variables Required

Make sure your `.env` file contains:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=myapp
```

## After Cleanup

After running the cleanup script:

1. **Run migrations** to recreate the database schema:
   ```bash
   pnpm run migration:run
   ```

2. **Run seeders** to populate with test data:
   ```bash
   pnpm run seed
   ```

## Safety Features

The shell script includes several safety features:

- **Confirmation prompt**: Requires typing "YES" to confirm
- **Environment validation**: Checks for required environment variables
- **Database connection test**: Verifies connection before proceeding
- **Verification step**: Shows table row counts after cleanup
- **Error handling**: Stops execution on any errors

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/clear-database.sh
```

### psql Command Not Found
Install PostgreSQL client tools:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Or use Docker
docker run --rm -it postgres:15 psql -h your-host -U your-user -d your-db
```

### Connection Issues
- Verify your `.env` file has correct database credentials
- Ensure the database server is running
- Check firewall settings if connecting to remote database

## Alternative: Using TypeORM Commands

You can also use the existing TypeORM commands:

```bash
# Drop all tables and recreate schema
pnpm run migration:reset

# Run migrations to recreate schema
pnpm run migration:run

# Seed with test data
pnpm run seed
```

However, the custom scripts provide more control and safety checks.
