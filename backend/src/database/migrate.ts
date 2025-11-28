import fs from 'fs';
import path from 'path';
import db from '../config/database';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

interface Migration {
  id: number;
  filename: string;
  executed_at?: Date;
}

async function createMigrationsTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
}

async function getExecutedMigrations(): Promise<Migration[]> {
  const result = await db.query('SELECT * FROM migrations ORDER BY id');
  return result.rows;
}

async function executeMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`Executing migration: ${filename}`);
  
  try {
    await db.query('BEGIN');
    await db.query(sql);
    await db.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    await db.query('COMMIT');
    console.log(`✓ Migration ${filename} executed successfully`);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`✗ Migration ${filename} failed:`, error);
    throw error;
  }
}

async function rollbackMigration(filename: string): Promise<void> {
  console.log(`Rolling back migration: ${filename}`);
  
  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM migrations WHERE filename = $1', [filename]);
    await db.query('COMMIT');
    console.log(`✓ Migration ${filename} rolled back successfully`);
    console.log('Note: SQL rollback must be done manually');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`✗ Rollback of ${filename} failed:`, error);
    throw error;
  }
}

async function migrateUp(): Promise<void> {
  await createMigrationsTable();
  
  const executedMigrations = await getExecutedMigrations();
  const executedFilenames = new Set(executedMigrations.map(m => m.filename));
  
  const allMigrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const pendingMigrations = allMigrationFiles.filter(f => !executedFilenames.has(f));

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migration(s)`);
  
  for (const filename of pendingMigrations) {
    await executeMigration(filename);
  }
  
  console.log('All migrations completed successfully');
}

async function migrateDown(): Promise<void> {
  const executedMigrations = await getExecutedMigrations();
  
  if (executedMigrations.length === 0) {
    console.log('No migrations to rollback');
    return;
  }

  const lastMigration = executedMigrations[executedMigrations.length - 1];
  await rollbackMigration(lastMigration.filename);
}

async function createMigration(name: string): Promise<void> {
  const timestamp = Date.now();
  const filename = `${timestamp}_${name}.sql`;
  const filePath = path.join(MIGRATIONS_DIR, filename);
  
  const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- Write your migration SQL here
`;

  fs.writeFileSync(filePath, template);
  console.log(`Created migration: ${filename}`);
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

(async () => {
  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      case 'down':
        await migrateDown();
        break;
      case 'create':
        if (!arg) {
          console.error('Please provide a migration name');
          process.exit(1);
        }
        await createMigration(arg);
        break;
      default:
        console.log('Usage: npm run migrate:up | migrate:down | migrate:create <name>');
    }
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await db.close();
    process.exit(1);
  }
})();
