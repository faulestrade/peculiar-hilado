const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');

const BANNER_QUERY = `
  SELECT b.*, b.image_url as banner_image_url, p.name as product_name, p.slug as product_slug, p.price as product_price,
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1) as product_image
  FROM banners b
  LEFT JOIN products p ON b.product_id = p.id
`;

async function getActive(req, res) {
  try {
    const { rows } = await pool.query(`${BANNER_QUERY} WHERE b.active = true ORDER BY b.id DESC LIMIT 1`);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function getAll(req, res) {
  try {
    const { rows } = await pool.query(`${BANNER_QUERY} ORDER BY b.id DESC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function upsert(req, res) {
  const { id, product_id, title, subtitle, cta_text, active } = req.body;
  try {
    if (id) {
      const { rows } = await pool.query(
        `UPDATE banners SET product_id=$1, title=$2, subtitle=$3, cta_text=$4, active=$5 WHERE id=$6 RETURNING *`,
        [product_id || null, title || null, subtitle || null, cta_text || 'Ver producto', active ?? false, id]
      );
      if (active) await pool.query('UPDATE banners SET active = false WHERE id != $1', [id]);
      return res.json(rows[0]);
    }
    if (active) await pool.query('UPDATE banners SET active = false');
    const { rows } = await pool.query(
      `INSERT INTO banners (product_id, title, subtitle, cta_text, active) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [product_id || null, title || null, subtitle || null, cta_text || 'Ver producto', active ?? false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function uploadImage(req, res) {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'banners', resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });
    await pool.query('UPDATE banners SET image_url = $1 WHERE id = $2', [result.secure_url, id]);
    res.json({ image_url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
}

async function toggleActive(req, res) {
  const { id } = req.params;
  const { active } = req.body;
  try {
    if (active) await pool.query('UPDATE banners SET active = false');
    const { rows } = await pool.query('UPDATE banners SET active = $1 WHERE id = $2 RETURNING *', [active, id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT image_url FROM banners WHERE id = $1', [id]);
    const url = rows[0]?.image_url;
    if (url && url.includes('cloudinary')) {
      const publicId = url.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    await pool.query('DELETE FROM banners WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { getActive, getAll, upsert, uploadImage, toggleActive, remove };
