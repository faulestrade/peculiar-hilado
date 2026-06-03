const pool = require('../config/db');

async function getAll(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.active = true
       WHERE c.active = true
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

async function create(req, res) {
  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'Nombre y slug requeridos' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1,$2,$3) RETURNING *',
      [name, slug, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'El slug ya existe' });
    res.status(500).json({ error: 'Error al crear categoría' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { name, slug, description, active } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        active = COALESCE($4, active)
       WHERE id = $5 RETURNING *`,
      [name, slug, description, active, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    await pool.query('UPDATE categories SET active = false WHERE id = $1', [id]);
    res.json({ message: 'Categoría desactivada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
}

module.exports = { getAll, create, update, remove };
