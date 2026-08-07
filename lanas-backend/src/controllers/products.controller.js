const pool = require('../config/db');

async function getAll(req, res) {
  const { category, featured, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const showAll = req.admin && req.query.all === 'true';
  const conditions = showAll ? [] : ['p.active = true'];
  const values = [];
  let i = 1;

  if (category) { conditions.push(`c.slug = $${i++}`); values.push(category); }
  if (featured === 'true') { conditions.push(`p.featured = true`); }
  if (search) { conditions.push(`p.name ILIKE $${i++}`); values.push(`%${search}%`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      values
    );
    const total = parseInt(countRes.rows[0].count);

    values.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1) as main_image,
        (SELECT json_agg(json_build_object('id', id, 'color_name', color_name, 'color_hex', color_hex, 'stock', stock, 'price_override', price_override))
         FROM product_variants WHERE product_id = p.id AND active = true) as variants
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      values
    );

    res.json({ products: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

async function getOne(req, res) {
  const { slug } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT json_agg(json_build_object('id', id, 'image_url', image_url, 'is_main', is_main) ORDER BY position)
         FROM product_images WHERE product_id = p.id) as images,
        (SELECT json_agg(json_build_object('id', id, 'color_name', color_name, 'color_hex', color_hex, 'stock', stock, 'price_override', price_override, 'sku', sku))
         FROM product_variants WHERE product_id = p.id AND active = true) as variants
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1 AND p.active = true`,
      [slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
}

async function create(req, res) {
  const { name, slug, description, category_id, price, weight_grams, fiber_composition, needle_size, featured, coming_soon, variants } = req.body;
  if (!name || !slug || !price) {
    return res.status(400).json({ error: 'Nombre, slug y precio son requeridos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO products (name, slug, description, category_id, price, weight_grams, fiber_composition, needle_size, featured, coming_soon)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, slug, description, category_id || null, price, weight_grams || null, fiber_composition || null, needle_size || null, featured || false, coming_soon || false]
    );
    const product = rows[0];

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, color_name, color_hex, sku, stock, price_override)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [product.id, v.color_name, v.color_hex || null, v.sku || null, v.stock || 0, v.price_override || null]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(product);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'El slug ya existe' });
    res.status(500).json({ error: 'Error al crear producto' });
  } finally {
    client.release();
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { name, slug, description, category_id, price, weight_grams, fiber_composition, needle_size, featured, coming_soon, active, variants } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        category_id = $4,
        price = COALESCE($5, price),
        weight_grams = COALESCE($6, weight_grams),
        fiber_composition = COALESCE($7, fiber_composition),
        needle_size = COALESCE($8, needle_size),
        featured = COALESCE($9, featured),
        coming_soon = COALESCE($10, coming_soon),
        active = COALESCE($11, active)
       WHERE id = $12 RETURNING *`,
      [name, slug, description, category_id || null, price, weight_grams || null, fiber_composition || null, needle_size || null, featured, coming_soon, active, id]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Producto no encontrado' }); }

    if (variants && Array.isArray(variants)) {
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
      for (const v of variants) {
        if (!v.color_name) continue;
        await client.query(
          `INSERT INTO product_variants (product_id, color_name, color_hex, sku, stock, price_override)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, v.color_name, v.color_hex || null, v.sku || null, v.stock || 0, v.price_override || null]
        );
      }
    }

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'El slug ya existe' });
    res.status(500).json({ error: 'Error al actualizar producto' });
  } finally {
    client.release();
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    await pool.query('UPDATE products SET active = false WHERE id = $1', [id]);
    res.json({ message: 'Producto desactivado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

async function uploadImage(req, res) {
  const { id } = req.params;
  const { is_main } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

  const imageUrl = `/uploads/${req.file.filename}`;
  try {
    if (is_main === 'true') {
      await pool.query('UPDATE product_images SET is_main = false WHERE product_id = $1', [id]);
    }
    const { rows } = await pool.query(
      'INSERT INTO product_images (product_id, image_url, is_main) VALUES ($1,$2,$3) RETURNING *',
      [id, imageUrl, is_main === 'true']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar imagen' });
  }
}

async function deleteImage(req, res) {
  const { imageId } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM product_images WHERE id = $1 RETURNING *', [imageId]);
    if (!rows[0]) return res.status(404).json({ error: 'Imagen no encontrada' });
    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
}

async function updateVariantStock(req, res) {
  const { variantId } = req.params;
  const { stock } = req.body;
  if (stock === undefined) return res.status(400).json({ error: 'Stock requerido' });

  try {
    const { rows } = await pool.query(
      'UPDATE product_variants SET stock = $1 WHERE id = $2 RETURNING *',
      [stock, variantId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
}

async function toggleActive(req, res) {
  const { id } = req.params;
  const { active } = req.body;
  if (typeof active !== 'boolean') return res.status(400).json({ error: 'active debe ser boolean' });
  try {
    const { rows } = await pool.query(
      'UPDATE products SET active = $1 WHERE id = $2 RETURNING id, active',
      [active, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { getAll, getOne, create, update, remove, uploadImage, deleteImage, updateVariantStock, toggleActive };
