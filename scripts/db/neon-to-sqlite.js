import { Client } from 'pg';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const neonUrl = process.env.NEON_DATABASE_URL; // Your original Neon PostgreSQL connection URL
const sqlitePath = process.env.DATABASE_URL || 'db/dev.db'; // Path to SQLite database

if (!neonUrl) {
  console.error('NEON_DATABASE_URL environment variable not set. Add it to your .env file');
  process.exit(1);
}

// Parse SQLite path based on different formats
let resolvedSqlitePath = sqlitePath;
if (resolvedSqlitePath.startsWith('sqlite:')) {
  const urlWithoutProtocol = resolvedSqlitePath.replace(/^sqlite:\/\//, '');
  resolvedSqlitePath = urlWithoutProtocol.startsWith('/') ? urlWithoutProtocol.substring(1) : urlWithoutProtocol;
} else if (resolvedSqlitePath.startsWith('file:')) {
  resolvedSqlitePath = resolvedSqlitePath.replace(/^file:/, '');
}

console.log(`Migrating data from Neon PostgreSQL to SQLite at ${resolvedSqlitePath}`);

// Connect to databases
const pgClient = new Client({ connectionString: neonUrl });
const sqliteDb = new Database(resolvedSqlitePath);

// Helper function to safely convert PostgreSQL values to SQLite-compatible values
function convertToSqliteValue(value, dataType) {
  if (value === null) return null;
  
  const pgType = dataType.toLowerCase();
  
  // Handle arrays by converting to JSON strings
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  
  // Handle dates and timestamps
  if (pgType.includes('timestamp') || pgType.includes('date')) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return String(value);
  }
  
  // Handle JSON and JSONB
  if (pgType === 'json' || pgType === 'jsonb') {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  }
  
  // Handle booleans
  if (pgType === 'boolean') {
    return value ? 1 : 0;
  }
  
  // Handle geometric types (point, line, etc.)
  if (pgType.startsWith('geo') || pgType.includes('point') || pgType.includes('vector')) {
    return JSON.stringify(value);
  }
  
  // Handle bytea (binary data)
  if (pgType === 'bytea' && value instanceof Buffer) {
    return value; // SQLite can handle buffers directly
  }
  
  // Handle any other object types by converting to string representation
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  
  // For all other types, return as is (SQLite will handle strings, numbers, etc.)
  return value;
}

async function main() {
  try {
    // Connect to Neon PostgreSQL
    await pgClient.connect();
    console.log('Connected to Neon PostgreSQL database');

    // Get all tables from PostgreSQL
    const tablesResult = await pgClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables in Neon database`);

    // Begin SQLite transaction
    const sqliteTransaction = sqliteDb.prepare('BEGIN TRANSACTION');
    sqliteTransaction.run();

    // Process each table
    for (const tableName of tables) {
      try {
        console.log(`\nProcessing table: ${tableName}`);
        
        // Get table schema from PostgreSQL
        const schemaResult = await pgClient.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);
        
        const columns = schemaResult.rows;
        console.log(`Table ${tableName} has ${columns.length} columns`);
        
        // Create table in SQLite (with basic type conversion)
        const columnDefs = columns.map(col => {
          // Basic PostgreSQL to SQLite type mapping
          let sqliteType = 'TEXT'; // Default type
          const pgType = col.data_type.toLowerCase();
          
          if (pgType.includes('int') || pgType === 'serial') {
            sqliteType = 'INTEGER';
          } else if (pgType.includes('float') || pgType.includes('double') || pgType.includes('numeric') || pgType.includes('decimal')) {
            sqliteType = 'REAL';
          } else if (pgType === 'boolean') {
            sqliteType = 'INTEGER'; // SQLite doesn't have a boolean type
          } else if (pgType === 'json' || pgType === 'jsonb' || pgType.includes('array') || pgType.startsWith('geo')) {
            sqliteType = 'TEXT'; // Store JSON as text in SQLite
          }
          
          const nullable = col.is_nullable === 'YES' ? '' : 'NOT NULL';
          return `"${col.column_name}" ${sqliteType} ${nullable}`;
        }).join(', ');
        
        // Drop table if it exists
        sqliteDb.prepare(`DROP TABLE IF EXISTS "${tableName}"`).run();
        
        // Create table
        const createTableQuery = `CREATE TABLE "${tableName}" (${columnDefs})`;
        sqliteDb.prepare(createTableQuery).run();
        console.log(`Created table ${tableName} in SQLite`);
        
        // Get data from PostgreSQL
        const dataResult = await pgClient.query(`SELECT * FROM "${tableName}"`);
        const rows = dataResult.rows;
        console.log(`Found ${rows.length} rows in ${tableName}`);
        
        if (rows.length > 0) {
          // Prepare column list for insert
          const columnNames = columns.map(col => `"${col.column_name}"`).join(', ');
          const placeholders = columns.map((_, index) => `?`).join(', ');
          
          // Prepare insert statement
          const insertStmt = sqliteDb.prepare(`INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`);
          
          // Insert data
          let successCount = 0;
          for (const row of rows) {
            try {
              const values = columns.map(col => {
                const value = row[col.column_name];
                return convertToSqliteValue(value, col.data_type);
              });
              
              insertStmt.run(...values);
              successCount++;
            } catch (insertError) {
              console.error(`Error inserting row in ${tableName}:`, insertError.message);
              if (insertError.message.includes('UNIQUE constraint failed')) {
                console.error('Skipping duplicate record');
              }
              // Log problematic data for debugging
              if (tableName === 'posts' || tableName === 'users') {
                console.error(`Data causing error in ${tableName}:`, 
                  JSON.stringify(row).substring(0, 100) + '...');
              }
              // Continue with other rows
            }
          }
          console.log(`Inserted ${successCount} rows into ${tableName}`);
        }
      } catch (tableError) {
        console.error(`Error processing table ${tableName}:`, tableError.message);
        // Continue with other tables
      }
    }

    // Commit SQLite transaction
    const commitTransaction = sqliteDb.prepare('COMMIT');
    commitTransaction.run();
    console.log('\nData migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    // Rollback if there was an error
    try {
      const rollbackTransaction = sqliteDb.prepare('ROLLBACK');
      rollbackTransaction.run();
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
  } finally {
    // Clean up
    await pgClient.end();
    sqliteDb.close();
  }
}

main(); 