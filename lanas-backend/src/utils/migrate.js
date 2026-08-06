const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migración completada');
  } catch (err) {
    console.error('Error en migración:', err.message);
  }
}

module.exports = migrate;
