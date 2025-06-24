#!/usr/bin/env node
/**
 * Database Helper for Claude Code
 * Provides MCP-like functionality using Node.js and pg
 */

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: './env.local' });

class DatabaseHelper {
  constructor() {
    this.client = new Client(process.env.DATABASE_URL);
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.end();
  }

  async listTables() {
    const result = await this.client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    return result.rows;
  }

  async describeTable(tableName) {
    const result = await this.client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    return result.rows;
  }

  async runQuery(sql, params = []) {
    const result = await this.client.query(sql, params);
    return result;
  }

  async getTableCount(tableName) {
    const result = await this.client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return result.rows[0].count;
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  const db = new DatabaseHelper();
  await db.connect();

  try {
    switch (command) {
      case 'list-tables':
        const tables = await db.listTables();
        console.log('📋 Database Tables:');
        tables.forEach(table => {
          console.log(`  ${table.table_name} (${table.table_type})`);
        });
        break;

      case 'describe':
        if (!arg1) {
          console.log('Usage: node db-helper.js describe <table_name>');
          process.exit(1);
        }
        const columns = await db.describeTable(arg1);
        console.log(`🔍 Table: ${arg1}`);
        columns.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        break;

      case 'query':
        if (!arg1) {
          console.log('Usage: node db-helper.js query "SELECT * FROM table_name LIMIT 5"');
          process.exit(1);
        }
        const result = await db.runQuery(arg1);
        console.log(`📊 Query Results (${result.rowCount} rows):`);
        if (result.rows.length > 0) {
          console.table(result.rows);
        }
        break;

      case 'count':
        if (!arg1) {
          console.log('Usage: node db-helper.js count <table_name>');
          process.exit(1);
        }
        const count = await db.getTableCount(arg1);
        console.log(`📊 ${arg1}: ${count} rows`);
        break;

      default:
        console.log('Available commands:');
        console.log('  list-tables                    - List all tables');
        console.log('  describe <table>               - Show table structure');
        console.log('  query "SELECT ..."             - Run SQL query');
        console.log('  count <table>                  - Count rows in table');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DatabaseHelper;