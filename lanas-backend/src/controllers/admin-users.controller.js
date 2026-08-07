const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function requireSuperadmin(req, res, next) {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

async function listUsers(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM admin_users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function createUser(req, res) {
  const { name, email, password, role = 'admin' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }
  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO admin_users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, hash, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  if (parseInt(id) === req.admin.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
  }
  try {
    await pool.query('DELETE FROM admin_users WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function changePassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE admin_users SET password = $1 WHERE id = $2', [hash, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { listUsers, createUser, deleteUser, changePassword, requireSuperadmin };
