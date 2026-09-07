const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  // Split on semicolons but keep each statement intact; skip empty ones
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      // Expected errors (already exists) are logged but don't stop the migration
      console.warn(`Migration warning: ${err.message.split('\n')[0]}`);
    }
  }
  console.log('Migración completada');
}

module.exports = migrate;
